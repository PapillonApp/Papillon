export function adjustColor (hex: string, amount: number): string {
  try {
  // Remove the hash if it's there
    hex = hex.replace(/^#/, "");

    // Parse the hex color into its RGB components
    let bigint = parseInt(hex, 16);
    let r = (bigint >> 16) & 255;
    let g = (bigint >> 8) & 255;
    let b = bigint & 255;

    // Adjust the RGB values by the specified amount
    r = Math.max(0, Math.min(255, r + amount));
    g = Math.max(0, Math.min(255, g + amount));
    b = Math.max(0, Math.min(255, b + amount));

    // Convert the RGB values back to a hex string
    let newHex = ((r << 16) + (g << 8) + b).toString(16).padStart(6, "0");

    return `#${newHex}`;
  }
  catch (e) {
    return hex;
  }
}
