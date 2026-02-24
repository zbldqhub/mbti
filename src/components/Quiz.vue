<template>
  <div class="quiz-container">
    <!-- 顶部导航 -->
    <div class="nav-header">
      <button class="back-btn" @click="goBack" v-if="canGoBack">
        <span class="back-icon">←</span>
      </button>
      <div class="progress-info">
        <span class="question-number">{{ currentQuestionIndex + 1 }}/{{ totalQuestions }}</span>
      </div>
      <div class="placeholder"></div>
    </div>

    <!-- 进度条 -->
    <div class="progress-bar">
      <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
    </div>

    <!-- 题目图片区域 -->
    <div class="question-image-section" v-if="currentQuestionImage">
      <div class="image-wrapper">
        <img :src="currentQuestionImage" :alt="currentQuestion?.question" class="question-image" loading="lazy" @error="handleImageError" />
        <div class="image-overlay"></div>
      </div>
    </div>

    <!-- 题目区域 -->
    <div class="question-section" :class="{ 'slide-in': slideDirection === 'in', 'slide-out': slideDirection === 'out' }">
      <div class="dimension-badge" :class="currentDimensionClass">
        {{ currentDimensionText }}
      </div>
      <h2 class="question-text">{{ currentQuestion?.question }}</h2>
    </div>

    <!-- 选项区域 -->
    <div class="options-section">
      <button 
        v-for="(option, index) in currentQuestion?.options" 
        :key="index"
        class="option-card"
        :class="{ 'selected': selectedOption === index, 'clicking': clickingOption === index }"
        @click="selectOption(index, option.type)"
        :style="{ animationDelay: `${index * 0.1}s` }"
      >
        <div class="option-icon" v-if="option.type">
          {{ getOptionIcon(option.type) }}
        </div>
        <span class="option-text">{{ option.text }}</span>
        <span class="option-indicator" v-if="selectedOption === index">✓</span>
      </button>
    </div>

    <!-- 底部提示 -->
    <div class="footer-hint">
      <p class="hint-text">← 左滑返回上一题</p>
    </div>

    <!-- 触摸滑动区域 -->
    <div 
      class="touch-area"
      @touchstart="handleTouchStart"
      @touchend="handleTouchEnd"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { getQuestionImage } from '../config/images.js';

const props = defineProps({
  questions: {
    type: Array,
    required: true
  },
  initialAnswers: {
    type: Array,
    default: () => []
  },
  startIndex: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits(['answer', 'back', 'complete']);

// 当前题目索引
const currentQuestionIndex = ref(props.startIndex);

// 答案记录
const answers = ref([...props.initialAnswers]);

// 选中的选项
const selectedOption = ref(null);

// 点击中的选项（动画效果）
const clickingOption = ref(null);

// 滑动方向动画
const slideDirection = ref('');

// 触摸相关
const touchStartX = ref(0);
const touchEndX = ref(0);

// 总题目数
const totalQuestions = computed(() => props.questions.length);

// 当前题目
const currentQuestion = computed(() => props.questions[currentQuestionIndex.value]);

// 当前维度
const currentDimension = computed(() => currentQuestion.value?.dimension);

// 维度样式类
const currentDimensionClass = computed(() => {
  const classes = {
    'EI': 'dimension-ei',
    'SN': 'dimension-sn',
    'TF': 'dimension-tf',
    'JP': 'dimension-jp'
  };
  return classes[currentDimension.value] || '';
});

// 维度文本
const currentDimensionText = computed(() => {
  const texts = {
    'EI': '外向 vs 内向',
    'SN': '实感 vs 直觉',
    'TF': '思考 vs 情感',
    'JP': '判断 vs 知觉'
  };
  return texts[currentDimension.value] || '';
});

// 当前题目图片 - 使用配置文件中独特的图片
const currentQuestionImage = computed(() => {
  const question = currentQuestion.value;
  if (!question) return null;
  
  return getQuestionImage(question.dimension, question.id);
});

// 进度百分比
const progressPercent = computed(() => {
  return ((currentQuestionIndex.value + 1) / totalQuestions.value) * 100;
});

// 是否可以返回
const canGoBack = computed(() => currentQuestionIndex.value > 0);

// 获取选项图标
const getOptionIcon = (type) => {
  const icons = {
    'E': '👥',
    'I': '🧘',
    'S': '🔍',
    'N': '💡',
    'T': '🧠',
    'F': '❤️',
    'J': '📅',
    'P': '🌊'
  };
  return icons[type] || '';
};

// 监听初始答案变化
watch(() => props.initialAnswers, (newVal) => {
  answers.value = [...newVal];
}, { deep: true });

// 监听当前题目变化，恢复之前的选择
watch(currentQuestionIndex, (newIndex) => {
  if (answers.value[newIndex] !== undefined) {
    const question = props.questions[newIndex];
    const answerType = answers.value[newIndex];
    const optionIndex = question.options.findIndex(opt => opt.type === answerType);
    selectedOption.value = optionIndex;
  } else {
    selectedOption.value = null;
  }
}, { immediate: true });

// 选择选项
const selectOption = (index, type) => {
  if (clickingOption.value !== null) return;
  
  clickingOption.value = index;
  selectedOption.value = index;
  
  // 记录答案
  answers.value[currentQuestionIndex.value] = type;
  
  // 触发答案事件
  emit('answer', {
    questionIndex: currentQuestionIndex.value,
    answer: type,
    dimension: currentQuestion.value.dimension
  });
  
  // 300ms后自动进入下一题
  setTimeout(() => {
    clickingOption.value = null;
    
    if (currentQuestionIndex.value < totalQuestions.value - 1) {
      slideDirection.value = 'out';
      setTimeout(() => {
        currentQuestionIndex.value++;
        slideDirection.value = 'in';
        setTimeout(() => {
          slideDirection.value = '';
        }, 300);
      }, 150);
    } else {
      emit('complete', answers.value);
    }
  }, 300);
};

// 返回上一题
const goBack = () => {
  if (currentQuestionIndex.value > 0) {
    slideDirection.value = 'out';
    setTimeout(() => {
      currentQuestionIndex.value--;
      slideDirection.value = 'in';
      setTimeout(() => {
        slideDirection.value = '';
      }, 300);
    }, 150);
  } else {
    emit('back');
  }
};

// 触摸开始
const handleTouchStart = (e) => {
  touchStartX.value = e.touches[0].clientX;
};

// 触摸结束
const handleTouchEnd = (e) => {
  touchEndX.value = e.changedTouches[0].clientX;
  handleSwipe();
};

// 处理滑动
const handleSwipe = () => {
  const diff = touchStartX.value - touchEndX.value;
  
  if (diff < -50) {
    goBack();
  }
};

// 处理图片加载失败
const handleImageError = (event) => {
  // 隐藏图片，使用背景渐变作为替代
  event.target.style.display = 'none';
};
</script>

<style scoped>
.quiz-container {
  min-height: 100vh;
  background: #F3F4F6;
  display: flex;
  flex-direction: column;
  padding: 16px 20px;
  position: relative;
}

/* 顶部导航 */
.nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  z-index: 10;
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
  transition: all 0.2s ease;
}

.back-btn:active {
  transform: scale(0.95);
}

.back-icon {
  font-size: 18px;
  color: #6B7280;
}

.progress-info {
  text-align: center;
}

.question-number {
  font-size: 16px;
  font-weight: 600;
  color: #1F2937;
}

.placeholder {
  width: 40px;
}

/* 进度条 */
.progress-bar {
  height: 4px;
  background: #E5E7EB;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 20px;
  z-index: 10;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #8B5CF6, #7C3AED);
  border-radius: 2px;
  transition: width 0.3s ease;
}

/* 题目图片区域 */
.question-image-section {
  margin: 0 -20px 20px;
  position: relative;
}

.image-wrapper {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: linear-gradient(135deg, #E5E7EB, #F3F4F6);
}

.question-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(1.05); }
  to { opacity: 1; transform: scale(1); }
}

.image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: linear-gradient(to top, rgba(243, 244, 246, 1), transparent);
}

/* 题目区域 */
.question-section {
  text-align: center;
  margin-bottom: 24px;
  padding: 0 10px;
}

.dimension-badge {
  display: inline-block;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 16px;
  animation: slideDown 0.4s ease;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.dimension-ei {
  background: linear-gradient(135deg, #FEF3C7, #FDE68A);
  color: #D97706;
}

.dimension-sn {
  background: linear-gradient(135deg, #DBEAFE, #BFDBFE);
  color: #2563EB;
}

.dimension-tf {
  background: linear-gradient(135deg, #FCE7F3, #FBCFE8);
  color: #DB2777;
}

.dimension-jp {
  background: linear-gradient(135deg, #D1FAE5, #A7F3D0);
  color: #059669;
}

.question-text {
  font-size: 20px;
  font-weight: 600;
  color: #1F2937;
  line-height: 1.6;
  margin: 0;
  animation: fadeInUp 0.5s ease;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 滑动动画 */
.slide-out {
  animation: slideOut 0.3s ease forwards;
}

.slide-in {
  animation: slideIn 0.3s ease forwards;
}

@keyframes slideOut {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(-30px);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 选项区域 */
.options-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
  flex: 1;
}

.option-card {
  background: white;
  border: 2px solid #E5E7EB;
  border-radius: 16px;
  padding: 18px 20px;
  min-height: 72px;
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  animation: fadeInUp 0.4s ease forwards;
  opacity: 0;
  transform: translateY(20px);
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.option-card:active {
  transform: scale(0.98);
}

.option-card.selected {
  border-color: #8B5CF6;
  background: linear-gradient(135deg, #F3E8FF, #EDE9FE);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.15);
}

.option-card.clicking {
  transform: scale(0.98);
}

.option-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #F3F4F6, #E5E7EB);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.option-card.selected .option-icon {
  background: linear-gradient(135deg, #8B5CF6, #7C3AED);
}

.option-text {
  font-size: 15px;
  color: #1F2937;
  line-height: 1.5;
  text-align: left;
  flex: 1;
  font-weight: 500;
}

.option-card.selected .option-text {
  color: #7C3AED;
  font-weight: 600;
}

.option-indicator {
  width: 26px;
  height: 26px;
  background: #8B5CF6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  flex-shrink: 0;
  animation: popIn 0.3s ease;
}

@keyframes popIn {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

/* 底部提示 */
.footer-hint {
  text-align: center;
  padding-bottom: env(safe-area-inset-bottom, 20px);
}

.hint-text {
  font-size: 12px;
  color: #9CA3AF;
  margin: 0;
}

/* 触摸滑动区域 */
.touch-area {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 60px;
  z-index: 0;
}

/* 响应式适配 */
@media (max-height: 700px) {
  .image-wrapper {
    height: 160px;
  }
  
  .question-text {
    font-size: 18px;
  }
}
</style>
