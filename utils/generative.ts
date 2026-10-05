import { BlurStyle, matchFont, SkCanvas, SkImage, Skia, SkTypeface, TileMode } from "@shopify/react-native-skia";
import { Image, Platform } from "react-native";

// mulberry32: same seed gives the same layout, so a small preview matches the full render
const seededRandom = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const render = (width: number, height: number, draw: (canvas: SkCanvas) => void): SkImage | null => {
  const surface = Skia.Surface.Make(width, height);
  if (!surface) return null;
  draw(surface.getCanvas());
  return surface.makeImageSnapshot();
};

// Saturated mid/dark tones, all readable under white text
const AVATAR_COLORS = [
  "#E5484D", "#F76B15", "#D6409F", "#8E4EC6", "#6E56CF", "#3E63DD",
  "#0090FF", "#0D74CE", "#12A594", "#218358", "#AD7F58", "#5B5BD6",
];

// expo-font registers fonts at runtime, which Skia can't see: load the file into Skia ourselves
let avatarTypeface: SkTypeface | null = null;

export async function loadAvatarFont() {
  if (avatarTypeface) return;
  const { uri } = Image.resolveAssetSource(require("@/assets/fonts/SNPro-Medium.ttf"));
  avatarTypeface = Skia.Typeface.MakeFreeTypeFaceFromData(await Skia.Data.fromURI(uri));
}

/** Avatar: random color with the white first letter of `name`, as base64 PNG, or "" if rendering fails. */
export function generateAvatar(name = ""): string {
  try {
    const size = 256;
    const letter = name.trim().charAt(0).toUpperCase() || "?";
    // Falls back to the system font if SN Pro isn't loaded yet
    const font = avatarTypeface
      ? Skia.Font(avatarTypeface, size * 0.62)
      : matchFont({
        fontFamily: Platform.select({ ios: "Helvetica", default: "sans-serif" }),
        fontSize: size * 0.62,
        fontWeight: "500",
      });
    const image = render(size, size, canvas => {
      canvas.drawColor(Skia.Color(AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]));
      const paint = Skia.Paint();
      paint.setAntiAlias(true);
      paint.setColor(Skia.Color("#FFFFFF"));
      // Center the glyph's ink, not its advance box: side bearings are uneven (e.g. "C")
      const glyph = Skia.Path.MakeFromText(letter, 0, 0, font);
      if (!glyph) return;
      const bounds = glyph.computeTightBounds();
      glyph.offset(size / 2 - bounds.x - bounds.width / 2, size / 2 - bounds.y - bounds.height / 2);
      canvas.drawPath(glyph, paint);
    });
    return image?.encodeToBase64() ?? "";
  } catch {
    return "";
  }
}

/** Mesh-like gradient: linear background plus blurred blobs of the given colors. */
export function generateMeshGradient(colors: string[], seed: number, width: number, height: number): SkImage | null {
  const random = seededRandom(seed);
  const unit = Math.max(width, height);
  const skColors = colors.map(c => Skia.Color(c));

  return render(width, height, canvas => {
    const bg = Skia.Paint();
    bg.setShader(Skia.Shader.MakeLinearGradient(
      { x: 0, y: 0 },
      { x: width, y: height },
      skColors.length > 1 ? skColors : [skColors[0], skColors[0]],
      null,
      TileMode.Clamp
    ));
    canvas.drawRect(Skia.XYWHRect(0, 0, width, height), bg);

    const blob = Skia.Paint();
    blob.setMaskFilter(Skia.MaskFilter.MakeBlur(BlurStyle.Normal, unit / 8, true));
    for (let i = 0; i < Math.max(4, skColors.length * 2); i++) {
      blob.setColor(skColors[i % skColors.length]);
      canvas.drawCircle(random() * width, random() * height, unit * (0.15 + random() * 0.25), blob);
    }
  });
}
