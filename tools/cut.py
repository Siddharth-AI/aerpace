import sys
from rembg import remove, new_session
from PIL import Image
sess = new_session(sys.argv[1] if len(sys.argv)>1 else "isnet-general-use")
for n in ["wing_top","wing_studio","wing_hangar","wing_fans"]:
    im = Image.open(f"src/{n}.jpg").convert("RGB")
    out = remove(im, session=sess, post_process_mask=True)
    out.save(f"cut/{n}.png")
    print(n, out.size, out.getbbox())
