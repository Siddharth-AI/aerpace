# Run from tools/: python3 v2.py [luts|plates|cutouts|outlines|videos|seq|all]
"""aerpace v2 'Open Air' grade: soft daylight / blue-hour split tone. Re-art-directs the client renders again,
this time for a light, airy site. Also produces new cutouts and vector outlines of the aircraft."""
import os, sys, json, subprocess
import numpy as np, cv2
from PIL import Image, ImageFilter
from looks import f32, u8, lum, ramp, grain, cover
import media as M

OUT = os.environ.get("AERPACE_MEDIA_OUT", "../public/media")
rng = np.random.default_rng(3)

# blue-hour shadows → mist mids → warm paper highlights
DAY = ramp([(0, (30, 36, 44)), (.22, (64, 74, 86)), (.5, (138, 148, 158)), (.78, (214, 213, 208)), (1, (249, 246, 240))])
DUSK = ramp([(0, (24, 29, 37)), (.3, (60, 70, 84)), (.6, (150, 156, 168)), (.85, (232, 210, 196)), (1, (250, 238, 226))])
STUDIO = ramp([(0, (22, 25, 30)), (.35, (92, 98, 106)), (.7, (196, 198, 198)), (1, (246, 244, 239))])

def grade(a, mode):
    L = lum(a)
    if mode == "day":    g = DAY(np.clip((L ** .82 - .5) * .98 + .5, 0, 1)); k = .08
    elif mode == "dusk": g = DUSK(np.clip((L ** .72 - .5) * 1.0 + .5, 0, 1)); k = .12
    elif mode == "studio": g = STUDIO(np.clip((L ** .9 - .5) * 1.02 + .5, 0, 1)); k = .1
    elif mode == "ink":
        g = ramp([(0, (244, 241, 235)), (.25, (226, 214, 204)), (.6, (120, 112, 112)), (1, (24, 28, 34))])(np.clip(L ** .55, 0, 1)); k = 0
    elif mode == "doc":  g = ramp([(0, (34, 30, 28)), (.55, (140, 122, 108)), (1, (246, 236, 224))])(np.clip((L - .5) * 1.2 + .5, 0, 1)); k = .08
    else: raise ValueError(mode)
    return np.clip(g * (1 - k) + a * k, 0, 1)

def soft_vignette(a, s=.18):
    h, w = a.shape[:2]; y, x = np.mgrid[0:h, 0:w]
    d = np.sqrt(((x - w / 2) / (w / 2)) ** 2 + ((y - h / 2) / (h / 2)) ** 2)
    return a * (1 - s * np.clip(d - .5, 0, 1) ** 2)[..., None]

def plate(src, out, mode="day", W=2000, ratio=None, fx=.5, fy=.5, q=80):
    im = Image.open(src).convert("RGB")
    W = min(W, int(im.width * 1.35))
    if ratio: im = cover(im, W, int(W / ratio), fx, fy)
    else: im = im.resize((W, int(im.height * W / im.width)), Image.LANCZOS)
    g = grade(f32(im), mode)
    g = grain(soft_vignette(g), .016)
    u8(g).save(f"{OUT}/{out}", "WEBP", quality=q, method=5)

MODES = {"graphite": "dusk", "bright": "day", "studio": "studio", "ember": "dusk", "doc": "doc", "day": "day"}

def plates():
    for src, out, mode, W, ratio, fx, fy, warm in M.IMAGES:
        name = out.replace("img/", "").replace(".jpg", ".webp")
        md = "ink" if (name.startswith("car-") or name == "volt-panel.webp") else MODES[mode]
        plate(src, f"img/{name}", md, W, ratio, fx, fy)
    for i, n in enumerate(M.RACERS):
        r = 16 / 9 if i == 0 else (4 / 5 if i == 1 else 3 / 2)
        plate(M.R + n + ".jpg", f"img/racers-{i:02d}.webp", "doc", 1600 if i == 0 else 1100, r, .5, .45)
    plate(M.D + "img-aerdock-core-bg@2x.jpg", "img/dock-core.webp", "dusk", 2000, 16 / 9)
    plate(M.D + "img-aerdock-core-bg@2x.jpg", "img/dock-core-day.webp", "day", 2000, 16 / 9)
    print("plates ok")

# ------------------------------------------------------------------ cutouts on transparent, daylight graded
def cut_grade(rgba, mode="studio", gamma=1.0):
    a = f32(rgba); rgb = grade(a[..., :3] ** gamma, mode)
    return Image.fromarray((np.concatenate([rgb, a[..., 3:]], -1) * 255).astype(np.uint8), "RGBA")

def trim(im): return im.crop(im.getbbox())

def cutouts():
    from rembg import remove, new_session
    sess = new_session("isnet-general-use")
    srcs = {"front": M.L + "img-hardware-4.jpg", "rear": M.V + "image-gallery-1.jpg", "hover": M.V + "img-feature-superwing.jpg",
            "three": M.W + "hero-bg-ground@2x.jpg", "pod": M.V + "image-gallery-2.jpg"}
    os.makedirs("cut", exist_ok=True)
    for k, s in srcs.items():
        p = f"cut/{k}.png"
        if not os.path.exists(p):
            remove(Image.open(s).convert("RGB"), session=sess, post_process_mask=True).save(p)
    views = {"side": "cut/wing_studio.png", "top": "cut/wing_top.png", "front": "cut/front.png", "rear": "cut/rear.png", "hover": "cut/hover.png", "three": "cut/three.png"}
    for k, p in views.items():
        im = trim(Image.open(p).convert("RGBA"))
        if k == "three":  # hangar shot includes a person and floor; keep the biggest blob only
            A = np.array(im)[..., 3]
            n, lab, stats, _ = cv2.connectedComponentsWithStats((A > 128).astype(np.uint8))
            big = 1 + np.argmax(stats[1:, cv2.CC_STAT_AREA])
            m = (lab == big).astype(np.uint8) * 255
            m = cv2.dilate(m, np.ones((5, 5), np.uint8))
            arr = np.array(im); arr[..., 3] = np.minimum(arr[..., 3], m); im = trim(Image.fromarray(arr))
        scale = 1.6 if im.width < 1300 else 1.0
        if scale != 1: im = im.resize((int(im.width * scale), int(im.height * scale)), Image.LANCZOS)
        g = cut_grade(im, "studio", .95)
        g.save(f"{OUT}/cut/v-{k}.webp", "WEBP", quality=88, method=6)
        print("view", k, g.size)

# ------------------------------------------------------------------ vector outlines (SVG) from the alpha + inner edges
def outline_svg(path, out, inner=True, eps=1.2, minlen=40):
    im = trim(Image.open(path).convert("RGBA"))
    W = 1200; s = W / im.width; im = im.resize((W, int(im.height * s)), Image.LANCZOS)
    a = np.array(im); A = (a[..., 3] > 128).astype(np.uint8) * 255
    H = A.shape[0]
    paths = []
    cs, _ = cv2.findContours(A, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    for c in cs:
        if cv2.arcLength(c, True) < 200: continue
        ap = cv2.approxPolyDP(c, eps, True).reshape(-1, 2)
        paths.append(("o", "M" + "L".join(f"{x},{y}" for x, y in ap) + "Z"))
    if inner:
        L = cv2.cvtColor(a[..., :3], cv2.COLOR_RGB2GRAY)
        L = cv2.bilateralFilter(L, 7, 30, 7)
        e = cv2.Canny(L, 30, 90)
        e = cv2.bitwise_and(e, cv2.erode(A, np.ones((9, 9), np.uint8)))
        ci, _ = cv2.findContours(e, cv2.RETR_LIST, cv2.CHAIN_APPROX_NONE)
        ci = sorted(ci, key=lambda c: -cv2.arcLength(c, False))[:140]
        for c in ci:
            if cv2.arcLength(c, False) < minlen: continue
            ap = cv2.approxPolyDP(c, eps, False).reshape(-1, 2)
            if len(ap) < 2: continue
            paths.append(("i", "M" + "L".join(f"{x},{y}" for x, y in ap)))
    svg = {"w": W, "h": H, "paths": paths}
    json.dump(svg, open(out, "w"))
    print("svg", out, W, H, len(paths), sum(len(p[1]) for p in paths) // 1024, "KB")

def outlines():
    os.makedirs(f"{OUT}/vec", exist_ok=True)
    outline_svg("cut/wing_top.png", f"{OUT}/vec/top.json")
    outline_svg("cut/wing_studio.png", f"{OUT}/vec/side.json")

def luts():
    M.write_cube("luts/day.cube", lambda a: grade(a, "day"))
    M.write_cube("luts/dusk.cube", lambda a: grade(a, "dusk"))
    def holo2(a):
        g = grade(a, "dusk")
        hsv = cv2.cvtColor((np.clip(a, 0, 1) * 255).astype(np.uint8), cv2.COLOR_RGB2HSV).astype(np.float32)
        hue = hsv[..., 0] * 2; sat = hsv[..., 1] / 255; val = hsv[..., 2] / 255
        w = sat * np.exp(-((hue - 186) / 22) ** 2)
        tint = (val[..., None] ** .9) * np.array([.98, .62, .46]) * 1.05
        return np.clip(g * (1 - w[..., None]) + tint * w[..., None], 0, 1)
    M.write_cube("luts/holo2.cube", holo2)
    print("luts ok")

def vid(src, out, ss, t, lut, W=1280, crf=27, speed=1.0):
    vf = f"lut3d=luts/{lut}.cube,scale={W}:-2:flags=lanczos"
    if speed != 1.0: vf = f"setpts={1 / speed}*PTS," + vf
    vf += ",noise=alls=3:allf=t"
    M.ff(["-ss", str(ss), "-t", str(t), "-i", src, "-vf", vf, "-an", "-c:v", "libx264", "-preset", "slow", "-crf", str(crf),
          "-pix_fmt", "yuv420p", "-movflags", "+faststart", f"{OUT}/video/{out}.mp4"])
    M.ff(["-ss", "0.2", "-i", f"{OUT}/video/{out}.mp4", "-frames:v", "1", "-q:v", "4", f"{OUT}/video/{out}.jpg"])
    print("video", out, os.path.getsize(f"{OUT}/video/{out}.mp4") // 1024, "KB")

def videos():
    vid(M.V3, "drive-holo", 0, 7.2, "holo2")
    vid(M.V4, "liftoff", 18, 10, "dusk")
    vid(M.V4, "arrival", 32.2, 9.6, "dusk")
    vid(M.V4, "tunnel", 42, 6, "dusk")
    vid(M.V6, "clouds", 0, 12, "day", W=1920, crf=28)
    vid(M.V1, "shield", 0, 12.8, "dusk")
    vid(M.V5, "maketime", 0, 4.2, "day", W=1600)

def seq():
    d = f"{OUT}/seq/dock"
    for f in os.listdir(d): os.remove(os.path.join(d, f))
    tmp = "seqtmp"
    for f in os.listdir(tmp): os.remove(os.path.join(tmp, f))
    idx = 0
    for a, b in [(0, 11.5), (18, 28), (32.2, 48.5)]:
        M.ff(["-ss", str(a), "-t", str(b - a), "-i", M.V4, "-vf", "fps=4.2,lut3d=luts/dusk.cube,scale=1120:-2:flags=lanczos", "-start_number", str(idx), f"{tmp}/f%04d.png"])
        idx = len(os.listdir(tmp))
    for i, f in enumerate(sorted(os.listdir(tmp))):
        Image.open(f"{tmp}/{f}").convert("RGB").save(f"{d}/{i:03d}.webp", quality=60, method=5)
    print("seq", len(os.listdir(d)))

if __name__ == "__main__":
    job = sys.argv[1] if len(sys.argv) > 1 else "all"
    for name, fn in [("luts", luts), ("plates", plates), ("cutouts", cutouts), ("outlines", outlines), ("videos", videos), ("seq", seq)]:
        if job in (name, "all"): fn()
