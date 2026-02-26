## B站讲解视频
https://www.bilibili.com/video/BV16N4y1d7MM

## node 推荐版本
16.13.1

## 技术栈

- **前端技术栈：uni-app、ES6、Vue3、Vite、Pinia;**

```bash
# 安装依赖 (需安装nodejs环境, 使用npm国内镜像)
$ npm install --registry=https://registry.npmmirror.com
```
## 启动方式
更推荐用vscode或者webstorm开发，所以请不要使用hbuilder启动。
```bash
# npm 运行
npm run dev:h5
```

# 生产构建（生成 dist/build/h5 目录）
npm run build:h5

## 项目结构

```
├── pages                   // 页面
│      ├── index            // 入口页面
│      ├── user             // 用户相关
│      ├── public           // 公共页面
│      ├── activity         // 活动页面
│      ├── app              // 积分、签到页面
│      ├── chat             // 客服页面
│      ├── commission       // 分销页面
│      ├── coupon           // 优惠券页面
│      ├── goods            // 商品页面
│      ├── order            // 订单页面
│      ├── pay              // 支付页面
├── sheep                   // 底层依赖/工具库
│      ├── api              // 服务端接口
│      ├── components       // 自定义功能组件
│      ├── config           // 配置文件
│      ├── helper           // 助手函数
│      ├── hooks            // vue-hooks
│      ├── libs             // 自定义依赖
│      ├── platform         // 第三方平台登录、分享、支付
│      ├── request          // 请求类库
│      ├── router           // 自定义路由跳转
│      ├── scss             // 主样式库
│      ├── store            // pinia状态管理模块
│      ├── ui               // 自定义UI组件
│      ├── url              // cdn图片地址格式化
│      ├── validate         // 通用验证器
│      ├── index.js         // Shopro入口文件
├── uni_modules             // dcloud第三方插件

```


参数说明：
ss-font-24 是在 _tools.scss:248-255 里通过 @for 循环生成的，范围是 ss-font-20 到 ss-font-50，作用是设置字体大小为对应的 rpx。
所以 ss-font-24 等价于 font-size: 24rpx;。


first_one、first_two、second_one、third_one 对应的是不同的展示组件与数据来源，区别如下：
first_one：使用 first-one.vue，渲染 pagination.data 的商品列表，当前已改成两列；点击进商品详情。
first_two：使用 first-two.vue，同样渲染 pagination.data，本身就是两列卡片样式，图+标题+价格。
second_one：使用 second-one.vue，渲染当前一级分类下的子分类 props.data.children[activeMenu].children，是三列子类目入口，不是商品分页。
third_one：使用 third-one.vue，先按一级分类下的子分类分组，再渲染每组的子类目入口，也是三列，不走商品分页。