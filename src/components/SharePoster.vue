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
      <p class="tip-text">长按图片保存到相册</p>
      
      <div class="button-group">
        <button class="save-btn" @click="savePoster">
          <span class="btn-icon">💾</span>
          <span>保存图片</span>
        </button>
        
        <button class="share-btn" @click="showShareOptions">
          <span class="btn-icon">📤</span>
          <span>分享</span>
        </button>
      </div>
      
      <button class="close-btn" @click="close">
        <span>关闭</span>
      </button>
    </div>

    <!-- 分享选项弹窗 -->
    <div v-if="showShareModal" class="share-modal" @click.self="hideShareOptions">
      <div class="share-panel">
        <h3 class="share-title">分享到</h3>
        <div class="share-options">
          <button class="share-option xiaohongshu" @click="shareToXiaohongshu">
            <div class="option-icon">📕</div>
            <span>小红书</span>
          </button>
          
          <button class="share-option wechat" @click="shareToWechat">
            <div class="option-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348z"/>
              </svg>
            </div>
            <span>微信</span>
          </button>
          
          <button class="share-option moments" @click="shareToMoments">
            <div class="option-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm3.5 14.5h-7v-1h7v1zm0-3h-7v-1h7v1zm0-3h-7v-1h7v1z"/>
              </svg>
            </div>
            <span>朋友圈</span>
          </button>
          
          <button class="share-option weibo" @click="shareToWeibo">
            <div class="option-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M10.098 20.323c-3.977.391-7.414-1.406-7.672-4.02-.259-2.609 2.759-5.047 6.74-5.441 3.979-.394 7.413 1.404 7.671 4.018.259 2.6-2.759 5.049-6.739 5.443z"/>
              </svg>
            </div>
            <span>微博</span>
          </button>
          
          <button class="share-option copy" @click="copyLink">
            <div class="option-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
              </svg>
            </div>
            <span>复制链接</span>
          </button>
        </div>
        
        <button class="cancel-btn" @click="hideShareOptions">取消</button>
      </div>
    </div>

    <!-- 保存成功提示 -->
    <div v-if="showSaveSuccess" class="toast">
      <span>✓ 已保存到相册</span>
    </div>

    <!-- 复制成功提示 -->
    <div v-if="showCopySuccess" class="toast">
      <span>✓ 链接已复制</span>
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
const showShareModal = ref(false);
const showSaveSuccess = ref(false);
const showCopySuccess = ref(false);

const mbtiType = calculateMBTIType(props.scores);
const typeInfo = getTypeInfo(mbtiType);
const percentages = calculatePercentages(props.scores);

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
  
  // 画布尺寸 - 9:16 竖版，适合小红书
  const width = 375;
  const height = 667;
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
  ctx.fillText('我的MBTI性格类型', width / 2, 50);

  // ===== 类型字母 =====
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 72px -apple-system, sans-serif';
  ctx.fillText(mbtiType, width / 2, 120);

  // ===== 类型名称 =====
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.font = '28px -apple-system, sans-serif';
  ctx.fillText(typeInfo.name, width / 2, 160);

  // ===== 关键词标签 =====
  const keywords = typeInfo.keywords.slice(0, 3);
  const tagWidth = 80;
  const tagGap = 12;
  const startX = (width - (keywords.length * tagWidth + (keywords.length - 1) * tagGap)) / 2;
  
  keywords.forEach((keyword, i) => {
    const x = startX + i * (tagWidth + tagGap);
    const y = 180;
    
    // 标签背景
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    roundRect(ctx, x, y, tagWidth, 30, 15);
    ctx.fill();
    
    // 标签文字
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '13px -apple-system, sans-serif';
    ctx.fillText(keyword, x + tagWidth / 2, y + 20);
  });

  // ===== 白色卡片 - 维度分析 =====
  const cardY = 235;
  const cardH = 280;
  ctx.fillStyle = '#FFFFFF';
  roundRect(ctx, 24, cardY, width - 48, cardH, 16);
  ctx.fill();

  // 卡片标题
  ctx.fillStyle = '#1F2937';
  ctx.font = 'bold 18px -apple-system, sans-serif';
  ctx.fillText('性格维度分析', width / 2, cardY + 35);

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

  let y = cardY + 65;
  const barMaxW = 200;
  const barH = 14;

  dims.forEach(d => {
    // 名称
    ctx.fillStyle = '#6B7280';
    ctx.font = '12px -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(d.name, 50, y + 10);

    // 背景条
    ctx.fillStyle = '#F3F4F6';
    roundRect(ctx, 110, y - 2, barMaxW, barH, 7);
    ctx.fill();

    // 进度条
    ctx.fillStyle = d.color;
    const barW = Math.max((d.val / 100) * barMaxW, 4);
    roundRect(ctx, 110, y - 2, barW, barH, 7);
    ctx.fill();

    // 百分比
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 12px -apple-system, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(d.val + '%', 325, y + 10);

    y += 30;
  });

  // ===== 底部区域 =====
  const bottomY = 540;
  
  // Logo
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 20px -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🔮 MBTI性格测试', width / 2, bottomY);

  // 二维码背景卡片
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  roundRect(ctx, 24, bottomY + 20, width - 48, 90, 12);
  ctx.fill();

  // 绘制二维码
  try {
    const qrImg = await loadImage(qrCodeImage);
    const qrSize = 70;
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
    ctx.fillRect(45, bottomY + 30, 70, 70);
    ctx.fillStyle = '#8B5CF6';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('二维码', 80, bottomY + 70);
  }

  // 二维码文字
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '16px -apple-system, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('扫码测测你的MBTI性格', 130, bottomY + 60);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.font = '13px -apple-system, sans-serif';
  ctx.fillText('3分钟快速测试 · 免费体验', 130, bottomY + 85);
};

// 加载图片
const loadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
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

// 分享选项
const showShareOptions = () => showShareModal.value = true;
const hideShareOptions = () => showShareModal.value = false;

// 分享到小红书
const shareToXiaohongshu = () => {
  alert('已保存图片，请打开小红书发布笔记');
  savePoster();
  hideShareOptions();
};

// 分享到微信
const shareToWechat = () => {
  if (typeof wx !== 'undefined') {
    wx.updateAppMessageShareData({
      title: `我的MBTI性格类型是${mbtiType}`,
      desc: typeInfo.keywords.join(' · '),
      link: window.location.href,
      success: () => hideShareOptions()
    });
  } else {
    alert('请在微信中打开后分享');
  }
};

// 分享到朋友圈
const shareToMoments = () => {
  if (typeof wx !== 'undefined') {
    wx.updateTimelineShareData({
      title: `我的MBTI性格类型是${mbtiType} - ${typeInfo.name}`,
      link: window.location.href,
      success: () => hideShareOptions()
    });
  } else {
    alert('请在微信中打开后分享');
  }
};

// 分享到微博
const shareToWeibo = () => {
  const text = `我的MBTI性格类型是${mbtiType} - ${typeInfo.name}`;
  window.open(`http://service.weibo.com/share/share.php?title=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}`, '_blank');
  hideShareOptions();
};

// 复制链接
const copyLink = () => {
  const text = `我的MBTI性格类型是${mbtiType} - ${typeInfo.name}，快来测测你的吧！${window.location.href}`;
  navigator.clipboard.writeText(text).then(() => {
    showCopySuccess.value = true;
    setTimeout(() => showCopySuccess.value = false, 2000);
    hideShareOptions();
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
  padding: 20px;
  overflow: auto;
}

.poster-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

.poster-canvas {
  max-height: 55vh;
  max-width: 90vw;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}

.action-section {
  padding: 16px 20px;
  padding-bottom: calc(16px + env(safe-area-inset-bottom, 20px));
}

.tip-text {
  text-align: center;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 12px;
}

.button-group {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.save-btn, .share-btn {
  flex: 1;
  height: 48px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
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
  height: 44px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 15px;
  cursor: pointer;
}

/* 分享弹窗 */
.share-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1001;
}

.share-panel {
  width: 100%;
  background: white;
  border-radius: 20px 20px 0 0;
  padding: 24px 20px;
  padding-bottom: calc(24px + env(safe-area-inset-bottom, 20px));
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.share-title {
  font-size: 17px;
  font-weight: 600;
  color: #1F2937;
  text-align: center;
  margin-bottom: 20px;
}

.share-options {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.share-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 10px 4px;
  border: none;
  background: transparent;
  cursor: pointer;
}

.option-icon {
  width: 50px;
  height: 50px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.option-icon svg {
  width: 24px;
  height: 24px;
}

.share-option.xiaohongshu .option-icon {
  background: #FF2442;
  color: white;
}

.share-option.wechat .option-icon {
  background: #07C160;
  color: white;
}

.share-option.moments .option-icon {
  background: #07C160;
  color: white;
}

.share-option.weibo .option-icon {
  background: #E6162D;
  color: white;
}

.share-option.copy .option-icon {
  background: #8B5CF6;
  color: white;
}

.share-option span {
  font-size: 11px;
  color: #6B7280;
}

.cancel-btn {
  width: 100%;
  height: 48px;
  background: #F3F4F6;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  color: #6B7280;
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
