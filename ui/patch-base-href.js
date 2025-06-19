const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'dist', 'ui', 'browser', 'index.html');

if (fs.existsSync(indexPath)) {
  let content = fs.readFileSync(indexPath, 'utf-8');
  content = content.replace('<base href="/">', '<base href="./">');
  fs.writeFileSync(indexPath, content, 'utf-8');
  console.log('Patched <base href> in index.html for Electron.');
} else {
  console.warn('index.html not found, base href patch skipped.');
}
