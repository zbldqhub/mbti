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
import { calculateMBTIType, getTypeInfo, calculatePercentages } from '../utils/scoring.js';
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
const percentages = calculatePercentages(props.scores);

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
  const dpr = 2; // 高清输出
  
  // 画布尺寸 - 加高以提供更好的间距
  const width = 375;
  const height = 720;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
  ctx.scale(dpr, dpr);

  // 清除画布
  ctx.clearRect(0, 0, width, height);

  // ===== 背景 =====
  const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
  bgGradient.addColorStop(0, '#7C3AED');
  bgGradient.addColorStop(0.5, '#8B5CF6');
  bgGradient.addColorStop(1, '#A78BFA');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);

  // 装饰圆
  ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
  [
    { x: 50, y: 80, r: 50 },
    { x: 340, y: 120, r: 70 },
    { x: 300, y: 300, r: 40 },
    { x: 60, y: 400, r: 60 },
    { x: 320, y: 520, r: 45 },
    { x: 100, y: 600, r: 35 }
  ].forEach(c => {
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
    ctx.fill();
  });

  // ===== 顶部标题 =====
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.font = '16px -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('我的MBTI性格类型', width / 2, 45);

  // ===== 类型字母 =====
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 68px -apple-system, sans-serif';
  ctx.fillText(mbtiType, width / 2, 110);

  // ===== 类型名称 =====
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.font = '26px -apple-system, sans-serif';
  ctx.fillText(typeInfo.name, width / 2, 150);

  // ===== 关键词标签 =====
  const keywords = typeInfo.keywords.slice(0, 3);
  const tagWidth = 80;
  const tagGap = 12;
  const startX = (width - (keywords.length * tagWidth + (keywords.length - 1) * tagGap)) / 2;
  
  keywords.forEach((keyword, i) => {
    const x = startX + i * (tagWidth + tagGap);
    const y = 170;
    
    // 标签背景
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    roundRect(ctx, x, y, tagWidth, 28, 14);
    ctx.fill();
    
    // 标签文字
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '12px -apple-system, sans-serif';
    ctx.fillText(keyword, x + tagWidth / 2, y + 19);
  });

  // ===== 白色卡片 - 维度分析 =====
  const cardY = 215;
  const cardH = 260;
  ctx.fillStyle = '#FFFFFF';
  roundRect(ctx, 24, cardY, width - 48, cardH, 16);
  ctx.fill();

  // 卡片标题
  ctx.fillStyle = '#1F2937';
  ctx.font = 'bold 17px -apple-system, sans-serif';
  ctx.fillText('性格维度分析', width / 2, cardY + 32);

  // 维度数据
  const dims = [
    { name: '外向 E', val: percentages.E, color: '#F59E0B' },
    { name: '内向 I', val: percentages.I, color: '#8B5CF6' },
    { name: '实感 S', val: percentages.S, color: '#3B82F6' },
    { name: '直觉 N', val: percentages.N, color: '#8B5CF6' },
    { name: '思考 T', val: percentages.T, color: '#EC4899' },
    { name: '情感 F', val: percentages.F, color: '#8B5CF6' },
    { name: '判断 J', val: percentages.J, color: '#10B981' },
    { name: '知觉 P', val: percentages.P, color: '#8B5CF6' }
  ];

  let y = cardY + 58;
  const barMaxW = 190;
  const barH = 12;

  dims.forEach(d => {
    // 名称
    ctx.fillStyle = '#6B7280';
    ctx.font = '11px -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(d.name, 45, y + 9);

    // 背景条
    ctx.fillStyle = '#F3F4F6';
    roundRect(ctx, 100, y - 2, barMaxW, barH, 6);
    ctx.fill();

    // 进度条
    ctx.fillStyle = d.color;
    const barW = Math.max((d.val / 100) * barMaxW, 4);
    roundRect(ctx, 100, y - 2, barW, barH, 6);
    ctx.fill();

    // 百分比
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 11px -apple-system, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(d.val + '%', 315, y + 9);

    y += 28;
  });

  // ===== 底部区域 =====
  const bottomY = 495;
  
  // Logo
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 18px -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🔮 MBTI性格测试', width / 2, bottomY);

  // 二维码背景卡片
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  roundRect(ctx, 24, bottomY + 18, width - 48, 100, 12);
  ctx.fill();

  // 绘制二维码
  try {
    const qrImg = await loadImage(qrCodeImage);
    const qrSize = 75;
    const qrX = 45;
    const qrY = bottomY + 30;
    
    // 白色背景
    ctx.fillStyle = '#FFFFFF';
    roundRect(ctx, qrX - 4, qrY - 4, qrSize + 8, qrSize + 8, 6);
    ctx.fill();
    
    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
  } catch (e) {
    // 占位符
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(45, bottomY + 30, 75, 75);
    ctx.fillStyle = '#8B5CF6';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('二维码', 82, bottomY + 72);
  }

  // 二维码文字
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '15px -apple-system, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('扫码测测你的MBTI性格', 135, bottomY + 60);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.font = '12px -apple-system, sans-serif';
  ctx.fillText('3分钟快速测试 · 免费体验', 135, bottomY + 82);

  // 网址
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.font = '13px -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(shareUrl, width / 2, bottomY + 108);
};

// 加载图片
const loadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // 只有跨域图片才需要设置 crossOrigin
    // 本地图片不需要，否则会导致加载失败
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
  const text = `🔮 我的MBTI性格类型是 ${mbtiType}（${typeInfo.name}）\n\n✨ 性格关键词：${typeInfo.keywords.join(' · ')}\n\n🎯 推荐职业：${typeInfo.description.careers.slice(0, 5).join('、')}\n\n💡 快来测测你的MBTI性格类型吧！\n${shareUrl}`;
  
  navigator.clipboard.writeText(text).then(() => {
    showCopySuccess.value = true;
    setTimeout(() => showCopySuccess.value = false, 2000);
  }).catch(() => {
    // 如果复制失败，显示提示
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
  max-height: 52vh;
  max-width: 85vw;
  border-radius: 12px;
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
