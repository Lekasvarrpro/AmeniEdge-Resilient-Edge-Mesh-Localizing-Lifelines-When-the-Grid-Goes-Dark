import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.resolve(__dirname, '../src');

// Regex detecting Unicode emoji and pictograph characters
const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E0}-\u{1F1FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1FA70}-\u{1FAFF}\u{2B50}\u{203C}\u{2049}\u{25AA}\u{25AB}\u{25B6}\u{25C0}\u{25FB}-\u{25FE}]/u;

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(full));
    } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.css') || file.endsWith('.html')) {
      const content = fs.readFileSync(full, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (emojiRegex.test(line)) {
          results.push({
            file: path.relative(path.resolve(__dirname, '..'), full),
            line: idx + 1,
            text: line.trim(),
          });
        }
      });
    }
  }
  return results;
}

const violations = walk(srcDir);
if (violations.length > 0) {
  console.error(`\x1b[31m[EMOJI VIOLATION] Found ${violations.length} emoji characters in frontend/src/:\x1b[0m`);
  violations.forEach((v) => {
    console.error(`  ${v.file}:${v.line} -> ${v.text}`);
  });
  console.error('\nUse only react-icons (Fi, Fa, Md, etc.) instead of raw emoji characters.');
  process.exit(1);
} else {
  console.log('\x1b[32m✓ Zero emojis detected! All icons in frontend/src use valid react-icons.\x1b[0m');
  process.exit(0);
}

