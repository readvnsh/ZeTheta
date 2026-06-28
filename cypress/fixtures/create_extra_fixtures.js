import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fixturesDir = __dirname;

// 1. Create invalid-type.zip (small mock zip file)
fs.writeFileSync(path.join(fixturesDir, 'invalid-type.zip'), 'mock zip content');

// 2. Create large-file.pdf (over 5MB: 5.5MB)
const largePdfBuffer = Buffer.alloc(5.5 * 1024 * 1024);
fs.writeFileSync(path.join(fixturesDir, 'large-file.pdf'), largePdfBuffer);

// 3. Create large-image.png (valid transparent PNG padded to 2.5MB)
const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
const pngBuffer = Buffer.from(pngBase64, 'base64');
const paddingBuffer = Buffer.alloc(2.5 * 1024 * 1024 - pngBuffer.length);
const largePngBuffer = Buffer.concat([pngBuffer, paddingBuffer]);
fs.writeFileSync(path.join(fixturesDir, 'large-image.png'), largePngBuffer);

console.log('Extra fixtures created successfully!');
