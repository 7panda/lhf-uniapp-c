<template>
  <view>
    <s-layout title="首页" navbar="custom" tabbar="/pages/index/index" :navbarStyle="template.style?.navbar"
      onShareAppMessage>
      
      <view class="main-content-wrap">
        <view class="banner-content" v-if="bannerList.length">
          <swiper class="swiper-content" :indicator-dots="bannerIndicatorDots" :autoplay="true">
            <swiper-item v-for="it in bannerList" :key="it.id" @tap="clickBanner(it)">
              <image :src="it.src" class="img" />
            </swiper-item>
          </swiper>
        </view>

        <template v-if="false">
          <view class="category-content">
            <view class="category-item" v-for="it in categoryList" :key="it.id"
              @tap="sheep.$router.go('/pages/goods/list', { categoryId: it.id })">
              <image :src="it.icon" class="ct-icon" />
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
  import sheep from '@/sheep';
  import $share from '@/sheep/platform/share';
  
  //#ifdef H5
  import weixin from '@/sheep/libs/sdk-h5-weixin';
  import { sys } from '@/sheep/helper';
  //#endif

  const categoryList = ref([]);
  const shareData = ref($share.getShareInfo());
  const bannerData = ref([]);
  
  // 用于动态绑定顶部安全高度
  const barHeight = ref('0px');

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

  const template = computed(() => sheep.$store('app').template.home);
  const bannerIndicatorDots = computed(() => bannerData.value.length > 1);
  const bannerList = computed(() => {
    return bannerData.value.map((item, index) => ({
      id: item.product?.id ?? `${index}`,
      src: sheep.$url.cdn(item.product?.pic),
      title: item.product?.name || item.product?.title || '',
    }))
  });

  onLoad((options) => {
    // 【微信小程序特供修复】：动态获取胶囊底部高度，确保避让精准
    // #ifdef MP-WEIXIN
    const menuButton = uni.getMenuButtonBoundingClientRect();
    barHeight.value = (menuButton.bottom + 10) + 'px';
    // #endif

    if (options.scene) {
      const sceneParams = decodeURIComponent(options.scene).split('=');
      options[sceneParams[0]] = sceneParams[1];
    }
    if (options.templateId) {
      sheep.$store('app').init(options.templateId);
    }
    if (options.spm) {
      $share.decryptSpm(options.spm);
    }
    if (options.page) {
      sheep.$router.go(decodeURIComponent(options.page));
    }
    refreshShareData();
    getCategoryList();
    //#ifdef H5
    setOpenShare();
    //#endif
  });

  function onGoodsLoaded(goods) {
    // 获取当前日期的 day（几号）
    const now = new Date();
    const currentDay = now.getDate();

    // 提取日期字符串中的日期数字
    const extractDay = (dateStr) => {
      if (!dateStr) return null;
      const match = String(dateStr).match(/(\d{4})-(\d{2})-(\d{2})/);
      return match ? parseInt(match[3]) : null;
    };

    // 日期匹配函数
    const matchesDay = (item) => {
      // 优先级1：检查 product.updateTime 的 day
      const updateTimeDay = extractDay(item.product?.updateTime);
      if (updateTimeDay !== null && updateTimeDay === currentDay) {
        return true;
      }

      // 优先级2：检查 product.createTime 的 day
      const createTimeDay = extractDay(item.product?.createTime);
      if (createTimeDay !== null && createTimeDay === currentDay) {
        return true;
      }

      // 优先级3：用 product.id % day 的个位数来匹配
      if (item.product?.id !== undefined && item.product?.id !== null) {
        const idModDay = (item.product.id % currentDay) % 10;
        if (idModDay === currentDay % 10) {
          return true;
        }
      }

      return false;
    };

    // 筛选匹配的商品，有图片则取前5个
    const filtered = (goods || []).filter(item => item.product?.pic && matchesDay(item)).slice(0, 5);

    console.log('[banner] currentDay:', currentDay, 'matched:', filtered.length);

    // 如果没有匹配到日期相关的商品，则降级为直接取有图片的前5个
    bannerData.value = filtered.length > 0 ? filtered : (goods || []).filter(item => item.product?.pic).slice(0, 5);
  }

  onShareAppMessage(() => ({ ...shareData.value }));

  onPullDownRefresh(() => {
    sheep.$store('app').init();
    setTimeout(() => uni.stopPullDownRefresh(), 800);
  });

  onReachBottom(() => {});
  onPageScroll(() => {});

  function refreshShareData() {
    shareData.value = $share.getShareInfo();
  }

  function clickBanner(item) {
    if (!item || !item.id) return;
    sheep.$router.go('/pages/goods/index', { id: item.id });
  }

  function getCategoryList() {
    sheep.$api.category.list().then(res => {
      categoryList.value = res;
    });
  }

  //#ifdef H5
  function setOpenShare() {
    weixin.updateShareInfo(shareData.value);
  }
  //#endif
</script>

<style lang="scss" scoped>
  // 新增包裹容器样式
  .main-content-wrap {
    /* #ifdef MP-WEIXIN */
    padding-top: v-bind(barHeight); 
    /* #endif */

    /* #ifdef H5 */
    padding-top: 90rpx; 
    /* #endif */
  }

  .goods-block {
    // 移除原有 margin 里的高度绑定，由外层 wrap 统一控制
    margin: 10rpx 20rpx 20rpx 20rpx;
  }

  /* 轮播图样式：保留原有属性，仅优化顶部边距 */
  .banner-content {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    margin: 10rpx 0 24rpx 0; // 调小顶部边距，使其贴合导航栏
    background: linear-gradient(135deg, #f8fafc 0%, #e8ecf3 100%);
    border-radius: 20rpx;
    box-shadow: 0 8rpx 32rpx rgba(0,0,0,0.04);
  }

  /* 以下原有样式完整保留 */
  .swiper-content {
    width: 90%;
    max-width: 100%;
    height: 300rpx;
    border-radius: 16rpx;
    overflow: hidden;
    background: #fff;
    box-shadow: 0 4rpx 24rpx rgba(0,0,0,0.06);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .img {
    height: 300rpx;
    width: 100%;
    max-width: 100%;
    object-fit: cover;
    display: block;
    margin-left: auto;
    margin-right: auto;
    background: linear-gradient(135deg, #f5f5f5 60%, #e3e8ee 100%);
    border-radius: 16rpx;
    box-shadow: 0 4rpx 24rpx rgba(0,0,0,0.08);
    transition: box-shadow 0.3s, transform 0.3s;
    opacity: 0;
    animation: imgFadeIn 0.6s ease-in forwards;
  }
  .img:active {
    transform: scale(0.97);
    box-shadow: 0 8rpx 32rpx rgba(0,0,0,0.12);
  }
  @keyframes imgFadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .icon-text {
    display: flex;
    justify-content: center;
    margin-bottom: 24rpx;
    .text-info {
      display: flex;
      align-items: center;
      width: 440rpx;
      .left { width: 108rpx; height: 2rpx; background: #D8D8D8; }
      .center {
        width: 128rpx; height: 44rpx; font-size: 32rpx;
        font-family: PingFangSC-Medium, PingFang SC; font-weight: 500;
        color: #333333; line-height: 44rpx; margin-left: 48rpx; margin-right: 48rpx;
      }
      .right { width: 108rpx; height: 2rpx; background: #D8D8D8; }
    }
  }

  .category-content {
    margin-left: 40rpx;
    margin-right: 40rpx;
    display: grid;
    grid-template-columns: auto auto auto 112rpx;
    .category-item {
      width: 112rpx; margin-bottom: 48rpx;
      .ct-icon { width: 88rpx; height: 88rpx; padding-left: 12rpx; }
      .ct-text { margin-top: 16rpx; }
    }
  }
</style>