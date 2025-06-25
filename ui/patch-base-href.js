const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'dist', 'ui', 'browser', 'index.html');

if (fs.existsSync(indexPath)) {
  let content = fs.readFileSync(indexPath, 'utf-8');
  
  // 替换 base href 为相对路径
  content = content.replace('<base href="/">', '<base href="./"/>');
  content = content.replace(/<base href="[^"]*">/g, '<base href="./"/>');
  
  // 确保所有资源路径都是相对路径
  content = content.replace(/src="\//g, 'src="./');
  content = content.replace(/href="\//g, 'href="./');
  
  fs.writeFileSync(indexPath, content, 'utf-8');
  console.log('Patched base href and resource paths in index.html for Electron.');
  console.log('Index.html location:', indexPath);
} else {
  console.warn('index.html not found at:', indexPath);
}
