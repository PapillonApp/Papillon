type RgbComponent = number;
type HexColor = string;

interface ContrastCheckResult {
  contrastRatio: number;
  isSufficient: boolean;
}

const hexToRgb = (hex: HexColor): [RgbComponent, RgbComponent, RgbComponent] => {
  const cleanHex = hex.startsWith('#') ? hex.slice(1) : hex;
  let r: RgbComponent;
  let g: RgbComponent;
  let b: RgbComponent;

  if (cleanHex.length === 3) {
    r = parseInt(cleanHex[0] + cleanHex[0], 16);
    g = parseInt(cleanHex[1] + cleanHex[1], 16);
    b = parseInt(cleanHex[2] + cleanHex[2], 16);
  } else if (cleanHex.length === 6) {
    r = parseInt(cleanHex.substring(0, 2), 16);
    g = parseInt(cleanHex.substring(2, 4), 16);
    b = parseInt(cleanHex.substring(4, 6), 16);
  } else {
    throw new Error(`Invalid hex color format: ${hex}`);
  }

  if (isNaN(r) || isNaN(g) || isNaN(b)) {
      throw new Error(`Failed to parse hex color: ${hex}`);
  }

  return [r, g, b];
};

const calculateLuminance = (rgb: [RgbComponent, RgbComponent, RgbComponent]): number => {
  const linearize = (c: RgbComponent): number => {
    const sRGB = c / 255;
    return sRGB <= 0.03928 
      ? sRGB / 12.92 
      : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  };

  const [r, g, b] = rgb.map(linearize);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const calculateContrastRatio = (l1: number, l2: number): number => {
  const [L_light, L_dark] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (L_light + 0.05) / (L_dark + 0.05);
};

export const colorCheck = (
  foreground: HexColor, 
  backgrounds: HexColor[]
): boolean => {
  const MIN_CONTRAST_RATIO = 4.5; 

  try {
    const fgRgb = hexToRgb(foreground);
    const fgLuminance = calculateLuminance(fgRgb);
    
    // Check if ANY background provides sufficient contrast
    return backgrounds.some(bgHex => {
      try {
        const bgRgb = hexToRgb(bgHex);
        const bgLuminance = calculateLuminance(bgRgb);
        const contrastRatio = calculateContrastRatio(fgLuminance, bgLuminance);
        
        return contrastRatio >= MIN_CONTRAST_RATIO;
      } catch (error) {
        return false;
      }
    });

  } catch (error) {
    return false;
  }
};