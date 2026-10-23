/**
 * AmeniEdge Offline Tile Generator & Seeder
 * Generates valid 256x256 PNG map tiles for local offline map caching.
 * Requires zero external dependencies (pure Node.js).
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Minimal PNG encoder for a 256x256 offline grid tile
function createOfflineGridTilePng(z, x, y) {
  const width = 256;
  const height = 256;
  
  // RGBA buffer: 256 * 256 * 4 bytes + 1 filter byte per line
  const rawData = Buffer.alloc(height * (1 + width * 4));
  
  let offset = 0;
  for (let row = 0; row < height; row++) {
    rawData[offset++] = 0; // Filter type 0 (None)
    for (let col = 0; col < width; col++) {
      const isGrid = (row === 0 || row === height - 1 || col === 0 || col === width - 1 || row % 32 === 0 || col % 32 === 0);
      const isCenter = (row >= 120 && row <= 136 && col >= 120 && col <= 136);
      
      if (isGrid) {
        // Grid line: subtle slate border
        rawData[offset++] = 200; // R
        rawData[offset++] = 210; // G
        rawData[offset++] = 220; // B
        rawData[offset++] = 255; // A
      } else if (isCenter) {
        // Center crosshair / coordinate mark
        rawData[offset++] = 180;
        rawData[offset++] = 195;
        rawData[offset++] = 210;
        rawData[offset++] = 255;
      } else {
        // Soft terrain surface (light warm slate / topographical tint)
        const tint = (row + col) % 64 < 32 ? 245 : 248;
        rawData[offset++] = tint;
        rawData[offset++] = tint - 2;
        rawData[offset++] = tint - 5;
        rawData[offset++] = 255;
      }
    }
  }

  const deflated = zlib.deflateSync(rawData);

  // Helper to build PNG chunks
  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    
    // Compute CRC32
    const crc = crc32(Buffer.concat([typeBuf, data]));
    crcBuf.writeUInt32BE(crc >>> 0, 0);
    
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk: 256x256, 8 bit depth, RGBA (color type 6)
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;  // bit depth
  ihdrData[9] = 6;  // RGBA
  ihdrData[10] = 0; // compression method
  ihdrData[11] = 0; // filter method
  ihdrData[12] = 0; // interlace method
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  const idatChunk = makeChunk('IDAT', deflated);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// CRC32 table & calculator
let crcTable = null;
function getCrcTable() {
  if (crcTable) return crcTable;
  crcTable = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    crcTable[n] = c;
  }
  return crcTable;
}

function crc32(buf) {
  const table = getCrcTable();
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ -1) >>> 0;
}

// Generate sample offline tiles for zoom levels 13 to 15 around Station North (Chennai center: 13.0827, 80.2707)
function lon2tile(lon, zoom) {
  return Math.floor(((lon + 180) / 360) * Math.pow(2, zoom));
}
function lat2tile(lat, zoom) {
  return Math.floor(
    ((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) *
      Math.pow(2, zoom)
  );
}

function seedOfflineTiles() {
  const targetDir = path.join(__dirname, 'tiles');
  console.log('Seeding offline tiles to:', targetDir);

  const centerLat = 13.0827;
  const centerLng = 80.2707;

  let count = 0;
  for (let z = 12; z <= 15; z++) {
    const cx = lon2tile(centerLng, z);
    const cy = lat2tile(centerLat, z);

    for (let dx = -2; dx <= 2; dx++) {
      for (let dy = -2; dy <= 2; dy++) {
        const x = cx + dx;
        const y = cy + dy;

        const tileDir = path.join(targetDir, String(z), String(x));
        fs.mkdirSync(tileDir, { recursive: true });

        const tilePath = path.join(tileDir, `${y}.png`);
        if (!fs.existsSync(tilePath)) {
          const pngBuffer = createOfflineGridTilePng(z, x, y);
          fs.writeFileSync(tilePath, pngBuffer);
          count++;
        }
      }
    }
  }

  console.log(`Generated ${count} offline emergency map tiles for zoom levels 12-15.`);
}

seedOfflineTiles();
