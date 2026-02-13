<template>
  <view>
    <s-layout title="首页" navbar="custom" tabbar="/pages/index/index" :navbarStyle="template.style?.navbar"
      onShareAppMessage>
      
      <view class="main-content-wrap">
        <view class="banner-content" v-if="bannerList.length">
          <swiper 
            class="swiper-content" 
            :style="{ height: swiperHeight }"
            :indicator-dots="bannerIndicatorDots" 
            :autoplay="true"
            circular
            interval="3000"
            duration="500"
          >
            <swiper-item v-for="it in bannerList" :key="it.id" @tap="clickBanner(it)">
              <image 
                :src="it.pic" 
                class="img" 
                @load="onImageLoad(it.id)"
                @error="onImageError(it.id)"
              />
            </swiper-item>
          </swiper>
        </view>
        <!-- 分类区域被注释，保留结构 -->
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
import { computed, ref, onMounted } from 'vue';
import { onLoad, onPageScroll, onPullDownRefresh, onReachBottom, onShareAppMessage } from '@dcloudio/uni-app';
import sheep from '@/sheep';
import $share from '@/sheep/platform/share';

//#ifdef H5
import weixin from '@/sheep/libs/sdk-h5-weixin';
//#endif

const categoryList = ref([]);
const shareData = ref($share.getShareInfo());
const bannerData = ref([]);
const barHeight = ref('0px');
const swiperHeight = ref('30vh'); // 默认值，后续动态计算

// 商品卡片配置（保持不变）
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
    id: item.id ?? `${index}`,
    pic: sheep.$url.cdn(item.pic),
    title: item.title,
  }));
});

// 动态计算轮播图高度（30% 视口高度）
function calculateSwiperHeight() {
  try {
    const sysInfo = uni.getSystemInfoSync();
    const targetHeight = sysInfo.windowHeight * 0.3; // 30%
    swiperHeight.value = targetHeight + 'px';
  } catch (e) {
    console.warn('[Banner] Failed to get system info, fallback to 30vh');
    swiperHeight.value = '30vh';
  }
}

onLoad((options) => {
  // 微信小程序：动态避让胶囊按钮
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
  calculateSwiperHeight(); // 关键：计算轮播图高度

  //#ifdef H5
  setOpenShare();
  //#endif
});

// 图片加载反馈（可选调试用）
const loadedImages = ref(new Set());
function onImageLoad(id) {
  loadedImages.value.add(id);
}
function onImageError(id) {
  console.warn(`[Banner] Image load failed for ID: ${id}`);
}

async function onGoodsLoaded(goods) {
  const now = new Date();
  const currentDay = now.getDate();

  const extractDay = (dateStr) => {
    if (!dateStr) return null;
    const match = String(dateStr).match(/(\d{4})-(\d{2})-(\d{2})/);
    return match ? parseInt(match[3]) : null;
  };

  const matchesDay = (item) => {
    const updateTimeDay = extractDay(item.updateTime);
    if (updateTimeDay !== null && updateTimeDay === currentDay) return true;
    const createTimeDay = extractDay(item.createTime);
    if (createTimeDay !== null && createTimeDay === currentDay) return true;
    if (item.id !== undefined && item.id !== null && currentDay !== 0) {
      const idModDay = (item.id % currentDay) % 10;
      if (idModDay === currentDay % 10) return true;
    }
    return false;
  };

  let candidates = (goods || []).filter(item => item.pic);
  if (!candidates.length) {
    bannerData.value = [];
    return;
  }

  // 仅对前10个候选做宽高检测（避免性能问题）
  const topCandidates = candidates.slice(0, 10);
  const rest = candidates.slice(10);

  const evaluateItem = (item) => {
    return new Promise((resolve) => {
      const dateBonus = matchesDay(item) ? 1000 : 0;
      const src = sheep.$url.cdn(item.pic);
      uni.getImageInfo({
        src,
        success: (res) => {
          if (res.width && res.height) {
            const ratio = res.width / res.height;
            const closeness = Math.abs(ratio - 4 / 3);
            const ratioScore = 1 / (1 + closeness);
            resolve({ item, score: dateBonus + ratioScore });
          } else {
            resolve({ item, score: dateBonus });
          }
        },
        fail: () => {
          resolve({ item, score: dateBonus });
        }
      });
    });
  };

  try {
    const evaluated = await Promise.all(topCandidates.map(evaluateItem));
    evaluated.sort((a, b) => b.score - a.score);
    const selected = evaluated.slice(0, 5).map(e => e.item);
    bannerData.value = selected.length > 0 ? selected : candidates.slice(0, 5);
  } catch (e) {
    console.error('[Banner] Evaluation error:', e);
    bannerData.value = candidates.slice(0, 5); // 降级
  }
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
  if (!item?.id) return;
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
.main-content-wrap {
  /* #ifdef MP-WEIXIN */
  padding-top: v-bind(barHeight);
  /* #endif */

  /* #ifdef H5 */
  padding-top: 90rpx;
  /* #endif */
}

.goods-block {
  margin: 10rpx 20rpx 20rpx 20rpx;
}

.banner-content {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 10rpx 0 24rpx 0;
  padding: 0 20rpx; // 内边距，避免贴边
}

.swiper-content {
  width: 100%;
  border-radius: 16rpx;
  overflow: hidden;
  background: linear-gradient(135deg, #f8fafc 0%, #e8ecf3 100%);
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.06);
  position: relative;
}

.img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
  opacity: 0;
  animation: imgFadeIn 0.6s ease-in forwards;
}

.img:active {
  transform: scale(0.97);
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.12);
}

@keyframes imgFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* 以下为保留样式，未启用但结构完整 */
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