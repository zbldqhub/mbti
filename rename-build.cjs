const fs = require('fs');
const path = require('path');

// 重命名HTML文件
const htmlPath = path.join(__dirname, 'mbti', 'vue-index.html');
const newHtmlPath = path.join(__dirname, 'mbti', 'index.html');
if (fs.existsSync(htmlPath)) {
  fs.renameSync(htmlPath, newHtmlPath);
  console.log('Renamed vue-index.html to index.html');
}

// 重命名CSS和JS文件
const assetsDir = path.join(__dirname, 'mbti', 'assets');
if (fs.existsSync(assetsDir)) {
  const files = fs.readdirSync(assetsDir);
  files.forEach(file => {
    if (file.startsWith('vue-index-')) {
      const newFileName = file.replace('vue-index-', 'index-');
      const oldPath = path.join(assetsDir, file);
      const newPath = path.join(assetsDir, newFileName);
      fs.renameSync(oldPath, newPath);
      console.log(`Renamed ${file} to ${newFileName}`);
    }
  });
}

// 修改index.html文件中的资源引用
const indexHtmlPath = path.join(__dirname, 'mbti', 'index.html');
if (fs.existsSync(indexHtmlPath)) {
  let content = fs.readFileSync(indexHtmlPath, 'utf8');
  content = content.replace(/vue-index-/g, 'index-');
  fs.writeFileSync(indexHtmlPath, content);
  console.log('Updated resource references in index.html');
}
