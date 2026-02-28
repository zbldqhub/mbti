import React, { useEffect, useRef } from 'react';

// 动态粒子背景
const ParticleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      color: string;
    }> = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticle = () => {
      const colors = ['#67e8f9', '#86efac', '#fca5a5', '#fbbf24', '#c084fc', '#94a3b8'];
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 2,
        alpha: Math.random() * 0.6 + 0.4,
        color: colors[Math.floor(Math.random() * colors.length)],
      };
    };

    const init = () => {
      particles = [];
      const particleCount = Math.min(80, Math.floor((canvas.width * canvas.height) / 15000));
      for (let i = 0; i < particleCount; i++) {
        particles.push(createParticle());
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 绘制粒子
      particles.forEach((particle, i) => {
        // 更新位置
        particle.x += particle.vx;
        particle.y += particle.vy;

        // 边界处理
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        // 绘制粒子
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.alpha;
        ctx.fill();

        // 绘制连线
        particles.slice(i + 1).forEach((other) => {
          const dx = particle.x - other.x;
          const dy = particle.y - other.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = particle.color;
            ctx.globalAlpha = (1 - distance / 150) * 0.3;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });
      });

      ctx.globalAlpha = 1;
      animationId = requestAnimationFrame(draw);
    };

    resize();
    init();
    draw();

    window.addEventListener('resize', () => {
      resize();
      init();
    });

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
    />
  );
};

// 流动光线效果
const FlowingLines: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* 主光线 - 更粗更明显 */}
      <div
        className="absolute w-full opacity-40"
        style={{
          top: '20%',
          height: '2px',
          background: 'linear-gradient(90deg, transparent, #67e8f9, #c084fc, #67e8f9, transparent)',
          animation: 'flowLine 8s linear infinite',
          boxShadow: '0 0 10px #67e8f9, 0 0 20px #c084fc',
        }}
      />
      <div
        className="absolute w-full opacity-30"
        style={{
          top: '40%',
          height: '2px',
          background: 'linear-gradient(90deg, transparent, #86efac, #fbbf24, #86efac, transparent)',
          animation: 'flowLine 12s linear infinite reverse',
          boxShadow: '0 0 10px #86efac, 0 0 20px #fbbf24',
        }}
      />
      <div
        className="absolute w-full opacity-25"
        style={{
          top: '60%',
          height: '2px',
          background: 'linear-gradient(90deg, transparent, #fca5a5, #67e8f9, #fca5a5, transparent)',
          animation: 'flowLine 10s linear infinite',
          boxShadow: '0 0 10px #fca5a5, 0 0 20px #67e8f9',
        }}
      />
      <div
        className="absolute w-full opacity-30"
        style={{
          top: '80%',
          height: '2px',
          background: 'linear-gradient(90deg, transparent, #c084fc, #86efac, #c084fc, transparent)',
          animation: 'flowLine 15s linear infinite reverse',
          boxShadow: '0 0 10px #c084fc, 0 0 20px #86efac',
        }}
      />

      {/* 垂直光线 */}
      <div
        className="absolute h-full opacity-20"
        style={{
          left: '15%',
          width: '2px',
          background: 'linear-gradient(180deg, transparent, #67e8f9, transparent)',
          animation: 'flowLineVertical 10s linear infinite',
          boxShadow: '0 0 10px #67e8f9',
        }}
      />
      <div
        className="absolute h-full opacity-20"
        style={{
          left: '85%',
          width: '2px',
          background: 'linear-gradient(180deg, transparent, #c084fc, transparent)',
          animation: 'flowLineVertical 12s linear infinite reverse',
          boxShadow: '0 0 10px #c084fc',
        }}
      />
    </div>
  );
};

// 星空闪烁效果
const TwinklingStars: React.FC = () => {
  const stars = Array.from({ length: 80 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: Math.random() * 3 + 2,
    delay: Math.random() * 3,
    duration: Math.random() * 2 + 1.5,
    color: ['#ffffff', '#67e8f9', '#c084fc', '#fbbf24'][Math.floor(Math.random() * 4)],
  }));

  return (
    <div className="absolute inset-0 pointer-events-none">
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full"
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            background: star.color,
            boxShadow: `0 0 6px ${star.color}, 0 0 12px ${star.color}`,
            animation: `twinkle ${star.duration}s ease-in-out infinite`,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}
    </div>
  );
};

// 渐变光晕
const GradientGlow: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* 左上角光晕 */}
      <div
        className="absolute -top-1/4 -left-1/4 w-2/3 h-2/3 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(103, 232, 249, 0.4) 0%, rgba(103, 232, 249, 0.1) 40%, transparent 70%)',
          animation: 'pulseGlow 8s ease-in-out infinite',
          filter: 'blur(40px)',
        }}
      />
      {/* 右下角光晕 */}
      <div
        className="absolute -bottom-1/4 -right-1/4 w-2/3 h-2/3 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(192, 132, 252, 0.4) 0%, rgba(192, 132, 252, 0.1) 40%, transparent 70%)',
          animation: 'pulseGlow 10s ease-in-out infinite reverse',
          filter: 'blur(40px)',
        }}
      />
      {/* 中心光晕 */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(134, 239, 172, 0.3) 0%, rgba(134, 239, 172, 0.1) 40%, transparent 60%)',
          animation: 'pulseGlow 12s ease-in-out infinite',
          filter: 'blur(60px)',
        }}
      />
      {/* 额外光晕 - 右上 */}
      <div
        className="absolute -top-1/4 right-0 w-1/2 h-1/2 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(251, 191, 36, 0.3) 0%, transparent 70%)',
          animation: 'pulseGlow 14s ease-in-out infinite',
          filter: 'blur(50px)',
        }}
      />
      {/* 额外光晕 - 左下 */}
      <div
        className="absolute -bottom-1/4 left-0 w-1/2 h-1/2 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(252, 165, 165, 0.3) 0%, transparent 70%)',
          animation: 'pulseGlow 11s ease-in-out infinite reverse',
          filter: 'blur(50px)',
        }}
      />
    </div>
  );
};

// 主背景组件
export const BackgroundEffects: React.FC = () => {
  return (
    <div className="fixed inset-0" style={{ zIndex: 0 }}>
      {/* 基础渐变背景 */}
      <div className="absolute inset-0 animated-gradient" />
      
      {/* 光晕效果 */}
      <GradientGlow />
      
      {/* 星空 */}
      <TwinklingStars />
      
      {/* 流动光线 */}
      <FlowingLines />
      
      {/* 粒子连线 */}
      <ParticleBackground />
    </div>
  );
};

export default BackgroundEffects;
