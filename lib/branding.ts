/**
 * Tenant branding utilities.
 * Extracts dominant colors from a logo image and generates a color palette.
 */

export interface TenantBranding {
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
}

/**
 * Extract dominant colors from an image URL using canvas.
 * Returns a palette based on the most prominent colors.
 */
export async function extractColorsFromLogo(
  imageUrl: string
): Promise<{ primary: string; secondary: string; accent: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve({ primary: "#683290", secondary: "#4451A2", accent: "#1A1A2E" });
        return;
      }

      // Scale down for performance
      const maxSize = 100;
      const scale = Math.min(maxSize / img.width, maxSize / img.height);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;

      // Collect non-white, non-transparent pixels
      const colors: [number, number, number][] = [];
      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const a = pixels[i + 3];

        // Skip transparent, white, near-white, and very dark pixels
        if (a < 128) continue;
        if (r > 240 && g > 240 && b > 240) continue;
        if (r < 15 && g < 15 && b < 15) continue;

        colors.push([r, g, b]);
      }

      if (colors.length < 3) {
        resolve({ primary: "#683290", secondary: "#4451A2", accent: "#1A1A2E" });
        return;
      }

      // Simple k-means-like clustering to find dominant colors
      const sorted = [...colors].sort((a, b) => {
        const hueA = rgbToHsl(a[0], a[1], a[2])[0];
        const hueB = rgbToHsl(b[0], b[1], b[2])[0];
        return hueA - hueB;
      });

      // Pick colors at roughly 25%, 50%, 75% of the sorted list
      const primary = sorted[Math.floor(sorted.length * 0.3)];
      const secondary = sorted[Math.floor(sorted.length * 0.6)];
      const accent = sorted[Math.floor(sorted.length * 0.85)];

      resolve({
        primary: rgbToHex(primary[0], primary[1], primary[2]),
        secondary: rgbToHex(secondary[0], secondary[1], secondary[2]),
        accent: rgbToHex(accent[0], accent[1], accent[2]),
      });
    };

    img.onerror = () => {
      resolve({ primary: "#683290", secondary: "#4451A2", accent: "#1A1A2E" });
    };

    img.src = imageUrl;
  });
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((x) => Math.round(x).toString(16).padStart(2, "0")).join("")}`;
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  const s = max === 0 ? 0 : (max - min) / max;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    h = max === r ? ((g - b) / d + (g < b ? 6 : 0)) / 6 : max === g ? ((b - r) / d + 2) / 6 : ((r - g) / d + 4) / 6;
  }
  return [h * 360, s * 100, l * 100];
}

/**
 * Generate a full branding palette from primary color.
 */
export function generatePalette(primaryColor: string): TenantBranding {
  const [r, g, b] = hexToRgb(primaryColor);

  // Generate lighter version for background
  const lighterR = Math.min(255, r + 40);
  const lighterG = Math.min(255, g + 40);
  const lighterB = Math.min(255, b + 40);

  // Generate darker version for text
  const darkerR = Math.max(0, r - 60);
  const darkerG = Math.max(0, g - 60);
  const darkerB = Math.max(0, b - 60);

  return {
    logoUrl: "",
    primaryColor,
    secondaryColor: rgbToHex(lighterR, lighterG, lighterB),
    accentColor: rgbToHex(darkerR, darkerG, darkerB),
    backgroundColor: `${primaryColor}08`,
    textColor: "#1A1A2E",
  };
}

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [104, 50, 144];
}

/**
 * Apply tenant branding as CSS custom properties.
 */
export function applyBranding(branding: TenantBranding): void {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  root.style.setProperty("--tenant-primary", branding.primaryColor);
  root.style.setProperty("--tenant-secondary", branding.secondaryColor);
  root.style.setProperty("--tenant-accent", branding.accentColor);
  root.style.setProperty("--tenant-bg", branding.backgroundColor);
  root.style.setProperty("--tenant-text", branding.textColor);
}
