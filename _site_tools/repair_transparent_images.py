"""Rebuild the PNG artwork affected by the old RGB-only conversion."""
from pathlib import Path
import hashlib
import json
import re
import shutil
from PIL import Image, ImageChops
from image_assets import write_webp

ROOT = Path(__file__).resolve().parents[1]
VERSION = '20261018-alpha'
# These paths were checked against the original site's image references. Other
# files sharing a stem (e.g. 022.png / 022.jpg) must not replace unrelated work.
SOURCES = ['028.png', '154.png'] + [f'{n}.png' for n in range(230, 239)]


def repair():
    records = []
    for name in SOURCES:
        path = ROOT / 'assets/wix' / name
        with Image.open(path) as original:
            assert 'A' in original.getbands() and original.getchannel('A').getextrema()[0] < 255
            record = {'source': 'assets/wix/' + name,
                      'source_sha256': hashlib.sha256(path.read_bytes()).hexdigest(),
                      'source_size': original.size, 'variants': []}
            for width in [640, 1600]:
                relative = f'assets/optimized/{path.stem}-{width}.webp'
                target = ROOT / relative
                assert target.exists(), target
                expected = write_webp(original, target, width)
                with Image.open(target) as decoded:
                    assert decoded.mode == 'RGBA', target
                    assert decoded.size == expected.size, target
                    # RGB is compressed; the alpha mask must remain exact.
                    assert ImageChops.difference(decoded.getchannel('A'), expected.getchannel('A')).getbbox() is None, target
                shutil.copy2(target, ROOT / 'preview' / relative)
                record['variants'].append({'path': relative, 'size': expected.size,
                                           'bytes': target.stat().st_size,
                                           'alpha_mask_exact': True})
            records.append(record)

    stems = '|'.join(Path(name).stem for name in SOURCES)
    pattern = re.compile(r'(assets/optimized/(?:' + stems + r')-(?:640|1600)\.webp)(?!\?)')
    changed = []
    for folder in [ROOT, ROOT / 'preview']:
        for page in folder.glob('*.html'):
            old = page.read_text(encoding='utf-8')
            new, count = pattern.subn(r'\1?v=' + VERSION, old)
            if count:
                page.write_text(new, encoding='utf-8')
                changed.append({'page': str(page.relative_to(ROOT)), 'updated_references': count})
    report = {'version': VERSION, 'cause': 'RGB-only conversion discarded source alpha and exposed hidden background pixels.',
              'repair': 'Preserve original alpha in WebP; artwork and source PNG files are unchanged.',
              'sources': records, 'pages': changed}
    (ROOT / '_site_tools/transparency-repair-20261018.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({'repaired_sources': len(records), 'webp_files_including_preview': len(records) * 4,
                      'updated_pages': len(changed), 'alpha_masks_exact': True}, ensure_ascii=False))


if __name__ == '__main__':
    repair()
