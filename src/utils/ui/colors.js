export function adjustColor(hex, amount) {
    try {
        // Remove the hash if it's there
        hex = hex.replace(/^#/, "");
        // Parse the hex color into its RGB components
        var bigint = parseInt(hex, 16);
        var r = (bigint >> 16) & 255;
        var g = (bigint >> 8) & 255;
        var b = bigint & 255;
        // Adjust the RGB values by the specified amount
        r = Math.max(0, Math.min(255, r + amount));
        g = Math.max(0, Math.min(255, g + amount));
        b = Math.max(0, Math.min(255, b + amount));
        // Convert the RGB values back to a hex string
        var newHex = ((r << 16) + (g << 8) + b).toString(16).padStart(6, "0");
        return "#".concat(newHex);
    }
    catch (e) {
        return hex;
    }
}
