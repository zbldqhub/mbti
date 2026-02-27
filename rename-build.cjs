const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist');

if (!fs.existsSync(distDir)) {
  console.error('dist directory not found');
  process.exit(1);
}

// 在dist目录内创建mbti目录
const mbtiDir = path.join(distDir, 'mbti');
if (!fs.existsSync(mbtiDir)) {
  fs.mkdirSync(mbtiDir, { recursive: true });
  console.log('Created dist/mbti directory');
}

// 复制vue-index.html到mbti目录并重命名为index.html
const vueIndexPath = path.join(distDir, 'vue-index.html');
const mbtiIndexPath = path.join(mbtiDir, 'index.html');
if (fs.existsSync(vueIndexPath)) {
  let content = fs.readFileSync(vueIndexPath, 'utf8');
  // 修改资源引用路径，从mbti目录指向父目录的assets
  content = content.replace(/src="\.\/assets\//g, 'src="../assets/');
  content = content.replace(/href="\.\/assets\//g, 'href="../assets/');
  fs.writeFileSync(mbtiIndexPath, content);
  console.log('Created dist/mbti/index.html with updated asset paths');
  
  // 删除原始的vue-index.html
  fs.unlinkSync(vueIndexPath);
  console.log('Removed original vue-index.html');
} else {
  console.error('vue-index.html not found in dist');
}

// 修改主index.html中的MBTI链接为相对路径
const mainIndexPath = path.join(distDir, 'index.html');
if (fs.existsSync(mainIndexPath)) {
  let content = fs.readFileSync(mainIndexPath, 'utf8');
  // 将/mbti链接改为相对路径 ./mbti/
  content = content.replace(/href="\/mbti"/g, 'href="./mbti/"');
  fs.writeFileSync(mainIndexPath, content);
  console.log('Updated main index.html MBTI link to relative path');
}

console.log('');
console.log('Build post-processing completed!');
console.log('');
console.log('Deployment structure:');
console.log('  dist/');
console.log('    ├── index.html      (主页 - 访问 /)');
console.log('    ├── assets/         (公共资源)');
console.log('    └── mbti/');
console.log('         └── index.html (MBTI测试页 - 访问 /mbti/)');
console.log('');
console.log('部署时只需上传 dist 目录即可！');
