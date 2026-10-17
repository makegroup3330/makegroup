"""Build GitHub Pages, or switch the reviewed design and original content."""
import argparse,json,re,shutil,subprocess
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit,unquote

ROOT=Path(__file__).resolve().parents[1]
CONTROL=ROOT/'_site_tools'
BASE='https://makegroup.co.kr/'
def git(*args):return subprocess.check_output(['git','-C',str(ROOT),*args])
def original_files():
 ref=(CONTROL/'original-ref.txt').read_text().strip()
 names=git('ls-tree','--name-only',ref).decode().splitlines()
 return ref,[n for n in names if n.endswith('.html') or n in ['robots.txt','sitemap.xml','.nojekyll','CNAME']]
def candidate_files():return list((ROOT/'preview').glob('*.html'))
def live_html(text,name):
 text=re.sub(r'(<meta\b[^>]*name="robots"[^>]*content=")[^"]*',r'\1index,follow,max-image-preview:large',text)
 # BeautifulSoup serializes content before name; handle either attribute order.
 text=re.sub(r'<meta\b(?=[^>]*name="robots")[^>]*>', '<meta name="robots" content="index,follow,max-image-preview:large"/>',text)
 text=text.replace(BASE+'preview/assets/',BASE+'assets/').replace('href="/preview/"','href="/"')
 if name=='404.html':text=re.sub(r'<meta\b(?=[^>]*name="robots")[^>]*>','<meta name="robots" content="noindex"/>',text)
 return text
def sitemap(names):
 return '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+''.join('<url><loc>'+BASE+('' if n=='index.html' else n)+'</loc></url>' for n in names if n.endswith('.html') and n!='404.html')+'</urlset>'
def switch(mode):
 if mode=='keep':return
 if mode=='apply_design':
  files=candidate_files()
  assert len(files)==44,'Expected 43 content pages and one error page'
  for f in files:(ROOT/f.name).write_text(live_html(f.read_text(encoding='utf-8'),f.name),encoding='utf-8')
  shutil.copytree(ROOT/'preview/assets',ROOT/'assets',dirs_exist_ok=True)
  (ROOT/'sitemap.xml').write_text(sitemap([f.name for f in files]),encoding='utf-8')
  (ROOT/'robots.txt').write_text('User-agent: *\nAllow: /\nDisallow: /preview/\nSitemap: '+BASE+'sitemap.xml\n',encoding='utf-8')
  active='redesign'
 elif mode=='restore_original':
  ref,names=original_files()
  for name in names:(ROOT/name).write_bytes(git('show',ref+':'+name))
  if '404.html' not in names:(ROOT/'404.html').unlink(missing_ok=True)
  robots=ROOT/'robots.txt';text=robots.read_text(encoding='utf-8')
  if 'Disallow: /preview/' not in text:text=text.replace('User-agent: *','User-agent: *\nDisallow: /preview/')
  robots.write_text(text,encoding='utf-8');active='original'
 else:raise ValueError(mode)
 if (ROOT/'CNAME').read_text().strip()!='makegroup.co.kr':(ROOT/'CNAME').write_text('makegroup.co.kr\n')
 (CONTROL/'active-site.txt').write_text(active+'\n')
class Links(HTMLParser):
 def __init__(self):super().__init__();self.urls=[];self.noindex=False;self.h1=0
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='h1':self.h1+=1
  if tag=='meta' and a.get('name')=='robots':self.noindex='noindex' in a.get('content','')
  for key in ['href','src','data-image']:
   if a.get(key):self.urls.append(a[key])
  if a.get('srcset'):self.urls.extend(part.strip().split()[0] for part in a['srcset'].split(','))
def validate():
 errors=[];count=0
 for directory in [ROOT,ROOT/'preview']:
  for p in directory.glob('*.html'):
   text=p.read_text(encoding='utf-8');parser=Links();parser.feed(text);count+=1
   if directory.name=='preview' and not parser.noindex:errors.append(str(p)+': missing preview noindex')
   for url in parser.urls:
    if url.startswith(('#','http:','https:','mailto:','tel:','data:','javascript:','/')):continue
    if not (directory/unquote(urlsplit(url).path)).exists():errors.append(str(p)+': missing '+url)
 assert not errors,'\n'.join(errors[:20])
 print(json.dumps({'checkedPages':count,'active':(CONTROL/'active-site.txt').read_text().strip(),'errors':errors}))
def build(destination):
 target=Path(destination).resolve()
 assert target.parent==ROOT and target.name=='_site_build','Build destination must be checkout/_site_build'
 assert not target.exists(),'Use a fresh build destination'
 target.mkdir()
 for p in ROOT.iterdir():
  if p.is_file() and (p.suffix in ['.html','.xml'] or p.name in ['robots.txt','CNAME','.nojekyll']):shutil.copy2(p,target/p.name)
 for name in ['assets','preview']:shutil.copytree(ROOT/name,target/name)
 print('Pages artifact ready: '+str(target))
if __name__=='__main__':
 parser=argparse.ArgumentParser();parser.add_argument('--mode',choices=['keep','apply_design','restore_original'],default='keep');parser.add_argument('--build');args=parser.parse_args()
 switch(args.mode);validate()
 if args.build:build(args.build)
