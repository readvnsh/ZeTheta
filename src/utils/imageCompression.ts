/**
 * Client-side recursive canvas image compression pipeline.
 * Scales the maximum dimension to 1200px and reduces JPEG quality
 * recursively to fit target maximum file size.
 *
 * @param file The input File object.
 * @param maxSize Target maximum size in bytes (defaults to 5MB).
 */
const compressImage = async (
  file: File,
  maxSize: number = 5 * 1024 * 1024,
): Promise<File> => {
  // Return PDFs and other non-compressable types untouched
  if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
    return file;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(img.src);

      let { width, height } = img;
      const maxDim = 1200;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context could not be created'));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);

      const tryCompress = (quality: number) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Canvas toBlob failed'));
              return;
            }

            // If exceeds size and we can still reduce quality, recurse
            if (blob.size > maxSize && quality > 0.35) {
              tryCompress(quality - 0.1);
            } else {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            }
          },
          'image/jpeg',
          quality,
        );
      };

      tryCompress(0.7);
    };
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
  });
};

export default compressImage;
