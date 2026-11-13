"""Tile screenshots into one contact sheet: python tools/grid.py out.png a.png b.png ..."""
import sys
from PIL import Image
out, files = sys.argv[1], sys.argv[2:]
ims = [Image.open(f).convert('RGB').resize((720, 450)) for f in files]
sheet = Image.new('RGB', (1440, 450 * ((len(ims) + 1) // 2)))
for i, im in enumerate(ims):
    sheet.paste(im, ((i % 2) * 720, (i // 2) * 450))
sheet.save(out)
