<template>
  <view>
    <s-layout title="首页" navbar="custom" tabbar="/pages/index/index" :navbarStyle="template.style?.navbar"
      onShareAppMessage>
      
      <view class="main-content-wrap">
        
        <view class="banner-content" v-if="bannerList.length">
          <swiper class="swiper-content" :indicator-dots="bannerIndicatorDots" :autoplay="true" :interval="4000">
            <swiper-item v-for="it in bannerList" :key="it.id" @tap="clickBanner(it)">
              <image :src="it.src" class="img" mode="aspectFill" />
            </swiper-item>
          </swiper>
        </view>

        <template v-if="false">
          <view class="category-content">
            <view class="category-item" v-for="it in categoryList" :key="it.id"
              @tap="onNav('/pages/goods/list', { categoryId: it.id })">
              <image :src="it.icon" class="ct-icon" mode="aspectFit" />
              <view class="ct-text">{{ it.name }}</view>
            </view>
          </view>
        </template>

        <view class="goods-block">
          <s-goods-card :data="goodsCard.data" :styles="goodsCard.style" @goodsLoaded="onGoodsLoaded" />
        </view>
      </view>
    </s-layout>
  </view>
</template>

<script setup>
  import { computed, ref } from 'vue';
  import { onLoad, onPageScroll, onPullDownRefresh, onReachBottom, onShareAppMessage } from '@dcloudio/uni-app';
  
  // ---------------------------------------------------------
  // 1. 核心修复：按需引入模块，解决 sheep 全局对象的循环引用报错
  // ---------------------------------------------------------
  import sheepRouter from '@/sheep/router'; // 独立引入路由
  import sheepStore from '@/sheep/store';   // 独立引入状态管理
  import $url from '@/sheep/url';           // 工具类通常无副作用，可以直接引
  import categoryApi from '@/sheep/api/category'; // 单独引入分类API (需确认文件存在)
  
  // 平台特有逻辑
  // #ifdef H5
  // import weixin from '@/sheep/libs/sdk-h5-weixin'; // 如果报错暂时注释
  // #endif
  import $share from '@/sheep/platform/share'; // 分享逻辑

  // 数据定义
  const categoryList = ref([]);
  const shareData = ref($share.getShareInfo());
  const bannerData = ref([]);
  
  // 顶部安全高度 (适配自定义导航栏)
  const barHeight = ref('0px');

  // 商品卡片配置
  const goodsCard = {
    "data": {
      "mode": 2,
      "goodsFields": {
        "title": { "show": 1 },
        "subtitle": { "show": 1 },
        "price": { "show": 1 },
        "original_price": { "show": 1 },
        "sales": { "show": 1 },
        "stock": { "show": 0 }
      },
      "buyNowStyle": {},
      "tagStyle": { "show": 0, "src": "" },
      params: { orderField: 'sort', orderSort: 'asc' },
      "borderRadiusTop": 6,
      "borderRadiusBottom": 6,
      "space": 8
    },
    "style": {
      "background": { "type": "color", "bgImage": "", "bgColor": "" },
      "marginLeft": 8,
      "marginRight": 8,
      "marginTop": 0,
      "marginBottom": 10,
      "borderRadiusTop": 0,
      "borderRadiusBottom": 0,
      "padding": 0
    }
  };

  // 隐藏原生 TabBar (使用自定义 TabBar)
  uni.hideTabBar();

  // 计算属性
  const template = computed(() => sheepStore('app').template?.home || {}); // 加可选链防止报错
  const bannerIndicatorDots = computed(() => bannerData.value.length > 1);
  
  const bannerList = computed(() => {
    return bannerData.value.map((item, index) => ({
      id: item.id ?? `${index}`,
      src: $url.cdn(item.pic), // 使用 $url 替代 sheep.$url
      title: item.title || item.name || '',
    }))
  });

  // 页面生命周期
  onLoad((options) => {
    // 【布局修复】：微信小程序胶囊对齐
    // #ifdef MP-WEIXIN
    const menuButton = uni.getMenuButtonBoundingClientRect();
    barHeight.value = (menuButton.bottom + 10) + 'px';
    // #endif

    // 处理启动参数
    if (options.scene) {
      const sceneParams = decodeURIComponent(options.scene).split('=');
      options[sceneParams[0]] = sceneParams[1];
    }
    if (options.templateId) {
      sheepStore('app').init(options.templateId);
    }
    if (options.spm) {
      $share.decryptSpm(options.spm);
    }
    if (options.page) {
      sheepRouter.go(decodeURIComponent(options.page));
    }

    refreshShareData();
    getCategoryList();
    
    // #ifdef H5
    // setOpenShare(); // 暂时注释防报错，确认 sdk-h5-weixin 存在后开启
    // #endif
  });

  // 事件处理
  function onGoodsLoaded(goods) {
    // 从商品列表中提取带图片的作为轮播图 (模拟逻辑)
    bannerData.value = (goods || []).filter(item => item.pic).slice(0, 5);
  }

  // 下拉刷新
  onPullDownRefresh(() => {
    sheepStore('app').init();
    setTimeout(() => uni.stopPullDownRefresh(), 800);
  });

  // 路由跳转封装
  function onNav(path, query = {}) {
    sheepRouter.go(path, query);
  }

  function clickBanner(item) {
    if (!item || !item.id) return;
    sheepRouter.go('/pages/goods/index', { id: item.id });
  }

  // API 调用 (修复 sheep.$api 报错)
  function getCategoryList() {
    // 如果没有 categoryApi，可以先注释掉或用 mock 数据
    if(categoryApi && categoryApi.list) {
        categoryApi.list().then(res => {
          categoryList.value = res;
        }).catch(e => console.log('分类加载失败', e));
    }
  }

  function refreshShareData() {
    shareData.value = $share.getShareInfo();
  }

  onShareAppMessage(() => ({ ...shareData.value }));
</script>

<style lang="scss" scoped>
  // 样式保持不变，优化了缩进和部分兼容性
  .main-content-wrap {
    /* #ifdef MP-WEIXIN */
    padding-top: v-bind(barHeight); 
    /* #endif */

    /* #ifdef H5 */
    padding-top: 90rpx; // H5 默认导航栏高度
    /* #endif */
    
    padding-bottom: 120rpx; // 底部留白，防止 TabBar 遮挡
  }

  .goods-block {
    margin: 10rpx 20rpx 20rpx 20rpx;
  }

  /* 轮播图样式 */
  .banner-content {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    margin: 10rpx 0 24rpx 0;
    // 移除复杂背景，保持清爽
    // background: linear-gradient(135deg, #f8fafc 0%, #e8ecf3 100%);
    border-radius: 20rpx;
  }

  .swiper-content {
    width: 94%; // 略微加宽
    height: 340rpx; // 略微增高适配现代手机
    border-radius: 16rpx;
    overflow: hidden;
    background: #fff;
    // 阴影优化
    box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.05); 
  }

  .img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    border-radius: 16rpx;
  }

  /* 分类宫格样式 */
  .category-content {
    margin: 20rpx 30rpx;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    
    .category-item {
      width: 20%; // 一行5个
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 24rpx;
      
      .ct-icon { 
        width: 88rpx; 
        height: 88rpx; 
        margin-bottom: 10rpx;
      }
      .ct-text { 
        font-size: 24rpx;
        color: #333;
      }
    }
  }
</style>