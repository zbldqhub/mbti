const fs = require('fs');
const path = require('path');

// 创建mbti目录
const mbtiDir = path.join(__dirname, 'mbti');
if (!fs.existsSync(mbtiDir)) {
  fs.mkdirSync(mbtiDir, { recursive: true });
  console.log('Created mbti directory');
}

// 复制dist目录下的所有文件到mbti目录
const distDir = path.join(__dirname, 'dist');
if (fs.existsSync(distDir)) {
  const files = fs.readdirSync(distDir);
  files.forEach(file => {
    const sourcePath = path.join(distDir, file);
    const destPath = path.join(mbtiDir, file);
    
    if (fs.statSync(sourcePath).isDirectory()) {
      // 复制目录
      if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destPath, { recursive: true });
      }
      const dirFiles = fs.readdirSync(sourcePath);
      dirFiles.forEach(dirFile => {
        const dirSourcePath = path.join(sourcePath, dirFile);
        const dirDestPath = path.join(destPath, dirFile);
        fs.copyFileSync(dirSourcePath, dirDestPath);
      });
    } else {
      // 复制文件
      fs.copyFileSync(sourcePath, destPath);
    }
  });
  console.log('Copied files from dist to mbti directory');
} else {
  console.error('dist directory not found');
}

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
