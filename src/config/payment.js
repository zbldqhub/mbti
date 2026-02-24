/**
 * 支付配置文件
 * 
 * 新手程序员配置指南：
 * 
 * 1. 选择你要使用的支付方式（微信或支付宝）
 * 2. 根据下面的说明填写对应的配置信息
 * 3. 将 useMockPayment 设置为 false 启用真实支付
 */

// ============================================
// 支付模式设置
// ============================================

// 设置为 false 启用真实支付，true 使用模拟支付
export const useMockPayment = true;

// ============================================
// 微信支付配置
// ============================================

/**
 * 微信支付配置说明：
 * 
 * 1. appId: 在微信公众平台注册的公众号/小程序AppID
 *    获取方式：登录微信公众平台 → 开发 → 基本配置 → AppID
 * 
 * 2. mchId: 微信支付商户号
 *    获取方式：登录微信支付商户平台 → 账户中心 → 商户信息 → 商户号
 * 
 * 3. apiKey: 微信支付API密钥
 *    获取方式：登录微信支付商户平台 → 账户中心 → API安全 → API密钥
 * 
 * 4. notifyUrl: 支付结果通知地址（你的服务器接口）
 *    示例：https://your-domain.com/api/payment/notify
 * 
 * 5. 后端接口地址：需要你的后端提供以下接口
 *    - 创建订单接口：用于获取prepay_id
 *    - 查询订单接口：用于查询支付结果
 */

export const wechatPayConfig = {
  // 公众号/小程序AppID（必填）
  appId: 'wx1234567890abcdef',
  
  // 商户号（必填）
  mchId: '1234567890',
  
  // API密钥（必填，用于签名）
  apiKey: 'your-api-key-here',
  
  // 支付结果通知地址（必填）
  notifyUrl: 'https://your-domain.com/api/payment/notify',
  
  // 你的后端接口地址（必填）
  apiBaseUrl: 'https://your-domain.com/api',
  
  // 创建订单接口路径
  createOrderEndpoint: '/payment/create-order',
  
  // 查询订单接口路径
  queryOrderEndpoint: '/payment/query-order'
};

// ============================================
// 支付宝配置
// ============================================

/**
 * 支付宝配置说明：
 * 
 * 1. appId: 在支付宝开放平台创建的应用AppID
 *    获取方式：登录支付宝开放平台 → 控制台 → 应用 → AppID
 * 
 * 2. privateKey: 应用私钥
 *    获取方式：支付宝开放平台 → 控制台 → 应用 → 开发设置 → 接口加签方式
 * 
 * 3. alipayPublicKey: 支付宝公钥
 *    获取方式：同上，在设置加签方式时获取
 * 
 * 4. notifyUrl: 支付结果通知地址（你的服务器接口）
 *    示例：https://your-domain.com/api/payment/alipay-notify
 * 
 * 5. returnUrl: 支付完成后跳转的页面地址
 *    示例：https://your-domain.com/payment/success
 * 
 * 6. 后端接口地址：需要你的后端提供以下接口
 *    - 创建订单接口：用于生成支付宝订单
 *    - 查询订单接口：用于查询支付结果
 */

export const alipayConfig = {
  // 应用AppID（必填）
  appId: '2024XXXXXXXXXXXX',
  
  // 应用私钥（必填）
  privateKey: 'your-private-key-here',
  
  // 支付宝公钥（必填）
  alipayPublicKey: 'alipay-public-key-here',
  
  // 支付结果通知地址（必填）
  notifyUrl: 'https://your-domain.com/api/payment/alipay-notify',
  
  // 支付完成跳转地址（必填）
  returnUrl: 'https://your-domain.com/payment/success',
  
  // 你的后端接口地址（必填）
  apiBaseUrl: 'https://your-domain.com/api',
  
  // 创建订单接口路径
  createOrderEndpoint: '/payment/alipay-create',
  
  // 查询订单接口路径
  queryOrderEndpoint: '/payment/alipay-query'
};

// ============================================
// 支付参数配置
// ============================================

export const paymentParams = {
  // 商品名称
  productName: 'MBTI深度分析报告',
  
  // 商品描述
  productDesc: '解锁65道深度题目，获取完整性格画像',
  
  // 价格（单位：元）
  price: 3.99,
  
  // 原价（用于显示划线价）
  originalPrice: 18.00,
  
  // 订单超时时间（分钟）
  expireMinutes: 30
};

// ============================================
// 支付方式选择
// ============================================

// 当前使用的支付方式：'wechat' | 'alipay'
export const currentPaymentMethod = 'wechat';

// ============================================
// 获取当前支付配置
// ============================================

export const getCurrentPaymentConfig = () => {
  if (currentPaymentMethod === 'wechat') {
    return wechatPayConfig;
  } else if (currentPaymentMethod === 'alipay') {
    return alipayConfig;
  }
  return null;
};

export default {
  useMockPayment,
  wechatPayConfig,
  alipayConfig,
  paymentParams,
  currentPaymentMethod,
  getCurrentPaymentConfig
};
