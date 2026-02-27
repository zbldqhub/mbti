/**
 * 图片配置文件
 *
 * 新手配置指南：
 *
 * 1. 题目配图：可以替换为 Unsplash 上的高质量图片链接
 *    获取方式：访问 https://unsplash.com，搜索关键词，复制图片链接
 *
 * 2. 二维码图片：支持两种方式
 *    a) 本地图片（推荐）：将二维码图片放在 public/images/qrcode.png
 *    b) 在线图片：使用图片URL（如：https://example.com/qrcode.png）
 */

// ============================================
// 二维码配置
// ============================================

/**
 * 二维码图片路径
 *
 * 使用本地图片（推荐）：
 * 1. 将你的二维码图片命名为 qrcode.png
 * 2. 放到 public/images/ 目录下
 * 3. 下面的配置保持 '/images/qrcode.png' 即可（注意带斜杠开头）
 *
 * 使用在线图片：
 * 直接将路径改为完整的URL，如：'https://example.com/qrcode.png'
 *
 * 推荐尺寸：200x200 像素
 */
export const qrCodeImage = '/images/qrcode.png';

// ============================================
// 题目配图配置
// ============================================

/**
 * EI维度（外向 vs 内向）配图
 * 主题：社交、聚会、独处、思考
 */
export const eiImages = [
  // 社交聚会场景
  'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=600&fit=crop&q=80',
  // 朋友聚会
  'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800&h=600&fit=crop&q=80',
  // 热闹派对
  'https://images.unsplash.com/photo-1522098543979-ffc7f79a56c4?w=800&h=600&fit=crop&q=80',
  // 团队活动
  'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&h=600&fit=crop&q=80',
  // 会议讨论
  'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&h=600&fit=crop&q=80',
  // 公开演讲
  'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&h=600&fit=crop&q=80',
  // 社交场合
  'https://images.unsplash.com/photo-1531058020387-3be344556be6?w=800&h=600&fit=crop&q=80',
  // 团队协作
  'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=600&fit=crop&q=80',
  // 独处阅读
  'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=800&h=600&fit=crop&q=80',
  // 安静思考
  'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=600&fit=crop&q=80',
  // 独自工作
  'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=600&fit=crop&q=80',
  // 沉思
  'https://images.unsplash.com/photo-1519834785169-98be25ec3f84?w=800&h=600&fit=crop&q=80',
  // 深度交流
  'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&h=600&fit=crop&q=80',
  // 一对一谈话
  'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&h=600&fit=crop&q=80',
  // 小组讨论
  'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop&q=80',
  // 咖啡厅社交
  'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=800&h=600&fit=crop&q=80',
  // 家庭聚会
  'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&h=600&fit=crop&q=80',
  // 假期活动
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&h=600&fit=crop&q=80',
  // 学习方法
  'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&h=600&fit=crop&q=80',
  // 庆祝方式
  'https://images.unsplash.com/photo-1530103862676-de3c9da59af7?w=800&h=600&fit=crop&q=80',
  // 工作环境
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop&q=80',
  // 能量恢复
  'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&h=600&fit=crop&q=80',
  // 沟通方式
  'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=800&h=600&fit=crop&q=80'
];

/**
 * SN维度（实感 vs 直觉）配图
 * 主题：细节、现实、想象、未来
 */
export const snImages = [
  // 关注细节
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop&q=80',
  // 阅读书籍
  'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop&q=80',
  // 旅行规划
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=600&fit=crop&q=80',
  // 经验学习
  'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop&q=80',
  // 具体教学
  'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&h=600&fit=crop&q=80',
  // 当下现实
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&q=80',
  // 实际操作
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop&q=80',
  // 传统方法
  'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=800&h=600&fit=crop&q=80',
  // 精确描述
  'https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=800&h=600&fit=crop&q=80',
  // 逐步学习
  'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=600&fit=crop&q=80',
  // 数据经验
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop&q=80',
  // 写实艺术
  'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&h=600&fit=crop&q=80',
  // 具体信息
  'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&h=600&fit=crop&q=80',
  // 环境细节
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop&q=80',
  // 明确表达
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop&q=80',
  // 实用性
  'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&h=600&fit=crop&q=80',
  // 珍惜当下
  'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&h=600&fit=crop&q=80',
  // 过往案例
  'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=800&h=600&fit=crop&q=80',
  // 日常事务
  'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&h=600&fit=crop&q=80',
  // 抽象困扰
  'https://images.unsplash.com/photo-1493932484895-752d1471eab5?w=800&h=600&fit=crop&q=80',
  // 写实描述
  'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=800&h=600&fit=crop&q=80',
  // 具体信息
  'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&h=600&fit=crop&q=80',
  // 记住细节
  'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop&q=80'
];

/**
 * TF维度（思考 vs 情感）配图
 * 主题：逻辑、分析、情感、关怀
 */
export const tfImages = [
  // 逻辑决策
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop&q=80',
  // 分析问题
  'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&h=600&fit=crop&q=80',
  // 实话实说
  'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop&q=80',
  // 能力领导
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=600&fit=crop&q=80',
  // 专业批评
  'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&h=600&fit=crop&q=80',
  // 真相正确
  'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop&q=80',
  // 数据判断
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop&q=80',
  // 公平规则
  'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=600&fit=crop&q=80',
  // 批判思考
  'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&h=600&fit=crop&q=80',
  // 坚持原则
  'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&h=600&fit=crop&q=80',
  // 能力认可
  'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&h=600&fit=crop&q=80',
  // 公正解决
  'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=600&fit=crop&q=80',
  // 专业人士
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&h=600&fit=crop&q=80',
  // 容忍错误
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop&q=80',
  // 任务优先
  'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&h=600&fit=crop&q=80',
  // 逻辑电影
  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&h=600&fit=crop&q=80',
  // 公平正义
  'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=600&fit=crop&q=80',
  // 优缺点清单
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop&q=80',
  // 情绪化争论
  'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&h=600&fit=crop&q=80',
  // 真理效率
  'https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=800&h=600&fit=crop&q=80',
  // 指出问题
  'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop&q=80',
  // 感情用事
  'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&h=600&fit=crop&q=80',
  // 理性客观
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop&q=80'
];

/**
 * JP维度（判断 vs 知觉）配图
 * 主题：计划、组织、灵活、随性
 */
export const jpImages = [
  // 有计划生活
  'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&h=600&fit=crop&q=80',
  // 截止日期
  'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&h=600&fit=crop&q=80',
  // 整洁桌面
  'https://images.unsplash.com/photo-1493932484895-752d1471eab5?w=800&h=600&fit=crop&q=80',
  // 详细计划
  'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=600&fit=crop&q=80',
  // 旅行规划
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=600&fit=crop&q=80',
  // 悬而未决
  'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&h=600&fit=crop&q=80',
  // 完成任务
  'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&h=600&fit=crop&q=80',
  // 工作环境
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop&q=80',
  // 决定性
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop&q=80',
  // 优先顺序
  'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&h=600&fit=crop&q=80',
  // 事情决定
  'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&h=600&fit=crop&q=80',
  // 待办清单
  'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&h=600&fit=crop&q=80',
  // 混乱无序
  'https://images.unsplash.com/photo-1493932484895-752d1471eab5?w=800&h=600&fit=crop&q=80',
  // 早点决定
  'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&h=600&fit=crop&q=80',
  // 游戏规则
  'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=600&fit=crop&q=80',
  // 分阶段工作
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop&q=80',
  // 结果成就
  'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&h=600&fit=crop&q=80',
  // 遵守承诺
  'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&h=600&fit=crop&q=80',
  // 购物清单
  'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&h=600&fit=crop&q=80',
  // 有始有终
  'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&h=600&fit=crop&q=80',
  // 事情没做完
  'https://images.unsplash.com/photo-1493932484895-752d1471eab5?w=800&h=600&fit=crop&q=80',
  // 确定性
  'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&h=600&fit=crop&q=80',
  // 组织结构
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop&q=80',
  // 按计划行事
  'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&h=600&fit=crop&q=80'
];

/**
 * 获取题目配图
 * @param {string} dimension - 维度（EI/SN/TF/JP）
 * @param {number} questionId - 题目ID
 * @returns {string} - 图片URL
 */
export const getQuestionImage = (dimension, questionId) => {
  const imageMap = {
    'EI': eiImages,
    'SN': snImages,
    'TF': tfImages,
    'JP': jpImages
  };

  const images = imageMap[dimension] || eiImages;
  // 使用题目ID对图片数组长度取模，确保每个题目都有唯一图片
  return images[(questionId - 1) % images.length];
};

export default {
  qrCodeImage,
  eiImages,
  snImages,
  tfImages,
  jpImages,
  getQuestionImage
};
