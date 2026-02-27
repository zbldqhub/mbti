<template>
  <div class="share-container">
    <!-- 海报预览 -->
    <div class="poster-preview">
      <div class="poster-wrapper">
        <canvas ref="posterCanvas" class="poster-canvas"></canvas>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="action-section">
      <p class="tip-text">长按图片保存到相册，或复制文字分享</p>
      
      <div class="button-group">
        <button class="save-btn" @click="savePoster">
          <span class="btn-icon">💾</span>
          <span>保存图片</span>
        </button>
        
        <button class="share-btn" @click="copyShareText">
          <span class="btn-icon">📋</span>
          <span>复制分享文案</span>
        </button>
      </div>
      
      <button class="close-btn" @click="close">
        <span>关闭</span>
      </button>
    </div>

    <!-- 保存成功提示 -->
    <div v-if="showSaveSuccess" class="toast">
      <span>✓ 已保存到相册</span>
    </div>

    <!-- 复制成功提示 -->
    <div v-if="showCopySuccess" class="toast">
      <span>✓ 分享文案已复制</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { calculateMBTIType, getTypeInfo } from '../utils/scoring.js';
import { qrCodeImage } from '../config/images.js';

const props = defineProps({
  scores: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['close']);

const posterCanvas = ref(null);
const showSaveSuccess = ref(false);
const showCopySuccess = ref(false);

const mbtiType = calculateMBTIType(props.scores);
const typeInfo = getTypeInfo(mbtiType);

// 分享链接
const shareUrl = 'https://www.szsztop.cn/mbti';

// 绘制圆角矩形
const roundRect = (ctx, x, y, width, height, radius) => {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
};

// 生成海报
const generatePoster = async () => {
  const canvas = posterCanvas.value;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const dpr = 2;
  
  // 画布尺寸 - 1:1 正方形，更简洁
  const width = 375;
  const height = 600;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
  ctx.scale(dpr, dpr);

  // 清除画布
  ctx.clearRect(0, 0, width, height);

  // ===== 渐变背景 =====
  const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
  bgGradient.addColorStop(0, '#7C3AED');
  bgGradient.addColorStop(1, '#A78BFA');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);

  // ===== 装饰圆点 =====
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  [
    { x: 40, y: 60, r: 40 },
    { x: 340, y: 100, r: 60 },
    { x: 320, y: 280, r: 35 },
    { x: 50, y: 350, r: 50 },
    { x: 330, y: 450, r: 40 }
  ].forEach(c => {
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
    ctx.fill();
  });

  // ===== 顶部标题 =====
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.font = '14px -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('我的 MBTI 性格类型', width / 2, 40);

  // ===== 类型字母（大） =====
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 80px -apple-system, sans-serif';
  ctx.fillText(mbtiType, width / 2, 115);

  // ===== 类型名称 =====
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.font = '24px -apple-system, sans-serif';
  ctx.fillText(typeInfo.name, width / 2, 155);

  // ===== 关键词标签 =====
  const keywords = typeInfo.keywords.slice(0, 3);
  const tagWidth = 76;
  const tagGap = 10;
  const startX = (width - (keywords.length * tagWidth + (keywords.length - 1) * tagGap)) / 2;
  
  keywords.forEach((keyword, i) => {
    const x = startX + i * (tagWidth + tagGap);
    const y = 175;
    
    // 标签背景
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    roundRect(ctx, x, y, tagWidth, 28, 14);
    ctx.fill();
    
    // 标签文字
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '12px -apple-system, sans-serif';
    ctx.fillText(keyword, x + tagWidth / 2, y + 19);
  });

  // ===== 分隔线 =====
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(60, 220);
  ctx.lineTo(315, 220);
  ctx.stroke();

  // ===== 核心特质（简化展示） =====
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 16px -apple-system, sans-serif';
  ctx.fillText('核心特质', width / 2, 250);

  const traits = typeInfo.description.traits.slice(0, 3);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.font = '14px -apple-system, sans-serif';
  ctx.textAlign = 'left';
  
  traits.forEach((trait, i) => {
    const y = 280 + i * 32;
    // 圆点
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.arc(70, y - 4, 4, 0, Math.PI * 2);
    ctx.fill();
    // 文字
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    // 截断文字避免过长
    const displayTrait = trait.length > 18 ? trait.substring(0, 18) + '...' : trait;
    ctx.fillText(displayTrait, 85, y);
  });

  // ===== 底部区域 - 二维码 =====
  const bottomY = 420;
  
  // 二维码背景卡片 - 增加高度给网址留出空间
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  roundRect(ctx, 30, bottomY, width - 60, 155, 16);
  ctx.fill();

  // 绘制二维码
  try {
    const qrImg = await loadImage(qrCodeImage);
    const qrSize = 85;
    const qrX = 50;
    const qrY = bottomY + 20;
    
    // 白色背景
    ctx.fillStyle = '#FFFFFF';
    roundRect(ctx, qrX - 5, qrY - 5, qrSize + 10, qrSize + 10, 8);
    ctx.fill();
    
    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
  } catch (e) {
    // 占位符
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(50, bottomY + 20, 85, 85);
    ctx.fillStyle = '#8B5CF6';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('二维码', 92, bottomY + 68);
  }

  // 右侧文字
  ctx.textAlign = 'left';
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 16px -apple-system, sans-serif';
  ctx.fillText('扫码测测你的', 155, bottomY + 45);
  ctx.fillText('MBTI性格', 155, bottomY + 70);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.font = '13px -apple-system, sans-serif';
  ctx.fillText('3分钟快速测试 · 免费', 155, bottomY + 98);

  // 网址 - 放在卡片底部居中，与上方内容保持距离
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.font = '12px -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(shareUrl, width / 2, bottomY + 138);
};

// 加载图片
const loadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (src.startsWith('http')) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('加载失败'));
    img.src = src;
  });
};

// 保存海报
const savePoster = () => {
  const canvas = posterCanvas.value;
  if (!canvas) return;

  const link = document.createElement('a');
  link.download = `MBTI-${mbtiType}-性格报告.png`;
  link.href = canvas.toDataURL('image/png', 1.0);
  link.click();

  showSaveSuccess.value = true;
  setTimeout(() => showSaveSuccess.value = false, 2000);
};

// 复制分享文案
const copyShareText = () => {
  const text = `🔮 我的MBTI性格类型是 ${mbtiType}（${typeInfo.name}）\n\n✨ 性格关键词：${typeInfo.keywords.join(' · ')}\n\n💡 快来测测你的MBTI性格类型吧！\n${shareUrl}`;
  
  navigator.clipboard.writeText(text).then(() => {
    showCopySuccess.value = true;
    setTimeout(() => showCopySuccess.value = false, 2000);
  }).catch(() => {
    alert('复制失败，请手动复制');
  });
};

// 关闭
const close = () => emit('close');

onMounted(() => {
  generatePoster();
});
</script>

<style scoped>
.share-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.92);
  display: flex;
  flex-direction: column;
  z-index: 1000;
}

.poster-preview {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  overflow: auto;
}

.poster-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

.poster-canvas {
  max-height: 55vh;
  max-width: 85vw;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}

.action-section {
  padding: 12px 20px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom, 20px));
}

.tip-text {
  text-align: center;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 10px;
}

.button-group {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.save-btn, .share-btn {
  flex: 1;
  height: 46px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  border: none;
  transition: transform 0.2s;
}

.save-btn:active, .share-btn:active {
  transform: scale(0.98);
}

.save-btn {
  background: white;
  color: #1F2937;
}

.share-btn {
  background: linear-gradient(135deg, #8B5CF6, #7C3AED);
  color: white;
}

.close-btn {
  width: 100%;
  height: 42px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  cursor: pointer;
}

.toast {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.85);
  color: white;
  padding: 14px 28px;
  border-radius: 24px;
  font-size: 14px;
  z-index: 1002;
}
</style>
