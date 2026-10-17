"""Regression checks for transparent artwork and ordinary photograph encoding."""
import tempfile
from pathlib import Path
import unittest
from PIL import Image
from image_assets import write_webp


class ImageAssetsTests(unittest.TestCase):
    def encode(self, source):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / 'test.webp'
            write_webp(source, path, 64)
            with Image.open(path) as decoded:
                return decoded.copy()

    def test_hidden_rgb_does_not_become_visible_background(self):
        source = Image.new('RGBA', (64, 64), (162, 162, 162, 0))
        source.paste((230, 220, 210, 255), (16, 16, 48, 48))
        decoded = self.encode(source)
        self.assertEqual(decoded.getpixel((0, 0))[3], 0)
        self.assertEqual(decoded.getpixel((32, 32))[3], 255)
        white = Image.new('RGBA', decoded.size, 'white')
        white.alpha_composite(decoded)
        self.assertEqual(white.getpixel((0, 0)), (255, 255, 255, 255))

    def test_partial_alpha_is_preserved(self):
        decoded = self.encode(Image.new('RGBA', (64, 64), (0, 0, 0, 128)))
        self.assertEqual(decoded.getchannel('A').getextrema(), (128, 128))

    def test_palette_transparency_is_preserved(self):
        source = Image.new('P', (64, 64))
        source.putpalette([162, 162, 162] + [0] * 765)
        source.info['transparency'] = 0
        self.assertEqual(self.encode(source).getchannel('A').getextrema(), (0, 0))

    def test_ordinary_rgb_photograph_stays_rgb(self):
        decoded = self.encode(Image.new('RGB', (128, 96), (100, 120, 140)))
        self.assertEqual(decoded.mode, 'RGB')
        self.assertEqual(decoded.size, (64, 48))


if __name__ == '__main__':
    unittest.main()
