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
  console.log('Copied files to mbti directory');
} else {
  console.error('dist directory not found');
}
