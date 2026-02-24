<template>
  <div class="upgrade-container">
    <!-- 支付处理中 -->
    <div v-if="paying" class="paying-section">
      <div class="paying-spinner"></div>
      <p class="paying-text">正在调起支付...</p>
      <p class="paying-subtext">请稍候</p>
    </div>

    <!-- 支付成功 -->
    <div v-else-if="paid" class="success-section">
      <div class="success-icon">🎉</div>
      <h2 class="success-title">解锁成功！</h2>
      <p class="success-text">你已成功解锁深度分析报告</p>
      <button class="view-btn" @click="viewReport">
        <span>查看完整报告</span>
      </button>
    </div>

    <!-- 支付失败 -->
    <div v-else-if="payError" class="error-section">
      <div class="error-icon">😔</div>
      <h2 class="error-title">支付失败</h2>
      <p class="error-text">{{ payErrorMessage }}</p>
      <button class="retry-btn" @click="retryPayment">
        <span>重新支付</span>
      </button>
      <button class="back-btn-text" @click="goBack">
        <span>返回</span>
      </button>
    </div>

    <!-- 深度答题模式 -->
    <div v-else-if="showQuiz" class="quiz-section">
      <Quiz 
        :questions="proQuestions"
        :initialAnswers="previousAnswers"
        :startIndex="0"
        @answer="onAnswer"
        @back="goBack"
        @complete="onQuizComplete"
      />
    </div>

    <!-- 升级介绍页 -->
    <div v-else class="intro-section">
      <!-- 顶部返回 -->
      <div class="nav-header">
        <button class="back-btn" @click="goBack">
          <span class="back-icon">←</span>
        </button>
        <span class="nav-title">深度分析</span>
        <div class="placeholder"></div>
      </div>

      <!-- 升级内容 -->
      <div class="upgrade-content">
        <div class="upgrade-badge">
          <span class="badge-icon">🔮</span>
          <span class="badge-text">PRO</span>
        </div>

        <h1 class="upgrade-title">解锁完整性格画像</h1>
        <p class="upgrade-subtitle">基于已完成测试，追加65道深度分析题</p>

        <!-- 功能列表 -->
        <div class="features-list">
          <div class="feature-card">
            <div class="feature-icon">🧠</div>
            <div class="feature-info">
              <h3>认知功能排序</h3>
              <p>了解你的主导、辅助、第三和劣势认知功能</p>
            </div>
          </div>

          <div class="feature-card">
            <div class="feature-icon">😰</div>
            <div class="feature-info">
              <h3>压力模式分析</h3>
              <p>探索压力下的性格变化与应对方式</p>
            </div>
          </div>

          <div class="feature-card">
            <div class="feature-icon">💼</div>
            <div class="feature-info">
              <h3>详细职业匹配</h3>
              <p>获取更精准的职业发展方向建议</p>
            </div>
          </div>

          <div class="feature-card">
            <div class="feature-icon">🎯</div>
            <div class="feature-info">
              <h3>成长建议</h3>
              <p>针对性的个人发展指导</p>
            </div>
          </div>
        </div>

        <!-- 价格信息 -->
        <div class="price-section">
          <div class="price-tag">
            <span class="current-price">¥{{ price }}</span>
            <span class="original-price">¥{{ originalPrice }}</span>
          </div>
          <p class="price-hint">限时优惠 · 一杯咖啡钱</p>
        </div>

        <!-- 操作按钮 -->
        <div class="action-buttons">
          <button class="continue-btn" @click="continueQuiz">
            <span>继续答题 (29/93)</span>
          </button>
          <button class="pay-btn" @click="startPayment">
            <span>¥{{ price }} 立即解锁</span>
          </button>
        </div>

        <!-- 安全提示 -->
        <div class="security-hint">
          <span class="security-icon">🔒</span>
          <span>安全支付 · 7天无理由退款</span>
        </div>

        <!-- 支付方式说明 -->
        <div class="payment-method-hint">
          <p v-if="paymentMethod === 'wechat'">💳 微信支付</p>
          <p v-else-if="paymentMethod === 'alipay'">💳 支付宝</p>
          <p v-else>💳 模拟支付（测试模式）</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { getProQuestions } from '../data/questions.js';
import { processPayment } from '../services/payment.js';
import { paymentParams, currentPaymentMethod, useMockPayment } from '../config/payment.js';
import Quiz from './Quiz.vue';

const props = defineProps({
  previousAnswers: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['back', 'complete', 'paid']);

// 状态
const paying = ref(false);
const paid = ref(false);
const payError = ref(false);
const payErrorMessage = ref('');
const showQuiz = ref(false);

// 价格
const price = ref(paymentParams.price);
const originalPrice = ref(paymentParams.originalPrice);
const paymentMethod = ref(useMockPayment ? 'mock' : currentPaymentMethod);

// 深度题目
const proQuestions = getProQuestions();

// 深度答题答案
const proAnswers = ref([]);

// 返回
const goBack = () => {
  payError.value = false;
  emit('back');
};

// 继续答题模式
const continueQuiz = () => {
  showQuiz.value = true;
};

// 深度答题答案
const onAnswer = (data) => {
  proAnswers.value[data.questionIndex] = data.answer;
  emit('answer', data);
};

// 深度答题完成
const onQuizComplete = (answers) => {
  proAnswers.value = answers;
  emit('complete', answers);
};

// 开始支付
const startPayment = async () => {
  paying.value = true;
  payError.value = false;
  
  try {
    // 调用支付服务
    const result = await processPayment();
    
    paying.value = false;
    
    if (result.success) {
      paid.value = true;
      
      // 保存支付状态到localStorage
      localStorage.setItem('mbti_paid', 'true');
      localStorage.setItem('mbti_order_id', result.orderId);
      
      // 触发支付完成事件
      emit('paid');
    } else {
      payError.value = true;
      payErrorMessage.value = result.error || '支付失败，请重试';
    }
  } catch (error) {
    paying.value = false;
    payError.value = true;
    payErrorMessage.value = error.message || '支付过程中出现错误';
  }
};

// 重新支付
const retryPayment = () => {
  payError.value = false;
  startPayment();
};

// 查看报告
const viewReport = () => {
  emit('complete', proAnswers.value);
};
</script>

<style scoped>
.upgrade-container {
  min-height: 100vh;
  background: #F3F4F6;
}

/* 支付中 */
.paying-section {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.paying-spinner {
  width: 60px;
  height: 60px;
  border: 4px solid #E5E7EB;
  border-top-color: #8B5CF6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 24px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.paying-text {
  font-size: 18px;
  font-weight: 600;
  color: #1F2937;
  margin: 0 0 8px 0;
}

.paying-subtext {
  font-size: 14px;
  color: #9CA3AF;
  margin: 0;
}

/* 支付成功 */
.success-section {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
}

.success-icon {
  font-size: 80px;
  margin-bottom: 24px;
  animation: celebrate 0.6s ease-out;
}

@keyframes celebrate {
  0% { transform: scale(0) rotate(-180deg); }
  50% { transform: scale(1.2) rotate(10deg); }
  100% { transform: scale(1) rotate(0); }
}

.success-title {
  font-size: 28px;
  font-weight: 700;
  color: #1F2937;
  margin: 0 0 12px 0;
}

.success-text {
  font-size: 16px;
  color: #6B7280;
  margin: 0 0 32px 0;
}

.view-btn {
  width: 100%;
  max-width: 280px;
  height: 52px;
  background: linear-gradient(135deg, #8B5CF6, #7C3AED);
  border: none;
  border-radius: 14px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.view-btn:active {
  transform: scale(0.98);
}

/* 支付失败 */
.error-section {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
}

.error-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.error-title {
  font-size: 24px;
  font-weight: 700;
  color: #1F2937;
  margin: 0 0 8px 0;
}

.error-text {
  font-size: 15px;
  color: #6B7280;
  margin: 0 0 32px 0;
  max-width: 280px;
}

.retry-btn {
  width: 100%;
  max-width: 280px;
  height: 48px;
  background: linear-gradient(135deg, #8B5CF6, #7C3AED);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 12px;
}

.back-btn-text {
  width: 100%;
  max-width: 280px;
  height: 48px;
  background: white;
  border: 2px solid #E5E7EB;
  border-radius: 12px;
  color: #6B7280;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}

/* 介绍页 */
.intro-section {
  min-height: 100vh;
  padding: 16px 20px;
  padding-bottom: calc(24px + env(safe-area-inset-bottom, 20px));
}

.nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.back-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.back-icon {
  font-size: 18px;
  color: #6B7280;
}

.nav-title {
  font-size: 17px;
  font-weight: 600;
  color: #1F2937;
}

.placeholder {
  width: 40px;
}

.upgrade-content {
  text-align: center;
}

.upgrade-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #8B5CF6, #7C3AED);
  border-radius: 24px;
  margin-bottom: 20px;
}

.badge-icon {
  font-size: 18px;
}

.badge-text {
  font-size: 14px;
  font-weight: 700;
  color: white;
}

.upgrade-title {
  font-size: 26px;
  font-weight: 700;
  color: #1F2937;
  margin: 0 0 8px 0;
}

.upgrade-subtitle {
  font-size: 15px;
  color: #6B7280;
  margin: 0 0 32px 0;
}

/* 功能列表 */
.features-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 32px;
}

.feature-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  text-align: left;
}

.feature-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #F3E8FF, #EDE9FE);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.feature-info h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1F2937;
  margin: 0 0 4px 0;
}

.feature-info p {
  font-size: 13px;
  color: #6B7280;
  margin: 0;
}

/* 价格区域 */
.price-section {
  margin-bottom: 24px;
}

.price-tag {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 12px;
  margin-bottom: 8px;
}

.current-price {
  font-size: 36px;
  font-weight: 700;
  color: #8B5CF6;
}

.original-price {
  font-size: 18px;
  color: #9CA3AF;
  text-decoration: line-through;
}

.price-hint {
  font-size: 13px;
  color: #9CA3AF;
  margin: 0;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.continue-btn,
.pay-btn {
  width: 100%;
  height: 52px;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.continue-btn {
  background: white;
  border: 2px solid #8B5CF6;
  color: #8B5CF6;
}

.continue-btn:active {
  background: #F3E8FF;
}

.pay-btn {
  background: linear-gradient(135deg, #8B5CF6, #7C3AED);
  border: none;
  color: white;
  box-shadow: 0 4px 16px rgba(139, 92, 246, 0.35);
}

.pay-btn:active {
  transform: scale(0.98);
}

/* 安全提示 */
.security-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 12px;
  color: #9CA3AF;
  margin-bottom: 12px;
}

.security-icon {
  font-size: 14px;
}

/* 支付方式说明 */
.payment-method-hint {
  font-size: 12px;
  color: #8B5CF6;
}

.payment-method-hint p {
  margin: 0;
}
</style>
