<template>
  <div class="app-container">
    <!-- AI 出题加载遮罩 -->
    <div v-if="preparing" class="preparing-overlay">
      <div class="preparing-spinner"></div>
      <p class="preparing-text">AI 正在为你生成专属题目...</p>
      <p class="preparing-subtext">每次测试题目都不相同</p>
    </div>

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
        :qaPairs="qaPairs"
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
import { generateBasicQuestions, generateProQuestions } from './services/aiService.js';

// 当前页面
const currentPage = ref('home');

// AI 出题中
const preparing = ref(false);

// 题目数据（AI 生成，失败时回退固定题库；持久化到 localStorage 保证断点续答时题答一致）
const basicQuestions = ref([]);
const proQuestions = ref([]);

// 答案记录
const basicAnswers = ref([]);
const proAnswers = ref([]);

// 分数
const scores = ref(initScores());

// 是否已完成全部题目
const hasCompletedAll = computed(() => {
  return proQuestions.value.length > 0 &&
         proAnswers.value.length === proQuestions.value.length &&
         proAnswers.value.every(a => a !== undefined && a !== null);
});

// 答题记录（题目 + 所选选项文本），供 AI 生成个性化报告
const qaPairs = computed(() => {
  const pairs = [];
  const collect = (questions, answers) => {
    questions.forEach((q, i) => {
      const ans = answers[i];
      if (!ans) return;
      const opt = q.options.find(o => o.type === ans);
      if (opt) pairs.push({ question: q.question, answer: opt.text });
    });
  };
  collect(basicQuestions.value, basicAnswers.value);
  collect(proQuestions.value, proAnswers.value);
  return pairs;
});

// 是否有任何答题结果
const hasAnyResult = computed(() => {
  return basicAnswers.value.length > 0;
});

// 页面加载时恢复状态
onMounted(() => {
  // 恢复题目（AI 生成的题目需与答案一起恢复，保证题答一致）
  const savedBasicQuestions = localStorage.getItem('mbti_basic_questions');
  if (savedBasicQuestions) {
    basicQuestions.value = JSON.parse(savedBasicQuestions);
  }

  const savedProQuestions = localStorage.getItem('mbti_pro_questions');
  if (savedProQuestions) {
    proQuestions.value = JSON.parse(savedProQuestions);
  }

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

  // 有答案但题目丢失（如旧版本存档），清空作废
  if (basicAnswers.value.length > 0 && basicQuestions.value.length === 0) {
    clearProgress();
  }

  // 如果有答题记录，自动跳转到结果页
  if (hasAnyResult.value && currentPage.value === 'home') {
    recalculateScores();
    currentPage.value = 'result';
  }
});

// 生成基础版题目（AI 优先，固定题库兜底），并持久化
const ensureBasicQuestions = async () => {
  if (basicQuestions.value.length > 0) return;

  preparing.value = true;
  try {
    basicQuestions.value = await generateBasicQuestions();
  } catch (error) {
    console.error('AI 出题失败，使用固定题库:', error);
    basicQuestions.value = getBasicQuestions();
  }
  localStorage.setItem('mbti_basic_questions', JSON.stringify(basicQuestions.value));
  preparing.value = false;
};

// 生成深度版题目（AI 优先，固定题库兜底），并持久化
const ensureProQuestions = async () => {
  if (proQuestions.value.length > 0) return;

  preparing.value = true;
  try {
    proQuestions.value = await generateProQuestions(basicQuestions.value);
  } catch (error) {
    console.error('AI 出题失败，使用固定题库:', error);
    proQuestions.value = getProQuestions();
  }
  localStorage.setItem('mbti_pro_questions', JSON.stringify(proQuestions.value));
  preparing.value = false;
};

// 开始测试
const startTest = async () => {
  await ensureBasicQuestions();
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
const continueQuiz = async () => {
  await ensureProQuestions();
  currentPage.value = 'proQuiz';
};

// ========== 重新测试逻辑 ==========

// 清空所有进度（答题记录、分数、AI 题目）
const clearProgress = () => {
  basicAnswers.value = [];
  proAnswers.value = [];
  basicQuestions.value = [];
  proQuestions.value = [];
  scores.value = initScores();

  localStorage.removeItem('mbti_basic_answers');
  localStorage.removeItem('mbti_pro_answers');
  localStorage.removeItem('mbti_scores');
  localStorage.removeItem('mbti_basic_questions');
  localStorage.removeItem('mbti_pro_questions');
};

const restart = async () => {
  // 清除所有进度，重新 AI 出题（每次题目不同）
  clearProgress();

  // 进入基础测试（28题）
  await ensureBasicQuestions();
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

/* AI 出题加载遮罩 */
.preparing-overlay {
  position: fixed;
  inset: 0;
  background: #F3F4F6;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.preparing-spinner {
  width: 56px;
  height: 56px;
  border: 4px solid #E5E7EB;
  border-top-color: #8B5CF6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.preparing-text {
  font-size: 17px;
  font-weight: 600;
  color: #1F2937;
  margin: 0 0 6px 0;
}

.preparing-subtext {
  font-size: 13px;
  color: #9CA3AF;
  margin: 0;
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
