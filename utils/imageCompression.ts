export interface CompressedImage {
  base64: string;
  mimeType: string;
}

/**
 * Resizes and compresses a browser File on an offscreen canvas so payloads stay
 * well below Vercel's 4.5MB body limit while keeping ruler graduations sharp.
 */
export async function compressImageFile(
  file: File,
  maxDimension = 1600,
  quality = 0.84
): Promise<CompressedImage> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas 2D context unavailable.'));
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      const mimeType = 'image/jpeg';
      const base64 = canvas.toDataURL(mimeType, quality);
      resolve({ base64, mimeType });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`Failed to decode image: ${file.name}`));
    };

    img.src = objectUrl;
  });
}
