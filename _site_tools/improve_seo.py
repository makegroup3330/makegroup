"""Enrich existing head metadata without reserializing the visible document."""
import html
import json
import re
from pathlib import Path
from urllib.parse import urljoin
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
BASE = 'https://makegroup.co.kr/'
SITE = BASE + '#website'
ORG = BASE + '#organization'

def improve(path):
    original = path.read_text(encoding='utf-8')
    soup = BeautifulSoup(original, 'html.parser')
    if soup.find('meta', attrs={'name': 'robots'}) and 'noindex' in soup.find('meta', attrs={'name': 'robots'}).get('content', ''):
        return False
    canonical = soup.find('link', rel='canonical')['href']
    title = soup.title.get_text()
    description = soup.find('meta', attrs={'name': 'description'})['content']
    image = soup.find('meta', attrs={'property': 'og:image'})['content']
    schemas = json.loads(soup.select_one('script[type="application/ld+json"]').string)
    page = next(x for x in schemas if x.get('@type') in ['WebPage', 'CollectionPage', 'ContactPage'])
    page.update({'@id': canonical + '#webpage', 'isPartOf': {'@id': SITE}, 'publisher': {'@id': ORG}})
    if path.name == 'contact.html':
        page['@type'] = 'ContactPage'
    if path.name in ['projects.html', 'architecture.html']:
        page['@type'] = 'CollectionPage'
    if path.name == 'index.html':
        schemas = [x for x in schemas if x.get('@type') != 'WebSite']
        schemas.append({'@context': 'https://schema.org', '@type': 'WebSite', '@id': SITE,
            'url': BASE, 'name': '메이크그룹', 'alternateName': ['메이크 그룹', 'MAKE GROUP'],
            'inLanguage': 'ko-KR', 'publisher': {'@id': ORG}})
    if re.fullmatch(r'project-\d+\.html', path.name):
        work = next(x for x in schemas if x.get('@type') == 'CreativeWork')
        work.update({'@id': canonical + '#project', 'image': image, 'mainEntityOfPage': {'@id': page['@id']}})
        page['mainEntity'] = {'@id': work['@id']}
    if path.name == 'projects.html':
        entries = []
        seen = set()
        for a in soup.select('main a[href^="project-"]'):
            href = a.get('href')
            if href in seen:
                continue
            seen.add(href)
            target = BeautifulSoup((ROOT / href).read_text(encoding='utf-8'), 'html.parser')
            entries.append({'@type': 'ListItem', 'position': len(entries) + 1,
                'item': {'@type': 'CreativeWork', '@id': urljoin(BASE, href) + '#project',
                    'url': urljoin(BASE, href), 'name': target.h1.get_text(' ', strip=True),
                    'image': target.find('meta', attrs={'property': 'og:image'})['content']}})
        page['mainEntity'] = {'@type': 'ItemList', 'numberOfItems': len(entries), 'itemListElement': entries}
    # Existing og:image describes each page's actual portfolio art; retain it.
    image_alt = soup.h1.get_text(' ', strip=True) if path.name.startswith('project-') else title.split(' | ')[0]
    additions = {
        ('property', 'og:image:alt'): image_alt,
        ('name', 'twitter:title'): title,
        ('name', 'twitter:description'): description,
        ('name', 'twitter:image'): image,
        ('name', 'twitter:image:alt'): image_alt,
    }
    text = re.sub(r'<script\b[^>]*type="application/ld\+json"[^>]*>.*?</script>',
        lambda _: '<script type="application/ld+json">' + json.dumps(schemas, ensure_ascii=False).replace('</', '<\\/') + '</script>',
        original, count=1, flags=re.S)
    new_tags = []
    for (attr, name), value in additions.items():
        tag = '<meta ' + attr + '="' + name + '" content="' + html.escape(value, quote=True) + '"/>'
        pattern = r'<meta\b(?=[^>]*' + attr + '="' + re.escape(name) + r'")[^>]*>'
        if re.search(pattern, text):
            text = re.sub(pattern, lambda _: tag, text, count=1)
        else:
            new_tags.append(tag)
    text = text.replace('</head>', ''.join(new_tags) + '</head>', 1)
    assert text.split('</head>', 1)[1] == original.split('</head>', 1)[1], path.name
    if text == original:
        return False
    path.write_text(text, encoding='utf-8', newline='')
    return True

if __name__ == '__main__':
    changed = [p.name for p in sorted(ROOT.glob('*.html')) if improve(p)]
    print(json.dumps({'changed': changed, 'count': len(changed)}, ensure_ascii=False))
