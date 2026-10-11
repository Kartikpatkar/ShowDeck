const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const outDir = path.resolve(rootDir, 'www');

// Clean / create www
if (fs.existsSync(outDir)) {
  fs.rmSync(outDir, { recursive: true, force: true });
}
fs.mkdirSync(outDir, { recursive: true });

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const item of fs.readdirSync(src)) {
      copyRecursive(path.join(src, item), path.join(dest, item));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

const itemsToCopy = ['index.html', 'privacy.html', 'terms.html', 'manifest.json', 'css', 'js', 'assets'];

for (const item of itemsToCopy) {
  const src = path.join(rootDir, item);
  const dest = path.join(outDir, item);
  if (fs.existsSync(src)) {
    copyRecursive(src, dest);
    console.log(`Copied ${item} -> www/`);
  }
}

console.log('Build complete: files staged to www/');
