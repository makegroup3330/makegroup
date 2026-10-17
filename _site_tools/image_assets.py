"""Encode existing artwork without discarding PNG transparency."""
from PIL import Image, ImageOps
from pathlib import Path
import tempfile


def web_image(source):
    image = ImageOps.exif_transpose(source)
    has_alpha = 'A' in image.getbands() or 'transparency' in image.info
    return image.convert('RGBA' if has_alpha else 'RGB')


def write_webp(source, destination, width):
    image = web_image(source)
    image.thumbnail((width, width * 3), Image.Resampling.LANCZOS)
    destination = Path(destination)
    with tempfile.NamedTemporaryFile(dir=destination.parent, suffix='.webp', delete=False) as handle:
        temporary = Path(handle.name)
    try:
        image.save(temporary, 'WEBP', quality=83, method=6, alpha_quality=100)
        temporary.replace(destination)
    finally:
        temporary.unlink(missing_ok=True)
    return image
