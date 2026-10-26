import sys, math
from PIL import Image, ImageOps, ImageDraw, ImageFilter, ImageEnhance
PAPER=(242,235,221); 
def fit(im, w, h, cx=0.5, cy=0.5):
    s=max(w/im.width, h/im.height); im=im.resize((round(im.width*s), round(im.height*s)), Image.LANCZOS)
    x=int((im.width-w)*cx); y=int((im.height-h)*cy); return im.crop((x,y,x+w,y+h))
def screen(gray, cell, angle, scale=2):
    W,H=gray.size; big=Image.new('L',(W*scale,H*scale),0); d=ImageDraw.Draw(big)
    a=math.radians(angle); ca,sa=math.cos(a),math.sin(a); R=int(math.hypot(W,H)/cell)+2
    px=gray.load()
    for i in range(-R,R):
        for j in range(-R,R):
            x=(i*ca-j*sa)*cell+W/2; y=(i*sa+j*ca)*cell+H/2
            if 0<=x<W and 0<=y<H:
                v=1-px[int(x),int(y)]/255
                r=cell*0.62*math.sqrt(v)*scale
                if r>0.4: d.ellipse([x*scale-r,y*scale-r,x*scale+r,y*scale+r],fill=255)
    return big.resize((W,H),Image.LANCZOS)
def riso(src,out,w,h,ink1,ink2,cell=10,cx=.5,cy=.5,contrast=1.5):
    im=ImageOps.exif_transpose(Image.open(src)).convert('RGB'); im=fit(im,w,h,cx,cy)
    g=ImageOps.autocontrast(ImageOps.grayscale(im),cutoff=1); g=g.filter(ImageFilter.UnsharpMask(8,120,2)); g=g.point(lambda v: int(255*((v/255)**0.7)))
    base=Image.new('RGB',(w,h),PAPER)
    m2=screen(g.point(lambda v: 255 if v>70 else int(v*3.6)),cell*1.15,75)  # shadows layer
    m1=screen(g,cell,15)
    l2=Image.new('RGB',(w,h),ink2); base=Image.composite(Image.blend(base,Image.eval(base,lambda c:c),0),base,m2)  # noop keep
    def mult(b,ink,mask,off):
        mask=mask.transform(mask.size,Image.AFFINE,(1,0,-off[0],0,1,-off[1]))
        inkl=Image.new('RGB',b.size,ink); prod=Image.composite(Image.eval(Image.merge('RGB',[Image.eval(c,lambda x:x) for c in b.split()]),lambda x:x),b,mask)
        from PIL import ImageChops
        return Image.composite(ImageChops.multiply(b,inkl),b,mask)
    base=mult(base,ink2,m2,(4,3)); base=mult(base,ink1,m1,(0,0))
    base.save(out)
if __name__=='__main__':
    # usage: python3 tools/halftone.py <src.jpg> <out.png> W H  → pink/blue riso print (use print_photo.py for the usual path)
    if len(sys.argv) < 5 or sys.argv[1] in ('-h', '--help'):
        print('usage: python3 tools/halftone.py <src.jpg> <out.png> W H   (pink/blue riso print; print_photo.py is the usual path)')
        sys.exit(0 if len(sys.argv) > 1 and sys.argv[1] in ('-h', '--help') else 2)
    PINK=(255,72,176); BLUE=(0,120,191)
    src,out,w,h=sys.argv[1],sys.argv[2],int(sys.argv[3]),int(sys.argv[4])
    riso(src,out,w,h,PINK,BLUE,7); print(out)
