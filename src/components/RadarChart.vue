<template>
  <div class="radar-chart">
    <svg viewBox="0 0 200 200" class="radar-svg">
      <!-- 背景网格 -->
      <g class="grid">
        <!-- 同心圆 -->
        <circle cx="100" cy="100" r="25" fill="none" stroke="#E5E7EB" stroke-width="1"/>
        <circle cx="100" cy="100" r="50" fill="none" stroke="#E5E7EB" stroke-width="1"/>
        <circle cx="100" cy="100" r="75" fill="none" stroke="#E5E7EB" stroke-width="1"/>
        <!-- 轴线 -->
        <line x1="100" y1="100" x2="100" y2="15" stroke="#D1D5DB" stroke-width="1"/>
        <line x1="100" y1="100" x2="185" y2="100" stroke="#D1D5DB" stroke-width="1"/>
        <line x1="100" y1="100" x2="100" y2="185" stroke="#D1D5DB" stroke-width="1"/>
        <line x1="100" y1="100" x2="15" y2="100" stroke="#D1D5DB" stroke-width="1"/>
      </g>
      
      <!-- 数据区域 -->
      <polygon 
        :points="polygonPoints" 
        fill="rgba(139, 92, 246, 0.25)" 
        stroke="#8B5CF6" 
        stroke-width="2"
        class="data-area"
      />
      
      <!-- 数据点 -->
      <circle v-for="(point, index) in dataPoints" :key="index"
        :cx="point.x" 
        :cy="point.y" 
        r="5" 
        fill="#8B5CF6"
        stroke="#FFFFFF"
        stroke-width="2"
      />
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  percentages: {
    type: Object,
    required: true
  }
});

// 计算数据点坐标
const dataPoints = computed(() => {
  const centerX = 100;
  const centerY = 100;
  const maxRadius = 85;
  
  // 四个维度的角度（上、右、下、左）
  const angles = [-Math.PI / 2, 0, Math.PI / 2, Math.PI];
  
  // 使用E、S、T、J的值
  const values = [
    props.percentages.E / 100,
    props.percentages.S / 100,
    props.percentages.T / 100,
    props.percentages.J / 100
  ];
  
  return values.map((value, index) => {
    const radius = maxRadius * value;
    const x = centerX + Math.cos(angles[index]) * radius;
    const y = centerY + Math.sin(angles[index]) * radius;
    return { x, y };
  });
});

// 计算多边形点坐标字符串
const polygonPoints = computed(() => {
  return dataPoints.value.map(p => `${p.x},${p.y}`).join(' ');
});
</script>

<style scoped>
.radar-chart {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.radar-svg {
  width: 240px;
  height: 240px;
}

.data-area {
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
