<template>
  <div class="result-container">
    <!-- 加载动画 -->
    <div v-if="loading" class="loading-section">
      <div class="loading-spinner"></div>
      <p class="loading-text">正在分析你的性格...</p>
      <p class="loading-subtext">已完成 {{ analysisProgress }}%</p>
    </div>

    <!-- 分享海报弹窗 -->
    <SharePoster 
      v-else-if="showSharePoster" 
      :scores="scores"
      @close="showSharePoster = false"
    />

    <!-- 结果内容 -->
    <div v-else class="result-content">
      <!-- 类型展示 -->
      <div class="type-header">
        <div class="type-icon">{{ typeIcon }}</div>
        <h1 class="type-name">{{ typeInfo.name }}</h1>
        <div class="type-letters">
          <span 
            v-for="(letter, index) in mbtiType.split('')" 
            :key="index" 
            class="letter"
            :class="{ 'highlight': isDominantLetter(letter, index) }"
          >
            {{ letter }}
          </span>
        </div>
        <div class="type-keywords">
          <span v-for="(keyword, index) in typeInfo.keywords" :key="index" class="keyword">
            {{ keyword }}
          </span>
        </div>
      </div>

      <!-- 雷达图 -->
      <div class="radar-section">
        <h3 class="section-title">性格维度分析</h3>
        <div class="radar-chart-container">
          <RadarChart :percentages="percentages" />
        </div>
        <div class="dimension-labels">
          <div class="dimension-row">
            <span class="dim-label" :class="{ active: percentages.E > 50 }">外向 E {{ percentages.E }}%</span>
            <span class="dim-divider">|</span>
            <span class="dim-label" :class="{ active: percentages.I > 50 }">内向 I {{ percentages.I }}%</span>
          </div>
          <div class="dimension-row">
            <span class="dim-label" :class="{ active: percentages.S > 50 }">实感 S {{ percentages.S }}%</span>
            <span class="dim-divider">|</span>
            <span class="dim-label" :class="{ active: percentages.N > 50 }">直觉 N {{ percentages.N }}%</span>
          </div>
          <div class="dimension-row">
            <span class="dim-label" :class="{ active: percentages.T > 50 }">思考 T {{ percentages.T }}%</span>
            <span class="dim-divider">|</span>
            <span class="dim-label" :class="{ active: percentages.F > 50 }">情感 F {{ percentages.F }}%</span>
          </div>
          <div class="dimension-row">
            <span class="dim-label" :class="{ active: percentages.J > 50 }">判断 J {{ percentages.J }}%</span>
            <span class="dim-divider">|</span>
            <span class="dim-label" :class="{ active: percentages.P > 50 }">知觉 P {{ percentages.P }}%</span>
          </div>
        </div>
      </div>

      <!-- 核心特质 -->
      <div class="traits-section">
        <h3 class="section-title">核心特质</h3>
        <div class="traits-list">
          <p v-for="(trait, index) in typeInfo.description.traits" :key="index" class="trait-item">
            <span class="trait-bullet">•</span>
            {{ trait }}
          </p>
        </div>
      </div>

      <!-- 职业方向 -->
      <div class="career-section">
        <h3 class="section-title">推荐职业方向</h3>
        <div class="career-tags">
          <span v-for="(career, index) in typeInfo.description.careers" :key="index" class="career-tag">
            {{ career }}
          </span>
        </div>
      </div>

      <!-- 人际关系 -->
      <div class="relationship-section">
        <h3 class="section-title">人际关系建议</h3>
        <p class="relationship-text">{{ typeInfo.description.relationships }}</p>
      </div>

      <!-- 继续答题卡片 - 基础版结果页显示 -->
      <div v-if="!hasCompletedAll" class="continue-section">
        <div class="continue-card">
          <div class="continue-header">
            <span class="continue-icon">✨</span>
            <h3 class="continue-title">解锁完整分析</h3>
          </div>
          <div class="continue-features">
            <div class="feature-item">
              <span class="feature-check">✓</span>
              <span>认知功能排序详解</span>
            </div>
            <div class="feature-item">
              <span class="feature-check">✓</span>
              <span>压力下的性格模式</span>
            </div>
            <div class="feature-item">
              <span class="feature-check">✓</span>
              <span>详细职业匹配分析</span>
            </div>
            <div class="feature-item">
              <span class="feature-check">✓</span>
              <span>个人成长建议</span>
            </div>
          </div>
          <div class="continue-note">
            <span class="note-icon">💡</span>
            <span>基于已完成的28题，再答65道题获得完整报告</span>
          </div>
          <button class="continue-btn" @click="continueQuiz">
            <span>继续答题 (29/93)</span>
            <span class="btn-arrow">→</span>
          </button>
        </div>
      </div>

      <!-- 已完成的深度内容 -->
      <div v-if="hasCompletedAll" class="deep-content-section">
        <div class="deep-card">
          <h3 class="section-title">🔮 认知功能排序</h3>
          <div class="cognitive-list">
            <div class="cognitive-item primary">
              <span class="cognitive-label">主导</span>
              <span class="cognitive-value">{{ deepReport.cognitiveFunctions.primary }}</span>
            </div>
            <div class="cognitive-item secondary">
              <span class="cognitive-label">辅助</span>
              <span class="cognitive-value">{{ deepReport.cognitiveFunctions.secondary }}</span>
            </div>
            <div class="cognitive-item tertiary">
              <span class="cognitive-label">第三</span>
              <span class="cognitive-value">{{ deepReport.cognitiveFunctions.tertiary }}</span>
            </div>
            <div class="cognitive-item inferior">
              <span class="cognitive-label">劣势</span>
              <span class="cognitive-value">{{ deepReport.cognitiveFunctions.inferior }}</span>
            </div>
          </div>
        </div>

        <div class="deep-card">
          <h3 class="section-title">😰 压力模式</h3>
          <p class="stress-text">{{ deepReport.stressMode }}</p>
        </div>

        <div class="deep-card">
          <h3 class="section-title">💼 详细职业匹配</h3>
          <div class="career-detailed">
            <span v-for="(career, index) in deepReport.careerMatch" :key="index" class="career-detailed-tag">
              {{ career }}
            </span>
          </div>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="action-section">
        <button class="restart-btn" @click="restart">
          <span>重新测试</span>
        </button>
        <button class="share-btn" @click="showShare">
          <span>分享结果</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { 
  calculateMBTIType, 
  calculatePercentages, 
  getTypeInfo, 
  getDeepReport 
} from '../utils/scoring.js';
import SharePoster from './SharePoster.vue';
import RadarChart from './RadarChart.vue';

const props = defineProps({
  scores: {
    type: Object,
    required: true
  },
  hasCompletedAll: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['continue', 'restart', 'share']);

// 加载状态
const loading = ref(true);
const analysisProgress = ref(0);

// 显示分享海报
const showSharePoster = ref(false);

// 计算MBTI类型
const mbtiType = computed(() => calculateMBTIType(props.scores));

// 计算百分比
const percentages = computed(() => calculatePercentages(props.scores));

// 获取类型信息
const typeInfo = computed(() => getTypeInfo(mbtiType.value));

// 获取深度报告
const deepReport = computed(() => getDeepReport(mbtiType.value));

// 类型图标
const typeIcon = computed(() => {
  const icons = {
    'ISTJ': '📋', 'ISFJ': '🛡️', 'INFJ': '🔮', 'INTJ': '🏗️',
    'ISTP': '🔧', 'ISFP': '🎨', 'INFP': '🌸', 'INTP': '🔬',
    'ESTP': '🏃', 'ESFP': '🎭', 'ENFP': '✨', 'ENTP': '💡',
    'ESTJ': '📊', 'ESFJ': '💝', 'ENFJ': '👑', 'ENTJ': '🎯'
  };
  return icons[mbtiType.value] || '🔮';
});

// 判断主导字母
const isDominantLetter = (letter, index) => {
  const dims = ['EI', 'SN', 'TF', 'JP'];
  const dim = dims[index];
  const [a, b] = dim.split('');
  return props.scores[a] >= props.scores[b] ? letter === a : letter === b;
};

// 继续答题
const continueQuiz = () => {
  emit('continue');
};

// 重新开始
const restart = () => {
  emit('restart');
};

// 显示分享海报
const showShare = () => {
  showSharePoster.value = true;
};

// 模拟加载
onMounted(() => {
  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 15;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      setTimeout(() => {
        loading.value = false;
      }, 300);
    }
    analysisProgress.value = Math.floor(progress);
  }, 200);
});
</script>

<style scoped>
.result-container {
  min-height: 100vh;
  background: #F3F4F6;
}

/* 加载动画 */
.loading-section {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.loading-spinner {
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

.loading-text {
  font-size: 18px;
  font-weight: 600;
  color: #1F2937;
  margin: 0 0 8px 0;
}

.loading-subtext {
  font-size: 14px;
  color: #8B5CF6;
  margin: 0;
}

/* 结果内容 */
.result-content {
  padding: 24px 20px;
  padding-bottom: calc(24px + env(safe-area-inset-bottom, 20px));
}

/* 类型头部 */
.type-header {
  text-align: center;
  margin-bottom: 32px;
}

.type-icon {
  font-size: 64px;
  margin-bottom: 12px;
  display: inline-block;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.type-name {
  font-size: 24px;
  font-weight: 700;
  color: #1F2937;
  margin: 0 0 12px 0;
}

.type-letters {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 16px;
}

.letter {
  width: 48px;
  height: 48px;
  background: #E5E7EB;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 700;
  color: #9CA3AF;
  transition: all 0.3s ease;
}

.letter.highlight {
  background: linear-gradient(135deg, #8B5CF6, #7C3AED);
  color: white;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.type-keywords {
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}

.keyword {
  padding: 6px 14px;
  background: #F3E8FF;
  border-radius: 20px;
  font-size: 14px;
  color: #7C3AED;
  font-weight: 500;
}

/* 雷达图区域 */
.radar-section {
  background: white;
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: #1F2937;
  margin: 0 0 20px 0;
  text-align: center;
}

.radar-chart-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  min-height: 240px;
}

.dimension-labels {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.dimension-row {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  font-size: 14px;
}

.dim-label {
  color: #9CA3AF;
  transition: all 0.3s ease;
}

.dim-label.active {
  color: #8B5CF6;
  font-weight: 600;
}

.dim-divider {
  color: #E5E7EB;
}

/* 特质区域 */
.traits-section,
.career-section,
.relationship-section {
  background: white;
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.traits-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.trait-item {
  margin: 0;
  font-size: 15px;
  color: #4B5563;
  line-height: 1.6;
  display: flex;
  gap: 8px;
}

.trait-bullet {
  color: #8B5CF6;
  font-weight: 700;
}

/* 职业标签 */
.career-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.career-tag {
  padding: 10px 18px;
  background: linear-gradient(135deg, #F3E8FF, #EDE9FE);
  border-radius: 24px;
  font-size: 14px;
  color: #7C3AED;
  font-weight: 500;
}

/* 人际关系 */
.relationship-text {
  margin: 0;
  font-size: 15px;
  color: #4B5563;
  line-height: 1.7;
}

/* 继续答题卡片 */
.continue-section {
  margin-bottom: 24px;
}

.continue-card {
  background: linear-gradient(135deg, #FFFFFF, #F3E8FF);
  border: 2px solid #8B5CF6;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(139, 92, 246, 0.15);
}

.continue-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 20px;
}

.continue-icon {
  font-size: 24px;
}

.continue-title {
  font-size: 20px;
  font-weight: 700;
  color: #7C3AED;
  margin: 0;
}

.continue-features {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  color: #4B5563;
}

.feature-check {
  width: 20px;
  height: 20px;
  background: #8B5CF6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
}

.continue-note {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px;
  background: rgba(139, 92, 246, 0.08);
  border-radius: 12px;
  margin-bottom: 20px;
  font-size: 13px;
  color: #6B7280;
}

.note-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.continue-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #8B5CF6, #7C3AED);
  border: none;
  border-radius: 14px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.continue-btn:active {
  transform: scale(0.98);
}

.btn-arrow {
  transition: transform 0.3s ease;
}

.continue-btn:hover .btn-arrow {
  transform: translateX(4px);
}

/* 深度内容 */
.deep-content-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 24px;
}

.deep-card {
  background: white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.cognitive-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cognitive-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border-radius: 12px;
}

.cognitive-item.primary {
  background: linear-gradient(135deg, #F3E8FF, #EDE9FE);
}

.cognitive-item.secondary {
  background: #F9FAFB;
}

.cognitive-item.tertiary {
  background: #F9FAFB;
}

.cognitive-item.inferior {
  background: #F3F4F6;
}

.cognitive-label {
  padding: 4px 10px;
  background: #8B5CF6;
  border-radius: 6px;
  font-size: 12px;
  color: white;
  font-weight: 600;
}

.cognitive-value {
  font-size: 14px;
  color: #4B5563;
}

.stress-text {
  margin: 0;
  font-size: 15px;
  color: #4B5563;
  line-height: 1.7;
}

.career-detailed {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.career-detailed-tag {
  padding: 10px 16px;
  background: linear-gradient(135deg, #8B5CF6, #7C3AED);
  border-radius: 24px;
  font-size: 13px;
  color: white;
  font-weight: 500;
}

/* 底部按钮 */
.action-section {
  display: flex;
  gap: 12px;
}

.restart-btn,
.share-btn {
  flex: 1;
  height: 48px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.restart-btn {
  background: white;
  border: 2px solid #E5E7EB;
  color: #6B7280;
}

.restart-btn:active {
  background: #F3F4F6;
}

.share-btn {
  background: linear-gradient(135deg, #8B5CF6, #7C3AED);
  border: none;
  color: white;
}

.share-btn:active {
  transform: scale(0.98);
}
</style>
