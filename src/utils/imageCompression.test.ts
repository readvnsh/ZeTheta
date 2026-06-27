/* eslint-disable class-methods-use-this */
import { vi } from 'vitest';
import compressImage from './imageCompression';

describe('compressImage', () => {
  beforeAll(() => {
    global.URL.createObjectURL = vi.fn(() => 'mock-url');
    global.URL.revokeObjectURL = vi.fn();

    global.Image = class {
      onload: () => void = () => {};

      src: string = '';

      width: number = 2000;

      height: number = 1000;

      constructor() {
        setTimeout(() => this.onload(), 0);
      }
    } as any;

    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
      drawImage: vi.fn(),
    })) as any;

    HTMLCanvasElement.prototype.toBlob = vi.fn((callback, type, quality) => {
      // Return 6MB for quality > 0.5, and 3MB for quality <= 0.5 to trigger recursion
      const size = quality && (quality as number) > 0.5 ? 6 * 1024 * 1024 : 3 * 1024 * 1024;
      callback(new Blob(['a'.repeat(size)], { type }));
    }) as any;
  });

  it('bypasses PDFs completely untouched', async () => {
    const file = new File(['pdf-content'], 'statement.pdf', { type: 'application/pdf' });
    const result = await compressImage(file);
    expect(result).toBe(file);
  });

  it('scales dimension and recursively compresses images exceeding target size', async () => {
    const file = new File(['image-content'], 'photo.png', { type: 'image/png' });
    const maxSize = 5 * 1024 * 1024; // 5MB limit

    const result = await compressImage(file, maxSize);
    expect(result.name).toBe('photo.png');
    expect(result.type).toBe('image/jpeg');
    expect(result.size).toBeLessThanOrEqual(maxSize);
  });
});
