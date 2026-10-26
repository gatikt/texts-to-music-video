# usage: <venv-python> tools/print_photo.py NNN W H ink1 ink2 [cx cy]   → assets/pNNN.png (riso halftone print)
# inks: pink blue orange green butter (ink1 = main dots, ink2 = shadow layer). cx/cy = crop focus 0..1.
import sys
if len(sys.argv) < 6 or sys.argv[1] in ('-h', '--help'):
    print('usage: <venv-python> tools/print_photo.py NNN W H ink1 ink2 [cx cy]   (run from build/; reads photos/orig/NNN.jpg, writes assets/pNNN.png)\n  inks: pink blue orange green butter (ink1 = main dots, ink2 = shadow layer). cx/cy = crop focus 0..1.')
    sys.exit(0 if len(sys.argv) > 1 and sys.argv[1] in ('-h', '--help') else 2)
sys.path.insert(0, 'tools')
import halftone; halftone.ImageOps.exif_transpose = lambda im: im  # sips already baked rotation; EXIF tag would double-rotate
from halftone import riso
INK = {'pink': (255, 72, 176), 'blue': (0, 120, 191), 'orange': (255, 102, 48), 'green': (0, 150, 110), 'butter': (240, 190, 40)}
n, w, h, a, b = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), sys.argv[4], sys.argv[5]
cx = float(sys.argv[6]) if len(sys.argv) > 6 else .5; cy = float(sys.argv[7]) if len(sys.argv) > 7 else .5
riso(f'photos/orig/{n}.jpg', f'assets/p{n}.png', w, h, INK[a], INK[b], 7, cx, cy); print(f'assets/p{n}.png')
