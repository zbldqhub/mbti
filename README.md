# MBTI性格测试 H5网站

一个移动端优先的MBTI性格测试H5网站，采用"免费基础版+付费深度版"的两层架构。

## 🎉 快速部署

### 方式1：直接部署（推荐新手）

1. 将 `dist` 文件夹中的所有文件上传到你的服务器或静态托管平台
2. 修改 `src/config/payment.js` 中的支付配置（如需真实支付）
3. 修改 `src/config/images.js` 中的二维码图片链接
4. 重新构建：`npm run build`
5. 再次上传 `dist` 文件夹

### 方式2：使用Vercel/Netlify

```bash
# 安装依赖
npm install

# 修改配置后构建
npm run build

# 部署 dist 文件夹
```

---

## 📝 配置说明

### 1. 替换二维码图片

**文件位置：** `src/config/images.js`

```javascript
// ============================================
// 二维码配置
// ============================================

/**
 * 二维码图片URL
 * 
 * 替换方式：
 * 1. 访问 https://cli.im 生成你的二维码（推荐内容：你的网站链接）
 * 2. 下载二维码图片，上传到图床：
 *    - 免费图床：https://imgur.com
 *    - 国内图床：https://sm.ms
 *    - 或者上传到你自己的服务器
 * 3. 将下面的链接替换为你的二维码图片链接
 * 
 * 推荐尺寸：200x200 像素
 */
export const qrCodeImage = 'https://your-qrcode-image-url.png';
```

**快速获取二维码图片链接的步骤：**

1. 打开 [草料二维码](https://cli.im)
2. 输入你的网站链接（如：`https://your-domain.com`）
3. 点击生成二维码
4. 下载二维码图片
5. 上传到图床获取图片链接
6. 替换 `qrCodeImage` 的值

### 2. 配置支付（可选）

**文件位置：** `src/config/payment.js`

```javascript
// 设置为 false 启用真实支付
export const useMockPayment = false;

// 选择支付方式
export const currentPaymentMethod = 'wechat'; // 或 'alipay'

// 填写微信支付配置
export const wechatPayConfig = {
  appId: '你的AppID',
  mchId: '你的商户号',
  apiKey: '你的API密钥',
  // ... 其他配置
};
```

详细配置说明见下方【支付配置】章节。

### 3. 替换题目配图（可选）

**文件位置：** `src/config/images.js`

已内置93张高质量Unsplash图片，每个题目都有独特配图。如需替换：

```javascript
// 例如替换EI维度的图片
export const eiImages = [
  'https://images.unsplash.com/photo-xxx?w=800&h=600&fit=crop&q=80',
  // ... 更多图片
];
```

---

## 📁 项目结构

```
src/
├── components/          # Vue组件
│   ├── Home.vue        # 首页
│   ├── Quiz.vue        # 答题页（含配图）
│   ├── Result.vue      # 结果页
│   ├── ProUpgrade.vue  # 深度解锁页
│   └── SharePoster.vue # 分享海报
├── config/             # 配置文件
│   ├── payment.js      # 支付配置 ⭐
│   └── images.js       # 图片配置 ⭐
├── services/
│   └── payment.js      # 支付服务
├── data/
│   └── questions.js    # 93题题库
├── utils/
│   └── scoring.js      # 计分逻辑
├── App.vue
└── main.js
```

**只需修改的文件：**
- `src/config/payment.js` - 支付配置
- `src/config/images.js` - 二维码图片

---

## 💳 支付配置详解

### 微信支付配置

1. **获取AppID**
   - 登录 [微信公众平台](https://mp.weixin.qq.com)
   - 开发 → 基本配置 → AppID

2. **获取商户号**
   - 登录 [微信支付商户平台](https://pay.weixin.qq.com)
   - 账户中心 → 商户信息 → 商户号

3. **设置API密钥**
   - 账户中心 → API安全 → API密钥

4. **配置后端接口**
   - 需要后端提供创建订单和查询订单接口
   - 见下方【后端接口要求】

### 支付宝配置

1. **获取AppID**
   - 登录 [支付宝开放平台](https://open.alipay.com)
   - 控制台 → 应用 → AppID

2. **获取密钥**
   - 控制台 → 应用 → 开发设置 → 接口加签方式
   - 获取应用私钥和支付宝公钥

---

## 🔧 后端接口要求

### 微信支付接口

**1. 创建订单接口**
```
POST /api/payment/create-order
Content-Type: application/json

{
  "orderId": "MBTI1234567890",
  "productName": "MBTI深度分析报告",
  "productDesc": "解锁65道深度题目",
  "amount": 3.99,
  "notifyUrl": "https://your-domain.com/api/payment/notify"
}

响应：
{
  "success": true,
  "data": {
    "appId": "wx...",
    "timeStamp": "1234567890",
    "nonceStr": "...",
    "package": "prepay_id=...",
    "signType": "RSA",
    "paySign": "..."
  }
}
```

**2. 查询订单接口**
```
POST /api/payment/query-order
Content-Type: application/json

{
  "orderId": "MBTI1234567890"
}

响应：
{
  "success": true,
  "data": {
    "status": "PAID"  // 或 "UNPAID"
  }
}
```

---

## 🚀 本地开发

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建生产版本
npm run build

# 构建输出到 dist/ 目录
```

---

## 📱 功能特性

- ✅ 28题免费测试
- ✅ 93题深度分析（付费解锁）
- ✅ 每题独特配图（93张高质量图片）
- ✅ Canvas雷达图
- ✅ 精美分享海报
- ✅ 支持保存海报到相册
- ✅ 支持分享到微信、朋友圈、微博、QQ
- ✅ 断点续答
- ✅ 微信支付/支付宝接入

---

## 📸 截图

| 首页 | 答题页 | 结果页 | 分享海报 |
|------|--------|--------|----------|
| 待添加 | 待添加 | 待添加 | 待添加 |

---

## 🆘 常见问题

**Q: 二维码图片怎么替换？**
A: 修改 `src/config/images.js` 中的 `qrCodeImage`，替换为你的二维码图片链接。

**Q: 如何生成二维码？**
A: 访问 [草料二维码](https://cli.im)，输入你的网站链接，生成后下载图片上传到图床。

**Q: 支付怎么配置？**
A: 修改 `src/config/payment.js`，填写微信或支付宝的配置信息。

**Q: 图片加载慢怎么办？**
A: 可以将图片下载后上传到你的服务器或CDN，替换 `src/config/images.js` 中的链接。

---

## 📄 许可证

MIT License

---

## 🤝 联系方式

如有问题，欢迎提交 Issue。
