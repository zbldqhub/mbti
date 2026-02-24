import { createApp } from 'vue';
import App from './App.vue';

// 创建Vue应用
const app = createApp(App);

// 挂载应用
app.mount('#app');

// 控制台欢迎信息
console.log('%c🔮 MBTI性格测试', 'font-size: 24px; font-weight: bold; color: #8B5CF6;');
console.log('%c欢迎使用MBTI性格测试H5网站', 'font-size: 14px; color: #6B7280;');
console.log('%c版本: 1.0.0', 'font-size: 12px; color: #9CA3AF;');

// 注册Service Worker（PWA支持）
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}
