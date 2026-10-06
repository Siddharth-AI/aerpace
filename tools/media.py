"""Production media for the aerpace site. Every client asset is re-graded, re-cropped or re-staged.
Run: python3 media.py [images|cutouts|lines|india|luts|videos|seq|all]
"""
import sys, os, json, subprocess, math
import numpy as np, cv2
from PIL import Image
from looks import f32, u8, lum, ramp, grade, grain, vignette, cover, VOID, GRAPH, CARBON, BONE, PAPER, SIG

ROOT = os.environ.get("AERPACE_OLD_ASSETS", "./old-assets")
OUT = os.environ.get("AERPACE_MEDIA_OUT", "../public/media")
L = f"{ROOT}/old-website-assets/(landing_page_assets)aerpace - The Future of Transportation/"
V = f"{ROOT}/old-website-assets/(aerVerse_page_assets)aerVerse _ Intercity & Interstate Transportation Ecosystem _ aerpace/"
D = f"{ROOT}/old-website-assets2/(aerDock_page_assets)aerDock - Futuristic Docking Station for aerWings _ aerpace/"
W = f"{ROOT}/old-website-assets2/(aerWing_page_assets)aerWing - Hydrogen-Powered Zero-Emission Drone Technology _ aerpace/"
C = f"{ROOT}/old-website-assets3/(aerCar_page_assets)aerCar _ Redefining Mobility, Elevating Possibility/"
S = f"{ROOT}/old-website-assets3/(aerShield_page_assets)aerShield _ Tactical Drone OS and Combat Ecosystem/"
P = f"{ROOT}/old-website-assets3/(aerVolt_page_assets)aerVolt _ AI driven solar technologies/"
M = f"{ROOT}/old-website-assets4/(MakeTime_page_assets)#MakeTime _ A Movement Beyond Time/"
R = f"{ROOT}/old-website-assets4/(aerpace_page_assets)aerpace - Racers/"

EMBER = ramp([(0, VOID), (.22, (34, 22, 16)), (.5, (150, 66, 24)), (.72, SIG), (.9, (255, 196, 150)), (1, (255, 240, 226))])
DOC = ramp([(0, VOID), (.5, (70, 62, 55)), (.82, SIG), (1, (255, 236, 214))])
DAY = ramp([(0, (40, 40, 40)), (.35, (110, 106, 100)), (.7, (205, 199, 189)), (1, (250, 246, 240))])

def transform(a, mode):
    if mode == "graphite":  return grade(a, keep_color=.08, contrast=1.12, gamma=.8)
    if mode == "bright":    return grade(a, keep_color=.10, contrast=1.14, gamma=.62)
    if mode == "studio":    return grade(a, keep_color=.12, contrast=1.10, gamma=.9)
    if mode == "ember":     return EMBER(np.clip((lum(a) - .5) * 1.15 + .5, 0, 1))
    if mode == "doc":       return DOC(np.clip((lum(a) - .5) * 1.35 + .5, 0, 1))
    if mode == "day":       return DAY(np.clip(lum(a) ** .55, 0, 1))
    raise ValueError(mode)

def warm_light(g, amt, side="right"):
    h, w = g.shape[:2]; x = np.linspace(0, 1, w)[None, :, None]
    if side == "left": x = 1 - x
    return np.clip(g + amt * (x ** 2.2) * (lum(g)[..., None] ** 1.5) * (np.array(SIG) / 255), 0, 1)

def plate(src, out, mode="graphite", W=2000, ratio=None, fx=.5, fy=.5, warm=0, vig=.42, gr=.028, q=80):
    im = Image.open(src).convert("RGB")
    W = min(W, int(im.width * 1.35))
    if ratio:
        H = int(W / ratio); im = cover(im, W, H, fx, fy)
    else:
        H = int(im.height * W / im.width); im = im.resize((W, H), Image.LANCZOS)
    g = transform(f32(im), mode)
    if warm: g = warm_light(g, warm)
    if vig: g = vignette(g, vig)
    if gr: g = grain(g, gr)
    os.makedirs(os.path.dirname(f"{OUT}/{out}"), exist_ok=True)
    u8(g).save(f"{OUT}/{out}", quality=q, optimize=True, progressive=True)

IMAGES = [
    # home
    (L + "hero-bg-home@2x.jpg", "img/sea-dawn.jpg", "graphite", 2000, 16/9, .5, .5, .25),
    (V + "image-gallery-3.jpg", "img/cfg-taxi.jpg", "bright", 1600, 16/10, .5, .45, .15),
    (D + "img-feature-med.jpg", "img/cfg-care.jpg", "bright", 1600, 16/10, .5, .5, .2),
    (L + "img-hardware-4.jpg", "img/cabin-front.jpg", "bright", 1200, 4/5, .5, .45, 0),
    (L + "superwing_home_block_1.jpg", "img/fans.jpg", "bright", 1400, 1, .72, .55, 0),
    (L + "img-hardware-1.jpg", "img/side-macro.jpg", "bright", 1200, 4/5, .5, .5, .1),
    (L + "img-hardware-2.jpg", "img/wing-edge.jpg", "bright", 1200, 4/5, .5, .5, .1),
    (L + "img-hardware-3.jpg", "img/wing-top-macro.jpg", "bright", 1200, 4/5, .5, .5, .1),
    (L + "img-hardware-5.jpg", "img/nose.jpg", "bright", 1200, 4/5, .5, .5, .1),
    (W + "hero-bg-ground@2x.jpg", "img/hangar.jpg", "graphite", 2000, 2.1, .5, .5, .2),
    (D + "hero-bg-aerdock@2x.jpg", "img/dock-top.jpg", "graphite", 2000, 16/9, .5, .5, 0),
    (D + "hero-bg-aerdock@2x.jpg", "img/dock-top-day.jpg", "day", 2000, 16/9, .5, .5, 0),
    (D + "img-aerdock-core-bg@2x.jpg", "img/dock-core.jpg", "graphite", 2000, 16/9, .5, .5, 0),
    (D + "img-aerdock-cut-bg@2x.jpg", "img/dock-mountain.jpg", "graphite", 2000, 2.39, .5, .45, .45),
    (D + "img-aerdock-slider-1.jpg", "img/dock-car-road.jpg", "bright", 1600, 3/2, .5, .5, .2),
    (D + "img-aerdock-slider-2.jpg", "img/dock-bridge.jpg", "bright", 1600, 3/2, .5, .5, .2),
    (D + "img-aerdock-slider-3.jpg", "img/dock-pad.jpg", "bright", 1600, 3/2, .5, .5, .1),
    (D + "img-aerdock-slider-4.jpg", "img/dock-glass.jpg", "bright", 1600, 3/2, .45, .45, .35),
    (D + "img-aerdock-slider-5.jpg", "img/dock-tunnel.jpg", "bright", 1600, 3/2, .5, .5, .2),
    (D + "img-feature-fuel.jpg", "img/svc-fuel.jpg", "bright", 1100, 4/5, .5, .5, .2),
    (D + "img-feature-med.jpg", "img/svc-med.jpg", "bright", 1100, 4/5, .62, .5, .2),
    (D + "img-feature-oxygen.jpg", "img/svc-oxygen.jpg", "bright", 1100, 4/5, .5, .5, .2),
    (D + "img-feature-solar.jpg", "img/svc-solar.jpg", "bright", 1100, 4/5, .5, .6, .2),
    (D + "img-gallery-1.jpg", "img/g-coast.jpg", "bright", 1200, 4/5, .5, .5, .2),
    (D + "img-gallery-2.jpg", "img/g-desert.jpg", "bright", 1600, 16/9, .5, .5, .25),
    (D + "img-gallery-3.jpg", "img/g-dusk.jpg", "bright", 1600, 16/9, .5, .5, .3),
    (D + "img-gallery-4.jpg", "img/g-shore.jpg", "bright", 1200, 4/5, .6, .5, .2),
    (D + "img-gallery-5.jpg", "img/g-dock-sea.jpg", "bright", 1000, 9/16, .5, .5, .2),
    (D + "img-remote-slide-photo-1@2x.jpg", "img/dock-remote-1.jpg", "graphite", 1800, 16/9, .5, .5, 0),
    (D + "img-remote-slide-photo-2@2x.jpg", "img/dock-remote-2.jpg", "graphite", 1800, 16/9, .5, .5, 0),
    (L + "aerdock_home_block_2.jpg", "img/dock-horizon.jpg", "bright", 1200, 4/5, .5, .5, .3),
    (L + "aerdock_home_block_4.jpg", "img/dock-side.jpg", "bright", 1800, 2.1, .55, .5, .2),
    (L + "img-superwing-vm-bg@2x.jpg", "img/valley.jpg", "graphite", 2000, 2.39, .5, .5, .35),
    (L + "superwing_home_block_2.jpg", "img/sky-pass.jpg", "bright", 1200, 4/5, .5, .5, .2),
    (V + "img-feature-superwing.jpg", "img/studio-hover.jpg", "studio", 1200, 4/5, .5, .5, 0),
    (V + "img-summary-superwing@2x.jpg", "img/studio-side.jpg", "studio", 1800, 16/9, .5, .5, .15),
    (V + "img-feature-aerdock.jpg", "img/studio-dock.jpg", "studio", 1200, 4/5, .5, .5, 0),
    (V + "image-gallery-1.jpg", "img/studio-rear.jpg", "studio", 1000, 4/5, .5, .5, 0),
    (V + "image-gallery-2.jpg", "img/studio-pod.jpg", "studio", 1400, 16/9, .5, .5, 0),
    (V + "image-gallery-5.jpg", "img/studio-tail.jpg", "studio", 1000, 4/5, .5, .5, 0),
    # aerCar — particle phoenix becomes an ember sculpture
    (C + "img-majestic-cover.jpg", "img/car-majestic.jpg", "ember", 2000, 16/9, .7, .5, 0),
    (C + "img-beyond-ordinary.jpg", "img/car-wings.jpg", "ember", 2000, 16/9, .5, .5, 0),
    (C + "img-ignite-cover.jpg", "img/car-ignite.jpg", "ember", 1600, 16/9, .5, .5, 0),
    (C + "img-future-cover.jpg", "img/car-future.jpg", "ember", 1600, 16/9, .5, .5, 0),
    (C + "img-smart-cover.jpg", "img/car-smart.jpg", "ember", 1200, 4/5, .7, .5, 0),
    (C + "img-vision-cover.jpg", "img/car-vision.jpg", "ember", 1600, 16/9, .5, .5, 0),
    (C + "img-airborne-cover.jpg", "img/car-airborne.jpg", "ember", 1600, 16/9, .8, .5, 0),
    (C + "img-connectivity.jpg", "img/car-ai.jpg", "ember", 1000, 1, .5, .5, 0),
    # aerVolt
    (P + "for-powerplants.jpg", "img/volt-plants.jpg", "graphite", 2000, 16/9, .5, .5, .3),
    (P + "for-homeowners.jpg", "img/volt-home.jpg", "graphite", 1600, 4/5, .5, .5, .3),
    (P + "for-business.jpg", "img/volt-business.jpg", "graphite", 1600, 4/5, .5, .5, .3),
    (P + "home-2--1.jpg", "img/volt-panel.jpg", "ember", 1400, 16/9, .7, .5, 0),
    # aerShield
    (S + "hero.jpg", "img/shield-hero.jpg", "graphite", 2000, 16/9, .6, .5, .2),
    (S + "series-1-1.jpg", "img/shield-s1.jpg", "graphite", 1400, 16/10, .5, .5, .2),
    (S + "series-2-1.jpg", "img/shield-s2.jpg", "graphite", 1400, 16/10, .6, .5, .2),
    (S + "series-3-1.jpg", "img/shield-s3.jpg", "graphite", 1400, 16/10, .6, .5, .2),
    (S + "series-4-1.jpg", "img/shield-s4.jpg", "graphite", 1400, 16/10, .6, .5, .2),
    (S + "series-5-1.jpg", "img/shield-s5.jpg", "graphite", 1400, 16/10, .6, .5, .2),
    (S + "series-6-1.jpg", "img/shield-s6.jpg", "graphite", 1400, 16/10, .6, .5, .2),
    (S + "series-7-1.jpg", "img/shield-os.jpg", "graphite", 1400, 16/10, .6, .5, .2),
    (S + "role-1.jpg", "img/shield-r1.jpg", "graphite", 1000, 4/5, .5, .5, .1),
    (S + "role-2.jpg", "img/shield-r2.jpg", "graphite", 1000, 4/5, .5, .5, .1),
    (S + "role-4.jpg", "img/shield-r4.jpg", "graphite", 1000, 4/5, .5, .5, .1),
    # MakeTime
    (M + "fon-hero-mask.jpg", "img/ridge.jpg", "graphite", 2000, 2.39, .5, .6, .4),
]
RACERS = ["img-racers-home-banner@2x", "img-family-takale", "img-story-1-1", "img-story-2-1", "img-story-3-1", "img-story-4-2",
          "img-story-5-3", "img-story-6-1", "img-story-6-4", "img-story-7-3", "img-story-8-2", "img-story-9-2", "img-story-10-1",
          "img-story-11-1", "upcoming_dakar"]

def images():
    for row in IMAGES:
        src, out, mode, Wd, ratio, fx, fy, warm = row
        plate(src, out, mode, Wd, ratio, fx, fy, warm); print("ok", out)
    for i, n in enumerate(RACERS):
        r = 16/9 if i == 0 else (4/5 if i in (1,) else 3/2)
        plate(R + n + ".jpg", f"img/racers-{i:02d}.jpg", "doc", 1600 if i == 0 else 1100, r, .5, .45, 0, vig=.5, gr=.045)
    print("racers ok")

def trim_rgba(path):
    im = Image.open(path).convert("RGBA"); return im.crop(im.getbbox())

def cutouts():
    os.makedirs(f"{OUT}/cut", exist_ok=True)
    side = trim_rgba("cut/wing_studio.png")
    s = 1.7; side = side.resize((int(side.width * s), int(side.height * s)), Image.LANCZOS)
    a = f32(side); rgb = grade(a[..., :3], keep_color=.18, contrast=1.1, gamma=.85)
    k = cv2.GaussianBlur(rgb, (0, 0), 1.2); rgb = np.clip(rgb + (rgb - k) * .6, 0, 1)
    Image.fromarray((np.concatenate([rgb, a[..., 3:]], -1) * 255).astype(np.uint8), "RGBA").save(f"{OUT}/cut/wing-side.webp", quality=88, method=6)
    print("side", side.size)
    top = trim_rgba("cut/wing_top.png")
    a = f32(top); rgb = grade(a[..., :3], keep_color=.15, contrast=1.18, gamma=.62)
    Image.fromarray((np.concatenate([rgb, a[..., 3:]], -1) * 255).astype(np.uint8), "RGBA").save(f"{OUT}/cut/wing-top.webp", quality=86, method=6)
    print("top", top.size)
    # dark silhouette version of top for safety/dock icons
    small = top.resize((top.width // 4, top.height // 4), Image.LANCZOS)
    a = f32(small); rgb = grade(a[..., :3], keep_color=.05, contrast=1.2, gamma=.7)
    Image.fromarray((np.concatenate([rgb, a[..., 3:]], -1) * 255).astype(np.uint8), "RGBA").save(f"{OUT}/cut/wing-top-sm.webp", quality=85, method=6)

def lines():
    top = trim_rgba("cut/wing_top.png")
    a = f32(top); Lm = lum(a[..., :3]); A = a[..., 3]
    L8 = cv2.bilateralFilter((Lm * 255).astype(np.uint8), 7, 40, 7)
    e1 = cv2.Canny(L8, 18, 60).astype(np.float32) / 255
    k = np.ones((3, 3), np.uint8)
    outline = cv2.morphologyEx((A > .5).astype(np.uint8), cv2.MORPH_GRADIENT, k).astype(np.float32)
    ln = np.clip(e1 * (A > .5) * .6 + outline, 0, 1)
    ln = cv2.GaussianBlur(ln, (0, 0), .6)
    col = np.array(BONE, np.float32) / 255
    rgba = np.concatenate([np.ones_like(a[..., :3]) * col, ln[..., None]], -1)
    Image.fromarray((rgba * 255).astype(np.uint8), "RGBA").save(f"{OUT}/cut/wing-top-lines.webp", quality=90, method=6)
    # fill mask (for carbon fill under lines)
    m = (A > .5).astype(np.float32)
    Image.fromarray((np.concatenate([np.ones_like(a[..., :3]) * np.array(CARBON, np.float32) / 255, m[..., None] * .85], -1) * 255).astype(np.uint8), "RGBA").save(f"{OUT}/cut/wing-top-fill.webp", quality=85, method=6)
    print("lines", top.size)

CITIES = {
    "Mumbai": (19.076, 72.8777), "Pune": (18.5204, 73.8567), "Nashik": (19.9975, 73.7898), "Delhi": (28.6139, 77.2090),
    "Jaipur": (26.9124, 75.7873), "Agra": (27.1767, 78.0081), "Chandigarh": (30.7333, 76.7794), "Bengaluru": (12.9716, 77.5946),
    "Chennai": (13.0827, 80.2707), "Mysuru": (12.2958, 76.6394), "Hyderabad": (17.3850, 78.4867), "Vijayawada": (16.5062, 80.6480),
    "Kolkata": (22.5726, 88.3639), "Bhubaneswar": (20.2961, 85.8245), "Ahmedabad": (23.0225, 72.5714), "Surat": (21.1702, 72.8311),
    "Lucknow": (26.8467, 80.9462), "Guwahati": (26.1445, 91.7362), "Shillong": (25.5788, 91.8933), "Kochi": (9.9312, 76.2673),
    "Nagpur": (21.1458, 79.0882), "Panaji": (15.4909, 73.8278),
}

def india():
    from matplotlib.path import Path
    g = json.load(open("india-soi.geojson"))
    polys = []
    geom = g["features"][0]["geometry"]
    for poly in geom["coordinates"]:
        ring = np.array(poly[0]); polys.append(Path(ring[:, :2]))
    lat0 = math.radians(22.5)
    lon_min, lon_max, lat_min, lat_max = 68.0, 97.5, 6.5, 37.2
    step = .30
    pts = []
    lat = lat_max
    row = 0
    while lat >= lat_min:
        lon = lon_min + (step / 2 if row % 2 else 0)
        while lon <= lon_max:
            if any(p.contains_point((lon, lat)) for p in polys): pts.append((lon, lat))
            lon += step
        lat -= step * .87; row += 1
    def proj(lon, lat): return ((lon - lon_min) * math.cos(lat0), (lat_max - lat))
    W = (lon_max - lon_min) * math.cos(lat0); H = (lat_max - lat_min)
    P = [proj(*p) for p in pts]
    dots = [[round(x / W, 4), round(y / H, 4)] for x, y in P]
    cities = {k: [round(proj(v[1], v[0])[0] / W, 4), round(proj(v[1], v[0])[1] / H, 4), v[0], v[1]] for k, v in CITIES.items()}
    # outline (simplified) for a hairline border
    outline = []
    for poly in geom["coordinates"]:
        ring = np.array(poly[0])[:, :2]
        if len(ring) < 200: continue
        approx = cv2.approxPolyDP((ring * 1000).astype(np.int32).reshape(-1, 1, 2), 60, True).reshape(-1, 2) / 1000.0
        outline.append([[round(proj(x, y)[0] / W, 4), round(proj(x, y)[1] / H, 4)] for x, y in approx])
    os.makedirs(f"{OUT}/geo", exist_ok=True)
    json.dump({"aspect": round(W / H, 4), "dots": dots, "cities": cities, "outline": outline,
               "credit": "India boundary: Survey of India outline via DataMeet India community (CC BY 4.0)"},
              open(f"{OUT}/geo/india.json", "w"), separators=(",", ":"))
    print("india dots", len(dots), "outline rings", len(outline), "aspect", W / H)

# ---------------------------------------------------------------- video LUTs
def write_cube(path, fn, n=33):
    g = np.linspace(0, 1, n, dtype=np.float32)
    b, gg, r = np.meshgrid(g, g, g, indexing="ij")
    rgb = np.stack([r, gg, b], -1).reshape(-1, 3)
    out = fn(rgb.reshape(1, -1, 3)).reshape(-1, 3)
    with open(path, "w") as f:
        f.write(f"LUT_3D_SIZE {n}\n")
        for c in out: f.write(f"{c[0]:.5f} {c[1]:.5f} {c[2]:.5f}\n")

def holo(a):
    g = grade(a, keep_color=.04, contrast=1.1, gamma=.85)
    hsv = cv2.cvtColor((np.clip(a, 0, 1) * 255).astype(np.uint8), cv2.COLOR_RGB2HSV).astype(np.float32)
    hue = hsv[..., 0] * 2; sat = hsv[..., 1] / 255; val = hsv[..., 2] / 255
    w = sat * np.exp(-((hue - 186) / 22) ** 2)
    amber = np.array(SIG, np.float32) / 255
    tint = (val[..., None] ** .9) * amber * 1.1
    return np.clip(g * (1 - w[..., None]) + tint * w[..., None], 0, 1)

def luts():
    os.makedirs("luts", exist_ok=True)
    write_cube("luts/graphite.cube", lambda a: grade(a, keep_color=.06, contrast=1.12, gamma=.8))
    write_cube("luts/bright.cube", lambda a: grade(a, keep_color=.08, contrast=1.14, gamma=.65))
    write_cube("luts/holo.cube", holo)
    write_cube("luts/dawn.cube", lambda a: warm_light_flat(a))
    print("luts ok")

def warm_light_flat(a):
    g = grade(a, keep_color=.05, contrast=1.08, gamma=.78)
    L = lum(g)[..., None]
    return np.clip(g * .92 + (L ** 1.4) * (np.array(SIG) / 255) * .28, 0, 1)

def ff(args):
    cmd = ["ffmpeg", "-nostdin", "-v", "error", "-y"] + args
    subprocess.run(cmd, check=True)

V3 = L + "aerpace - The Future of Transportation.mp4"
V4 = V + "aerVerse Intercity Interstate Transportation Ecosystem aerpace.mp4"
V1 = S + "aerShield Tactical Drone OS and Combat Ecosystem.mp4"
V5 = M + "MakeTime A Movement Beyond Time.mp4"
V6 = M + "MakeTime A Movement Beyond Time (1).mp4"

def vid(src, out, ss, t, lut, W=1280, crf=27, speed=1.0, extra=""):
    os.makedirs(f"{OUT}/video", exist_ok=True)
    vf = f"lut3d=luts/{lut}.cube,scale={W}:-2:flags=lanczos"
    if speed != 1.0: vf = f"setpts={1/speed}*PTS," + vf
    vf += ",noise=alls=4:allf=t,vignette=angle=PI/9" + extra
    ff(["-ss", str(ss), "-t", str(t), "-i", src, "-vf", vf, "-an", "-c:v", "libx264", "-preset", "slow", "-crf", str(crf),
        "-pix_fmt", "yuv420p", "-movflags", "+faststart", f"{OUT}/video/{out}.mp4"])
    ff(["-ss", "0.2", "-i", f"{OUT}/video/{out}.mp4", "-frames:v", "1", "-q:v", "4", f"{OUT}/video/{out}.jpg"])
    print("video", out, os.path.getsize(f"{OUT}/video/{out}.mp4") // 1024, "KB")

def videos():
    vid(V3, "drive-holo", 0, 7.2, "holo")
    vid(V4, "dock-top", 6.2, 4.6, "graphite", speed=.6)
    vid(V4, "liftoff", 18, 10, "bright")
    vid(V4, "arrival", 32.2, 9.6, "bright")
    vid(V4, "tunnel", 42, 6, "bright")
    vid(V6, "clouds", 0, 12, "dawn", W=1920, crf=28)
    vid(V1, "shield", 0, 12.8, "graphite")
    vid(V5, "maketime", 0, 4.2, "dawn", W=1600)

def seq():
    """aerDock journey as an image sequence for scroll scrubbing."""
    d = f"{OUT}/seq/dock"; os.makedirs(d, exist_ok=True)
    for f in os.listdir(d): os.remove(os.path.join(d, f))
    segs = [(0, 11.5), (18, 28), (32.2, 48.5)]
    tmp = "seqtmp"; os.makedirs(tmp, exist_ok=True)
    for f in os.listdir(tmp): os.remove(os.path.join(tmp, f))
    idx = 0; fps = 4.2
    for a, b in segs:
        ff(["-ss", str(a), "-t", str(b - a), "-i", V4, "-vf", f"fps={fps},lut3d=luts/bright.cube,scale=1120:-2:flags=lanczos",
            "-start_number", str(idx), f"{tmp}/f%04d.png"])
        idx = len(os.listdir(tmp))
    files = sorted(os.listdir(tmp))
    for i, f in enumerate(files):
        Image.open(f"{tmp}/{f}").convert("RGB").save(f"{d}/{i:03d}.webp", quality=58, method=5)
    print("seq frames", len(files), sum(os.path.getsize(f"{d}/{x}") for x in os.listdir(d)) // 1024, "KB")

if __name__ == "__main__":
    job = sys.argv[1] if len(sys.argv) > 1 else "all"
    for name, fn in [("images", images), ("cutouts", cutouts), ("lines", lines), ("india", india), ("luts", luts), ("videos", videos), ("seq", seq)]:
        if job in (name, "all"): fn()
