<template>
  <div class="app-container">
    <!-- 页面过渡动画 -->
    <transition name="fade" mode="out-in">
      <!-- 首页 -->
      <Home 
        v-if="currentPage === 'home'" 
        @start="startTest"
        key="home"
      />
      
      <!-- 答题页（基础版 - 28题） -->
      <Quiz 
        v-else-if="currentPage === 'quiz'"
        :questions="basicQuestions"
        :initialAnswers="basicAnswers"
        @answer="onBasicAnswer"
        @back="goHome"
        @complete="onBasicComplete"
        key="quiz"
      />
      
      <!-- 结果页 -->
      <Result 
        v-else-if="currentPage === 'result'"
        :scores="scores"
        :hasCompletedAll="hasCompletedAll"
        @continue="continueQuiz"
        @restart="restart"
        @share="shareResult"
        key="result"
      />
      
      <!-- 深度答题页 - 继续答后面的65题 -->
      <Quiz 
        v-else-if="currentPage === 'proQuiz'"
        :questions="proQuestions"
        :initialAnswers="proAnswers"
        @answer="onProAnswer"
        @back="goResult"
        @complete="onProQuizComplete"
        key="proQuiz"
      />
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import Home from './components/Home.vue';
import Quiz from './components/Quiz.vue';
import Result from './components/Result.vue';
import { getBasicQuestions, getProQuestions } from './data/questions.js';
import { initScores, updateScore, calculateMBTIType } from './utils/scoring.js';

// 当前页面
const currentPage = ref('home');

// 题目数据
const basicQuestions = getBasicQuestions();
const proQuestions = getProQuestions();

// 答案记录
const basicAnswers = ref([]);
const proAnswers = ref([]);

// 分数
const scores = ref(initScores());

// 是否已完成全部题目
const hasCompletedAll = computed(() => {
  return proAnswers.value.length === proQuestions.length && 
         proAnswers.value.every(a => a !== undefined && a !== null);
});

// 是否有任何答题结果
const hasAnyResult = computed(() => {
  return basicAnswers.value.length > 0;
});

// 页面加载时恢复状态
onMounted(() => {
  // 恢复答题进度
  const savedBasicAnswers = localStorage.getItem('mbti_basic_answers');
  if (savedBasicAnswers) {
    basicAnswers.value = JSON.parse(savedBasicAnswers);
  }
  
  const savedProAnswers = localStorage.getItem('mbti_pro_answers');
  if (savedProAnswers) {
    proAnswers.value = JSON.parse(savedProAnswers);
  }
  
  // 恢复分数
  const savedScores = localStorage.getItem('mbti_scores');
  if (savedScores) {
    scores.value = JSON.parse(savedScores);
  }
  
  // 如果有答题记录，自动跳转到结果页
  if (hasAnyResult.value && currentPage.value === 'home') {
    recalculateScores();
    currentPage.value = 'result';
  }
});

// 开始测试
const startTest = () => {
  currentPage.value = 'quiz';
};

// 返回首页
const goHome = () => {
  if (hasAnyResult.value) {
    recalculateScores();
    currentPage.value = 'result';
  } else {
    currentPage.value = 'home';
  }
};

// 返回结果页
const goResult = () => {
  recalculateScores();
  currentPage.value = 'result';
};

// ========== 基础答题（28题）逻辑 ==========

const onBasicAnswer = (data) => {
  basicAnswers.value[data.questionIndex] = data.answer;
  scores.value = updateScore(scores.value, data.answer);
  localStorage.setItem('mbti_basic_answers', JSON.stringify(basicAnswers.value));
  localStorage.setItem('mbti_scores', JSON.stringify(scores.value));
};

const onBasicComplete = (answers) => {
  basicAnswers.value = answers;
  recalculateScores();
  localStorage.setItem('mbti_basic_answers', JSON.stringify(basicAnswers.value));
  localStorage.setItem('mbti_scores', JSON.stringify(scores.value));
  currentPage.value = 'result';
};

// ========== 深度答题（65题）逻辑 ==========

const onProAnswer = (data) => {
  proAnswers.value[data.questionIndex] = data.answer;
  scores.value = updateScore(scores.value, data.answer);
  localStorage.setItem('mbti_pro_answers', JSON.stringify(proAnswers.value));
  localStorage.setItem('mbti_scores', JSON.stringify(scores.value));
};

const onProQuizComplete = (answers) => {
  proAnswers.value = answers;
  recalculateScores();
  localStorage.setItem('mbti_pro_answers', JSON.stringify(proAnswers.value));
  localStorage.setItem('mbti_scores', JSON.stringify(scores.value));
  currentPage.value = 'result';
};

// 继续答题（从结果页进入深度答题）
const continueQuiz = () => {
  currentPage.value = 'proQuiz';
};

// ========== 重新测试逻辑 ==========

const restart = () => {
  // 清除所有答题记录
  basicAnswers.value = [];
  proAnswers.value = [];
  scores.value = initScores();
  
  // 清除localStorage
  localStorage.removeItem('mbti_basic_answers');
  localStorage.removeItem('mbti_pro_answers');
  localStorage.removeItem('mbti_scores');
  
  // 进入基础测试（28题）
  currentPage.value = 'quiz';
};

// ========== 工具函数 ==========

const recalculateScores = () => {
  scores.value = initScores();
  
  // 基础答题记录
  basicAnswers.value.forEach((answer) => {
    if (answer) {
      scores.value = updateScore(scores.value, answer);
    }
  });
  
  // 深度答题记录
  proAnswers.value.forEach((answer) => {
    if (answer) {
      scores.value = updateScore(scores.value, answer);
    }
  });
};

const shareResult = () => {
  const type = calculateMBTIType(scores.value);
  
  if (navigator.share) {
    navigator.share({
      title: `我的MBTI性格类型是${type}`,
      text: `快来测测你的MBTI性格类型吧！`,
      url: window.location.href
    }).catch(() => {});
  } else {
    const text = `我的MBTI性格类型是${type}，快来测测你的吧！`;
    navigator.clipboard.writeText(text).then(() => {
      alert('结果已复制到剪贴板');
    }).catch(() => {
      alert('分享功能暂不可用');
    });
  }
};
</script>

<style>
/* 全局样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  background: #F3F4F6;
  min-height: 100vh;
}

.app-container {
  max-width: 480px;
  margin: 0 auto;
  min-height: 100vh;
  background: #F3F4F6;
  position: relative;
}

/* 页面过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* 禁用文本选择（移动端优化） */
* {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

/* 允许输入框选择 */
input, textarea {
  -webkit-user-select: auto;
  -moz-user-select: auto;
  -ms-user-select: auto;
  user-select: auto;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 4px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #D1D5DB;
  border-radius: 2px;
}

/* 安全区域适配 */
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .app-container {
    padding-bottom: env(safe-area-inset-bottom);
  }
}
</style>
