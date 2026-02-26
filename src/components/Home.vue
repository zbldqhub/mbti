<template>
  <div class="home-container">
    <!-- 顶部装饰 -->
    <div class="decoration-top">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
    </div>

    <!-- Logo区域 -->
    <div class="logo-section">
      <div class="logo">
        <span class="logo-icon">🔮</span>
      </div>
      <h1 class="title">3分钟性格探索</h1>
      <p class="subtitle">发现真实的自己</p>
    </div>

    <!-- 中央视觉元素 -->
    <div class="visual-section">
      <div class="mbti-letters">
        <span class="letter" v-for="(letter, index) in mbtiLetters" :key="index" :style="{ animationDelay: `${index * 0.1}s` }">
          {{ letter }}
        </span>
      </div>
      <div class="floating-icons">
        <span class="icon icon-1">✨</span>
        <span class="icon icon-2">🌟</span>
        <span class="icon icon-3">💫</span>
      </div>
    </div>

    <!-- 主按钮区域 -->
    <div class="action-section">
      <button class="start-btn" @click="startTest">
        <span class="btn-text">开始测试</span>
        <span class="btn-arrow">→</span>
      </button>
      <p class="sub-text">基于经典MBTI理论 · 全部免费</p>
    </div>

    <!-- 底部信息 -->
    <div class="footer-section">
      <p class="participants">已有 <span class="number">128万</span> 人参与</p>
      <div class="features">
        <span class="feature">
          <span class="check">✓</span> 科学准确
        </span>
        <span class="feature">
          <span class="check">✓</span> 即时结果
        </span>
        <span class="feature">
          <span class="check">✓</span> 专业分析
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const mbtiLetters = ref(['E', 'I', 'S', 'N', 'T', 'F', 'J', 'P']);

const emit = defineEmits(['start']);

const startTest = () => {
  emit('start');
};
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #F3F4F6 0%, #FFFFFF 100%);
  display: flex;
  flex-direction: column;
  padding: 24px 20px;
  position: relative;
  overflow: hidden;
}

/* 顶部装饰 */
.decoration-top {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 200px;
  overflow: hidden;
  pointer-events: none;
}

.circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.1;
}

.circle-1 {
  width: 300px;
  height: 300px;
  background: linear-gradient(135deg, #8B5CF6, #7C3AED);
  top: -150px;
  right: -100px;
  animation: float 6s ease-in-out infinite;
}

.circle-2 {
  width: 200px;
  height: 200px;
  background: linear-gradient(135deg, #A78BFA, #8B5CF6);
  top: -80px;
  left: -60px;
  animation: float 8s ease-in-out infinite reverse;
}

.circle-3 {
  width: 150px;
  height: 150px;
  background: linear-gradient(135deg, #C4B5FD, #A78BFA);
  top: 50px;
  right: 50px;
  animation: float 7s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-20px) scale(1.05); }
}

/* Logo区域 */
.logo-section {
  text-align: center;
  margin-top: 60px;
  z-index: 1;
}

.logo {
  margin-bottom: 16px;
}

.logo-icon {
  font-size: 56px;
  display: inline-block;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.title {
  font-size: 28px;
  font-weight: 700;
  color: #1F2937;
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
}

.subtitle {
  font-size: 16px;
  color: #6B7280;
  margin: 0;
}

/* 中央视觉元素 */
.visual-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  margin: 40px 0;
}

.mbti-letters {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
  max-width: 280px;
}

.letter {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #8B5CF6, #7C3AED);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 700;
  color: white;
  box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
  animation: popIn 0.5s ease-out forwards;
  opacity: 0;
  transform: scale(0);
}

@keyframes popIn {
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.floating-icons {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.icon {
  position: absolute;
  font-size: 24px;
  animation: twinkle 2s ease-in-out infinite;
}

.icon-1 {
  top: 20%;
  left: 15%;
  animation-delay: 0s;
}

.icon-2 {
  top: 60%;
  right: 10%;
  animation-delay: 0.5s;
}

.icon-3 {
  bottom: 20%;
  left: 20%;
  animation-delay: 1s;
}

@keyframes twinkle {
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
}

/* 主按钮区域 */
.action-section {
  text-align: center;
  margin-bottom: 32px;
  z-index: 1;
}

.start-btn {
  width: 100%;
  max-width: 320px;
  height: 52px;
  background: linear-gradient(135deg, #8B5CF6, #7C3AED);
  border: none;
  border-radius: 26px;
  color: white;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 4px 20px rgba(139, 92, 246, 0.4);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.start-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s ease;
}

.start-btn:hover::before {
  left: 100%;
}

.start-btn:active {
  transform: scale(0.98);
}

.btn-arrow {
  transition: transform 0.3s ease;
}

.start-btn:hover .btn-arrow {
  transform: translateX(4px);
}

.sub-text {
  margin-top: 16px;
  font-size: 14px;
  color: #9CA3AF;
}

/* 底部信息 */
.footer-section {
  text-align: center;
  padding-bottom: env(safe-area-inset-bottom, 20px);
  z-index: 1;
}

.participants {
  font-size: 14px;
  color: #6B7280;
  margin-bottom: 16px;
}

.number {
  color: #8B5CF6;
  font-weight: 700;
}

.features {
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}

.feature {
  font-size: 12px;
  color: #9CA3AF;
  display: flex;
  align-items: center;
  gap: 4px;
}

.check {
  color: #10B981;
  font-weight: 700;
}

/* 响应式适配 */
@media (max-height: 700px) {
  .logo-section {
    margin-top: 40px;
  }
  
  .visual-section {
    margin: 24px 0;
  }
  
  .letter {
    width: 48px;
    height: 48px;
    font-size: 20px;
  }
}
</style>
