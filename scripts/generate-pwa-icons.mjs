import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = crc ^ buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ -1) >>> 0;
}

function makeChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);

  const crcTarget = Buffer.concat([typeBuf, data]);
  const crcVal = crc32(crcTarget);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crcVal, 0);

  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function createPng(width, height, isMaskable = false) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8-bit depth
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0; // Deflate
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // No interlace

  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // Pixel buffer: each scanline has 1 filter byte (0) + width * 4 (RGBA)
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  const cx = width / 2;
  const cy = height / 2;
  const radius = isMaskable ? width / 2 : width * 0.44;
  const cornerR = width * 0.22;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter: None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;

      let r = 0, g = 0, b = 0, a = 0;

      if (isMaskable) {
        // Full background gradient amber
        const factor = (x + y) / (width + height);
        r = Math.round(245 - factor * 25); // #f59e0b -> #d97706
        g = Math.round(158 - factor * 35);
        b = Math.round(11 + factor * 5);
        a = 255;
      } else {
        // Rounded rectangle
        const dx = Math.abs(x - cx);
        const dy = Math.abs(y - cy);
        const innerW = cx - cornerR;
        const innerH = cy - cornerR;

        let inShape = false;
        if (dx <= innerW && dy <= cy * 0.92) inShape = true;
        else if (dy <= innerH && dx <= cx * 0.92) inShape = true;
        else if (dx > innerW && dy > innerH) {
          const cornerDist = Math.hypot(dx - innerW, dy - innerH);
          if (cornerDist <= cornerR * 0.92) inShape = true;
        }

        if (inShape) {
          const factor = (x + y) / (width + height);
          r = Math.round(245 - factor * 20);
          g = Math.round(158 - factor * 30);
          b = Math.round(11 + factor * 5);
          a = 255;
        }
      }

      // Draw Wallet Icon in the middle
      // Scale wallet relative to icon size
      const scale = isMaskable ? 0.48 : 0.52;
      const wx = (x - cx) / (width * scale);
      const wy = (y - cy) / (height * scale);

      // Wallet body: -0.6 to 0.6 in X, -0.45 to 0.45 in Y
      const inWalletBody = (wx >= -0.65 && wx <= 0.65 && wy >= -0.45 && wy <= 0.50);
      const inWalletBodyRounded = inWalletBody && (
        !(wx < -0.55 && wy < -0.35 && Math.hypot(wx + 0.55, wy + 0.35) > 0.1) &&
        !(wx > 0.55 && wy < -0.35 && Math.hypot(wx - 0.55, wy + 0.35) > 0.1) &&
        !(wx < -0.55 && wy > 0.40 && Math.hypot(wx + 0.55, wy - 0.40) > 0.1) &&
        !(wx > 0.55 && wy > 0.40 && Math.hypot(wx - 0.55, wy - 0.40) > 0.1)
      );

      // Wallet top flap
      const inFlap = (wx >= -0.65 && wx <= 0.65 && wy >= -0.45 && wy <= -0.15);

      // Wallet clasp / button
      const inClasp = (wx >= 0.18 && wx <= 0.68 && wy >= -0.10 && wy <= 0.22);
      const inClaspDot = Math.hypot(wx - 0.45, wy - 0.06) <= 0.055;

      if (a > 0) {
        if (inClaspDot) {
          // Gold dot in clasp
          r = 245; g = 158; b = 11;
        } else if (inClasp) {
          // White clasp
          r = 255; g = 255; b = 255;
        } else if (inFlap) {
          // Off-white / light cream top fold
          r = 255; g = 255; b = 255;
        } else if (inWalletBodyRounded) {
          // Main white body
          r = 255; g = 255; b = 255;
        }
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const deflated = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', deflated);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

const iconsDir = path.resolve('public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate icons
fs.writeFileSync(path.join(iconsDir, 'icon-192x192.png'), createPng(192, 192, false));
fs.writeFileSync(path.join(iconsDir, 'icon-512x512.png'), createPng(512, 512, false));
fs.writeFileSync(path.join(iconsDir, 'maskable-icon-192x192.png'), createPng(192, 192, true));
fs.writeFileSync(path.join(iconsDir, 'maskable-icon-512x512.png'), createPng(512, 512, true));
fs.writeFileSync(path.join(iconsDir, 'apple-touch-icon.png'), createPng(180, 180, false));

console.log('✅ PWA Icons successfully generated in public/icons/');
