"""aerpace asset lab — re-art-directs old renders into the new 'First Light' visual language.
Every output is a NEW composition: new grade, new crop, new ground, new light, new line work.
"""
import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont, ImageFilter

SRC, CUT, OUT = "src", "cut", "out"
CLEAN = True
VOID, GRAPH, CARBON = (7, 8, 10), (18, 20, 23), (28, 31, 35)
STONE, BONE, PAPER = (140, 135, 126), (238, 234, 227), (246, 244, 239)
SIG = (255, 122, 48)          # First Light amber — the only accent
rng = np.random.default_rng(7)

def f32(im): return np.asarray(im).astype(np.float32) / 255.0
def u8(a): return Image.fromarray(np.clip(a * 255, 0, 255).astype(np.uint8))
def lum(a): return a[..., 0] * .2126 + a[..., 1] * .7152 + a[..., 2] * .0722

def ramp(stops):
    xs = np.array([s[0] for s in stops]); cs = np.array([s[1] for s in stops], np.float32) / 255
    return lambda L: np.stack([np.interp(L, xs, cs[:, i]) for i in range(3)], -1)

# graphite → stone → bone, with a whisper of warmth in the highlights
GMAP = ramp([(0, VOID), (.18, GRAPH), (.45, (58, 60, 63)), (.75, (150, 144, 134)), (1, (247, 241, 230))])

def grain(a, amt=.035):
    n = rng.normal(0, amt, a.shape[:2])[..., None]
    return np.clip(a + n, 0, 1)

def grade(a, keep_color=.12, contrast=1.08, gamma=1.0):
    L = np.clip((lum(a) ** gamma - .5) * contrast + .5, 0, 1)
    g = GMAP(L)
    return g * (1 - keep_color) + a * keep_color

def vignette(a, s=.55):
    h, w = a.shape[:2]; y, x = np.mgrid[0:h, 0:w]
    d = np.sqrt(((x - w / 2) / (w / 2)) ** 2 + ((y - h / 2) / (h / 2)) ** 2)
    return a * (1 - s * np.clip(d - .35, 0, 1) ** 1.6)[..., None]

def cover(im, W, H, fx=.5, fy=.5):
    w, h = im.size; s = max(W / w, H / h)
    im = im.resize((int(w * s + .5), int(h * s + .5)), Image.LANCZOS)
    x = int((im.width - W) * fx); y = int((im.height - H) * fy)
    return im.crop((x, y, x + W, y + H))

def rim_light(rgba, direction=(-1, -1), color=SIG, width=6, strength=1.0):
    """Edge light: alpha minus shifted alpha, blurred → coloured glow on the lit side."""
    A = f32(rgba)[..., 3]
    dx, dy = direction
    sh = np.roll(np.roll(A, -dy * width, 0), -dx * width, 1)
    edge = np.clip(A - sh, 0, 1)
    edge = cv2.GaussianBlur(edge, (0, 0), width * .6) * strength
    col = np.array(color, np.float32) / 255
    return edge[..., None] * col, edge

def comp(bg, fg_rgba, xy):
    bg = bg.copy(); bg.paste(fg_rgba, xy, fg_rgba); return bg

# ---------------------------------------------------------------- 01 FIRST LIGHT (hero)
def first_light():
    W, H = 2400, 1350
    y, x = np.mgrid[0:H, 0:W].astype(np.float32)
    hz = H * .64
    sky = np.zeros((H, W, 3), np.float32) + np.array(VOID, np.float32) / 255
    band = np.exp(-((y - hz) / (H * .05)) ** 2) * np.exp(-((x - W * .62) / (W * .42)) ** 2)
    glow = np.exp(-((y - hz) / (H * .22)) ** 2) * np.exp(-((x - W * .62) / (W * .6)) ** 2)
    sky += band[..., None] * np.array([1.0, .56, .26]) * .85 + glow[..., None] * np.array([.30, .16, .09]) * .55
    line = np.exp(-((y - hz) / 1.6) ** 2) * np.exp(-((x - W * .62) / (W * .30)) ** 2)
    sky += line[..., None] * np.array([1, .86, .7])
    ground = (y > hz)[..., None] * (np.array(GRAPH, np.float32) / 255 * (1 - (y - hz) / (H - hz))[..., None] * .7)
    sky = np.where((y > hz)[..., None], ground + band[..., None] * np.array([.5, .25, .1]) * .25, sky)
    bg = u8(sky)
    wing = Image.open(f"{CUT}/wing_studio.png").convert("RGBA")
    wing = wing.crop(wing.getbbox()); s = W * .56 / wing.width
    wing = wing.resize((int(wing.width * s), int(wing.height * s)), Image.LANCZOS)
    a = f32(wing); rgb, A = a[..., :3], a[..., 3:]
    dark = grade(rgb, keep_color=.05) * .32                       # aircraft sits in darkness
    rim, e = rim_light(wing, direction=(1, 0), width=5, strength=1.6)
    top, _ = rim_light(wing, direction=(0, -1), width=3, strength=.9, color=(255, 214, 170))
    lit = np.clip(dark + rim + top * .6, 0, 1)
    wing = Image.fromarray(np.concatenate([lit, A], -1).__mul__(255).astype(np.uint8), "RGBA")
    px, py = int(W * .26), int(hz - wing.height * .83)
    out = comp(bg, wing, (px, py))
    # reflection on the wet ground
    refl = wing.transpose(Image.FLIP_TOP_BOTTOM).filter(ImageFilter.GaussianBlur(6))
    r = f32(refl); r[..., 3] *= np.linspace(.28, 0, r.shape[0])[:, None]
    out = comp(out, u8(r).convert("RGBA") if False else Image.fromarray((r * 255).astype(np.uint8), "RGBA"), (px, py + wing.height - 8))
    a = vignette(grain(f32(out.convert("RGB")), .028), .5)
    u8(a).save(f"{OUT}/01_first_light.jpg", quality=90)

# ---------------------------------------------------------------- 02 BONE STUDIO (spec plate)
def bone_studio():
    W, H = 2400, 1350
    y, x = np.mgrid[0:H, 0:W].astype(np.float32)
    paper = np.array(PAPER, np.float32) / 255
    floor = np.clip((y - H * .58) / (H * .42), 0, 1)
    bg = paper * (1 - .08 * floor[..., None]) - .03 * np.exp(-((x - W / 2) / (W * .7)) ** 2)[..., None] * 0
    wing = Image.open(f"{CUT}/wing_top.png").convert("RGBA")
    wing = wing.crop(wing.getbbox()); s = W * .52 / wing.width
    wing = wing.resize((int(wing.width * s), int(wing.height * s)), Image.LANCZOS)
    a = f32(wing); rgb = grade(a[..., :3], keep_color=.15, contrast=1.2, gamma=.6)
    wing = Image.fromarray((np.concatenate([rgb, a[..., 3:]], -1) * 255).astype(np.uint8), "RGBA")
    px, py = (W - wing.width) // 2, int(H * .5 - wing.height * .52)
    # soft drop shadow — object floats a few cm above the paper
    sh = np.zeros((H, W), np.float32); A = f32(wing)[..., 3]
    sh[py + 40:py + 40 + A.shape[0], px + 30:px + 30 + A.shape[1]] = A
    sh = cv2.GaussianBlur(sh, (0, 0), 28) * .32
    bg = bg * (1 - sh[..., None])
    out = comp(u8(bg), wing, (px, py))
    print('bone wing box', px, py, wing.width, wing.height, W, H)
    d = ImageDraw.Draw(out)
    mono = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf", 22)
    ink = (28, 31, 35)
    pts = [((px + wing.width * .17, py + wing.height * .30), (px - 210, py + 70), "VTOL", "VERTICAL TAKE-OFF"),
           ((px + wing.width * .5, py + wing.height * .55), (px + wing.width + 120, py + 40), "H₂", "HYDROGEN"),
           ((px + wing.width * .84, py + wing.height * .66), (px + wing.width + 120, py + wing.height - 40), "200 KM/H", "CRUISE"),
           ((px + wing.width * .3, py + wing.height * .78), (px - 210, py + wing.height + 30), "500 KM", "RANGE")]
    if CLEAN: pts = []
    big = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 44)
    for (ax, ay), (tx, ty), v, l in pts:
        d.line([(ax, ay), (tx + 90, ty + 30)], fill=ink, width=2)
        d.ellipse([ax - 7, ay - 7, ax + 7, ay + 7], outline=SIG, width=3)
        d.text((tx, ty - 30), v, font=big, fill=ink); d.text((tx, ty + 22), l, font=mono, fill=(120, 116, 108))
    if not CLEAN: d.text((60, H - 70), "aerWING — PLAN VIEW · FIG. 01", font=mono, fill=(120, 116, 108))
    u8(grain(f32(out.convert("RGB")), .02)).save(f"{OUT}/02_bone_studio.jpg", quality=90)

# ---------------------------------------------------------------- 03 BLUEPRINT (safety / inside)
def blueprint():
    W, H = 2400, 1350
    wing = Image.open(f"{CUT}/wing_top.png").convert("RGBA")
    wing = wing.crop(wing.getbbox()); s = W * .58 / wing.width
    wing = wing.resize((int(wing.width * s), int(wing.height * s)), Image.LANCZOS)
    a = f32(wing); L = lum(a[..., :3]); A = a[..., 3]
    L8 = (cv2.bilateralFilter((L * 255).astype(np.uint8), 7, 40, 7))
    e1 = cv2.Canny(L8, 18, 60).astype(np.float32) / 255
    outline = cv2.morphologyEx((A > .5).astype(np.uint8), cv2.MORPH_GRADIENT, np.ones((3, 3), np.uint8)).astype(np.float32)
    lines = np.clip(e1 * (A > .5) * .55 + outline, 0, 1)
    lines = cv2.GaussianBlur(lines, (0, 0), .7)
    bg = np.zeros((H, W, 3), np.float32) + np.array(VOID, np.float32) / 255
    y, x = np.mgrid[0:H, 0:W]
    grid = ((x % 60 == 0) | (y % 60 == 0)).astype(np.float32) * .045 + ((x % 300 == 0) | (y % 300 == 0)).astype(np.float32) * .06
    bg += grid[..., None]
    px, py = (W - wing.width) // 2, (H - wing.height) // 2 + 20
    sub = bg[py:py + wing.height, px:px + wing.width]
    fill = (A > .5)[..., None] * np.array(CARBON, np.float32) / 255 * .6
    sub[:] = sub * (1 - (A > .5)[..., None] * .6) + fill
    sub[:] = np.clip(sub + lines[..., None] * np.array(BONE, np.float32) / 255 * .85, 0, 1)
    out = u8(bg); d = ImageDraw.Draw(out)
    mono = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf", 20)
    ww, hh = wing.width, wing.height
    # five safety layers as numbered callouts, in signal amber
    layers = [(.50, .30, "01  BACKUP BATTERIES"), (.50, .08, "02  BALLISTIC PARACHUTE"), (.10, .55, "03  COLD-GAS THRUSTERS"),
              (.88, .45, "04  COLLISION AVOIDANCE"), (.50, .72, "05  AUTOMATED FIRE SAFETY")]
    if CLEAN: layers = []
    for i, (fx, fy, t) in enumerate(layers):
        cx, cy = px + ww * fx, py + hh * fy
        r = 26
        d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=SIG, width=2)
        d.ellipse([cx - 5, cy - 5, cx + 5, cy + 5], fill=SIG)
        tx = cx + 60 if fx >= .5 else cx - 330
        ty = cy - 60 - i * 4
        d.line([(cx + (r if fx >= .5 else -r), cy), (tx + (0 if fx >= .5 else 300), ty + 12)], fill=SIG, width=1)
        d.text((tx, ty), t, font=mono, fill=(238, 234, 227))
    # dimension line across span
    yy = py + hh + 50
    d.line([(px, yy), (px + ww, yy)], fill=(140, 135, 126), width=1)
    for xx in (px, px + ww): d.line([(xx, yy - 12), (xx, yy + 12)], fill=(140, 135, 126), width=1)
    if not CLEAN: d.text((px + ww / 2 - 70, yy + 14), "SPAN — TBC", font=mono, fill=(140, 135, 126))
    print('bp wing box', px, py, ww, hh)
    if not CLEAN: d.text((60, 50), "SAFETY ARCHITECTURE · 5 LAYERS", font=mono, fill=(140, 135, 126))
    u8(grain(f32(out), .018)).save(f"{OUT}/03_blueprint.jpg", quality=90)

# ---------------------------------------------------------------- 04 DAWN REGRADE (full scenes)
def regrade(name, out, W=2400, ratio=2.39, fx=.5, fy=.5, keep=.10, warm=.0, gamma=.8):
    im = Image.open(f"{SRC}/{name}.jpg").convert("RGB")
    im = cover(im, W, int(W / ratio), fx, fy)
    a = f32(im); g = grade(a, keep_color=keep, contrast=1.12, gamma=gamma)
    if warm:   # first light enters from the right
        h, w = g.shape[:2]; x = np.linspace(0, 1, w)[None, :, None]
        L = lum(g)[..., None]
        g = np.clip(g + warm * (x ** 2.2) * (L ** 1.5) * (np.array(SIG) / 255), 0, 1)
    u8(vignette(grain(g, .03), .45)).save(f"{OUT}/{out}.jpg", quality=88)

# ---------------------------------------------------------------- 05 MACRO (detail crops the old site never showed)
def macro(name, out, box, size=(1600, 1600), keep=.25):
    im = Image.open(f"{SRC}/{name}.jpg").convert("RGB")
    w, h = im.size; l, t, r, b = [int(v) for v in (box[0] * w, box[1] * h, box[2] * w, box[3] * h)]
    im = im.crop((l, t, r, b)).resize(size, Image.LANCZOS)
    a = grade(f32(im), keep_color=keep, contrast=1.25, gamma=.62)
    u8(vignette(grain(a, .035), .55)).save(f"{OUT}/{out}.jpg", quality=88)

# ---------------------------------------------------------------- 06 DOT MATRIX (aerOS / network)
def dot_matrix():
    W, H, step = 2400, 1350, 14
    wing = Image.open(f"{CUT}/wing_top.png").convert("RGBA")
    wing = wing.crop(wing.getbbox()); s = W * .55 / wing.width
    wing = wing.resize((int(wing.width * s), int(wing.height * s)), Image.LANCZOS)
    canvas = Image.new("RGBA", (W, H), (0, 0, 0, 0)); canvas.paste(wing, ((W - wing.width) // 2, (H - wing.height) // 2), wing)
    a = f32(canvas); L = lum(a[..., :3]); A = a[..., 3]
    out = Image.new("RGB", (W, H), VOID); d = ImageDraw.Draw(out)
    for yy in range(step // 2, H, step):
        for xx in range(step // 2, W, step):
            al = A[yy, xx]
            if al < .5:
                d.ellipse([xx - 1, yy - 1, xx + 1, yy + 1], fill=(30, 33, 37)); continue
            v = .25 + L[yy, xx] * 2.2
            r = max(1.2, min(step * .46, v * step * .42))
            c = SIG if L[yy, xx] > .42 else (int(238 * min(1, v)), int(234 * min(1, v)), int(227 * min(1, v)))
            d.ellipse([xx - r, yy - r, xx + r, yy + r], fill=c)
    out.save(f"{OUT}/06_dot_matrix.jpg", quality=90)

# ---------------------------------------------------------------- 07 DOCUMENTARY (racers)
def documentary():
    im = Image.open(f"{SRC}/racer.jpg").convert("RGB")
    im = cover(im, 1800, 1200, .5, .5)
    a = f32(im); L = np.clip((lum(a) - .5) * 1.35 + .5, 0, 1)
    duo = ramp([(0, VOID), (.5, (70, 62, 55)), (.82, SIG), (1, (255, 236, 214))])(L)
    u8(vignette(grain(duo, .05), .5)).save(f"{OUT}/07_documentary.jpg", quality=88)

if __name__ == "__main__":
    first_light(); bone_studio(); blueprint(); dot_matrix(); documentary()
    regrade("wing_glass", "04a_dawn_glass", fx=.45, fy=.42, keep=.10, warm=.35, gamma=.62)
    regrade("dock_swirl", "04b_dock_graphite", ratio=16 / 9, keep=.04, warm=.0)
    regrade("dock_mountain", "04c_dock_dawn", fx=.5, fy=.45, keep=.12, warm=.45)
    regrade("wing_hangar", "04d_hangar", ratio=2.39, fx=.5, fy=.48, keep=.0, warm=.2)
    macro("wing_front", "05a_macro_cabin", (.08, .18, .92, .78), (1600, 1150))
    macro("wing_fans", "05b_macro_fan", (.50, .30, .82, .82), (1400, 1400))
    print("done")
