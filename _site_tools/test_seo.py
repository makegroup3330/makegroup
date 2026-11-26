"""Verify discoverability and preserve the deployed UI and measurement scripts."""
import json
import subprocess
import unittest
from pathlib import Path
from urllib.parse import urlsplit
from xml.etree import ElementTree
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
BASE = 'https://makegroup.co.kr/'

class SEOTests(unittest.TestCase):
    def test_indexable_pages_have_unique_consistent_metadata(self):
        titles, descriptions, urls = [], [], []
        for p in ROOT.glob('*.html'):
            s = BeautifulSoup(p.read_text(encoding='utf-8'), 'html.parser')
            if 'noindex' in s.find('meta', attrs={'name': 'robots'}).get('content', ''):
                continue
            with self.subTest(page=p.name):
                title = s.title.get_text()
                desc = s.find('meta', attrs={'name': 'description'})['content']
                url = s.find('link', rel='canonical')['href']
                titles.append(title); descriptions.append(desc); urls.append(url)
                self.assertTrue(url.startswith(BASE))
                self.assertEqual(s.find('meta', attrs={'property': 'og:url'})['content'], url)
                self.assertEqual(s.find('meta', attrs={'name': 'twitter:title'})['content'], title)
                self.assertEqual(s.find('meta', attrs={'name': 'twitter:description'})['content'], desc)
                image = s.find('meta', attrs={'property': 'og:image'})['content']
                self.assertEqual(s.find('meta', attrs={'name': 'twitter:image'})['content'], image)
                self.assertTrue(s.find('meta', attrs={'property': 'og:image:alt'})['content'])
                nodes = json.loads(s.select_one('script[type="application/ld+json"]').string)
                page = next(n for n in nodes if n.get('@type') in ['WebPage', 'CollectionPage', 'ContactPage'])
                self.assertEqual(page['isPartOf']['@id'], BASE + '#website')
                self.assertEqual(page['url'], url)
                if p.name.startswith('project-'):
                    work = next(n for n in nodes if n.get('@type') == 'CreativeWork')
                    self.assertEqual(work['image'], image)
                    self.assertEqual(page['mainEntity']['@id'], work['@id'])
        self.assertEqual(len(urls), 43)
        for values in [titles, descriptions, urls]:
            self.assertEqual(len(values), len(set(values)))
        sitemap = ElementTree.parse(ROOT / 'sitemap.xml')
        locs = [e.text for e in sitemap.findall('.//{*}loc')]
        self.assertEqual(set(locs), set(urls))

    def test_home_site_name_and_portfolio_match_actual_pages(self):
        home = BeautifulSoup((ROOT / 'index.html').read_text(encoding='utf-8'), 'html.parser')
        nodes = json.loads(home.select_one('script[type="application/ld+json"]').string)
        site = next(n for n in nodes if n.get('@type') == 'WebSite')
        self.assertEqual(site['url'], BASE)
        listing = BeautifulSoup((ROOT / 'projects.html').read_text(encoding='utf-8'), 'html.parser')
        nodes = json.loads(listing.select_one('script[type="application/ld+json"]').string)
        items = next(n for n in nodes if n.get('@type') == 'CollectionPage')['mainEntity']
        self.assertEqual(items['numberOfItems'], 37)
        self.assertEqual(len(items['itemListElement']), 37)
        self.assertEqual([i['position'] for i in items['itemListElement']], list(range(1, 38)))
        for entry in items['itemListElement']:
            item = entry['item']
            target = ROOT / urlsplit(item['url']).path.lstrip('/')
            detail = BeautifulSoup(target.read_text(encoding='utf-8'), 'html.parser')
            self.assertEqual(item['name'], detail.h1.get_text(' ', strip=True))

    def test_visible_documents_and_runtime_scripts_are_unchanged(self):
        base = '1698e258206d68daa5ae4be4fe5109ecd6bb29c2'
        for p in ROOT.glob('*.html'):
            with self.subTest(page=p.name):
                old = subprocess.check_output(['git', 'show', base + ':' + p.name], cwd=ROOT).decode('utf-8').replace('\r\n', '\n')
                new = p.read_text(encoding='utf-8')
                if '</head>' not in old:
                    self.assertEqual(new, old)
                    continue
                self.assertEqual(new.split('</head>', 1)[1], old.split('</head>', 1)[1])
                before = BeautifulSoup(old, 'html.parser')
                after = BeautifulSoup(new, 'html.parser')
                self.assertEqual([str(s) for s in after.find_all('script') if s.get('type') != 'application/ld+json'],
                    [str(s) for s in before.find_all('script') if s.get('type') != 'application/ld+json'])
                self.assertEqual([str(s) for s in after.select('link[rel="stylesheet"]')],
                    [str(s) for s in before.select('link[rel="stylesheet"]')])
        changed = subprocess.check_output(['git', 'diff', '--name-only', base], cwd=ROOT, stderr=subprocess.DEVNULL).decode().splitlines()
        self.assertFalse(any(name.startswith('assets/') or name.startswith('preview/') for name in changed))

    def test_receipt_and_error_page_remain_noindex(self):
        for name in ['inquiry-complete.html', '404.html']:
            s = BeautifulSoup((ROOT / name).read_text(encoding='utf-8'), 'html.parser')
            self.assertIn('noindex', s.find('meta', attrs={'name': 'robots'})['content'])

if __name__ == '__main__':
    unittest.main()
