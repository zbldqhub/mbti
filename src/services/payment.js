/**
 * 支付服务模块
 * 
 * 这个模块封装了微信支付和支付宝的调用逻辑
 * 你只需要在 payment.js 配置文件中填写正确的信息即可
 */

import { 
  useMockPayment, 
  wechatPayConfig, 
  alipayConfig, 
  paymentParams,
  currentPaymentMethod 
} from '../config/payment.js';

/**
 * 创建支付订单
 * @param {string} orderId - 订单ID
 * @returns {Promise<Object>} - 支付参数
 */
export const createPaymentOrder = async (orderId) => {
  // 如果使用模拟支付，直接返回模拟数据
  if (useMockPayment) {
    console.log('【模拟支付】创建订单:', orderId);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          mock: true,
          orderId: orderId,
          message: '模拟订单创建成功'
        });
      }, 500);
    });
  }

  // 真实支付：调用后端接口创建订单
  try {
    const config = currentPaymentMethod === 'wechat' ? wechatPayConfig : alipayConfig;
    
    const response = await fetch(`${config.apiBaseUrl}${config.createOrderEndpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        orderId: orderId,
        productName: paymentParams.productName,
        productDesc: paymentParams.productDesc,
        amount: paymentParams.price,
        notifyUrl: config.notifyUrl,
        returnUrl: config.returnUrl
      })
    });

    const data = await response.json();
    
    if (data.success) {
      return {
        success: true,
        ...data.data
      };
    } else {
      throw new Error(data.message || '创建订单失败');
    }
  } catch (error) {
    console.error('创建支付订单失败:', error);
    throw error;
  }
};

/**
 * 调起微信支付
 * @param {Object} payParams - 支付参数
 * @returns {Promise<Object>} - 支付结果
 */
export const requestWechatPayment = (payParams) => {
  return new Promise((resolve, reject) => {
    // 检查是否在微信公众号/小程序环境
    if (typeof WeixinJSBridge === 'undefined') {
      // 尝试使用 JSSDK
      if (typeof wx !== 'undefined' && wx.requestPayment) {
        wx.requestPayment({
          timeStamp: payParams.timeStamp,
          nonceStr: payParams.nonceStr,
          package: payParams.package,
          signType: payParams.signType || 'RSA',
          paySign: payParams.paySign,
          success: (res) => {
            resolve({ success: true, data: res });
          },
          fail: (err) => {
            reject({ success: false, error: err });
          }
        });
      } else {
        reject({ 
          success: false, 
          error: '当前环境不支持微信支付，请在微信中打开' 
        });
      }
      return;
    }

    // 使用 WeixinJSBridge
    WeixinJSBridge.invoke('getBrandWCPayRequest', {
      appId: payParams.appId,
      timeStamp: payParams.timeStamp,
      nonceStr: payParams.nonceStr,
      package: payParams.package,
      signType: payParams.signType || 'RSA',
      paySign: payParams.paySign
    }, (res) => {
      if (res.err_msg === 'get_brand_wcpay_request:ok') {
        resolve({ success: true, data: res });
      } else if (res.err_msg === 'get_brand_wcpay_request:cancel') {
        reject({ success: false, cancelled: true, error: '用户取消支付' });
      } else {
        reject({ success: false, error: res.err_msg || '支付失败' });
      }
    });
  });
};

/**
 * 调起支付宝支付
 * @param {Object} payParams - 支付参数
 * @returns {Promise<Object>} - 支付结果
 */
export const requestAlipayPayment = (payParams) => {
  return new Promise((resolve, reject) => {
    // 支付宝通常返回一个form表单，需要提交
    if (payParams.form) {
      // 创建表单并提交
      const formContainer = document.createElement('div');
      formContainer.innerHTML = payParams.form;
      document.body.appendChild(formContainer);
      
      const form = formContainer.querySelector('form');
      if (form) {
        form.submit();
        resolve({ success: true, message: '正在跳转支付宝...' });
      } else {
        reject({ success: false, error: '支付表单解析失败' });
      }
      
      // 清理
      setTimeout(() => {
        document.body.removeChild(formContainer);
      }, 1000);
    } else if (payParams.tradeNo) {
      // 使用支付宝JSAPI（需要在支付宝客户端内）
      if (typeof AlipayJSBridge !== 'undefined') {
        AlipayJSBridge.call('tradePay', {
          tradeNO: payParams.tradeNo
        }, (res) => {
          if (res.resultCode === '9000') {
            resolve({ success: true, data: res });
          } else if (res.resultCode === '6001') {
            reject({ success: false, cancelled: true, error: '用户取消支付' });
          } else {
            reject({ success: false, error: res.memo || '支付失败' });
          }
        });
      } else {
        // 跳转到支付宝支付页面
        window.location.href = payParams.payUrl || `https://openapi.alipay.com/gateway.do?${payParams.queryString}`;
        resolve({ success: true, message: '正在跳转支付宝...' });
      }
    } else {
      reject({ success: false, error: '支付参数不完整' });
    }
  });
};

/**
 * 查询订单状态
 * @param {string} orderId - 订单ID
 * @returns {Promise<Object>} - 订单状态
 */
export const queryOrderStatus = async (orderId) => {
  // 模拟支付直接返回成功
  if (useMockPayment) {
    return { success: true, paid: true };
  }

  try {
    const config = currentPaymentMethod === 'wechat' ? wechatPayConfig : alipayConfig;
    
    const response = await fetch(`${config.apiBaseUrl}${config.queryOrderEndpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ orderId })
    });

    const data = await response.json();
    
    return {
      success: true,
      paid: data.data?.status === 'PAID'
    };
  } catch (error) {
    console.error('查询订单状态失败:', error);
    return { success: false, paid: false };
  }
};

/**
 * 生成订单ID
 * @returns {string} - 订单ID
 */
export const generateOrderId = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `MBTI${timestamp}${random}`;
};

/**
 * 主支付函数
 * @returns {Promise<Object>} - 支付结果
 */
export const processPayment = async () => {
  // 生成订单ID
  const orderId = generateOrderId();
  
  try {
    // 1. 创建订单
    const orderResult = await createPaymentOrder(orderId);
    
    if (!orderResult.success) {
      throw new Error(orderResult.message || '创建订单失败');
    }

    // 模拟支付直接返回成功
    if (orderResult.mock) {
      return {
        success: true,
        orderId: orderId,
        mock: true
      };
    }

    // 2. 调起支付
    let payResult;
    if (currentPaymentMethod === 'wechat') {
      payResult = await requestWechatPayment(orderResult);
    } else if (currentPaymentMethod === 'alipay') {
      payResult = await requestAlipayPayment(orderResult);
    } else {
      throw new Error('未知的支付方式');
    }

    if (!payResult.success) {
      throw new Error(payResult.error || '支付失败');
    }

    // 3. 查询支付结果
    const statusResult = await queryOrderStatus(orderId);
    
    return {
      success: true,
      orderId: orderId,
      paid: statusResult.paid
    };
  } catch (error) {
    console.error('支付流程失败:', error);
    return {
      success: false,
      error: error.message || '支付失败',
      orderId: orderId
    };
  }
};

export default {
  createPaymentOrder,
  requestWechatPayment,
  requestAlipayPayment,
  queryOrderStatus,
  generateOrderId,
  processPayment
};
