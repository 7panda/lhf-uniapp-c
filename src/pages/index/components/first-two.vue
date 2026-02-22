<template>
  <view>
    <view class="ss-flex flex-wrap">
      <view class="goods-box" v-for="item in pagination?.data" :key="item.id">
        <view @click="sheep.$router.go('/pages/goods/index', { id: item.id })">
          <view class="goods-img-wrap">
            <image class="goods-img" :src="sheep.$url.cdn(item.image)" mode="aspectFit"></image>
          </view>
          <view class="goods-content">
            <view class="goods-title ss-line-1 ss-m-b-28">{{ item.title }}</view>
            <view v-if="isValidPrice(item.price)" class="goods-price font-OPPOSANS">
              <text class="price-unit">￥</text>
              {{ isArray(item.price) ? item.price[0] : item.price }}
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
  import sheep from '@/sheep';
  import { isArray } from 'lodash';

  const props = defineProps({
    data: {
      type: Object,
      default: () => ({}),
    },
    activeMenu: [Number, String],
    pagination: Object,
  });

  // 核心：判断价格是否有效（参考标准商品组件逻辑）
  const isValidPrice = (price) => {
    if (price == null) return false; // 排除 null / undefined
    if (typeof price === 'number') return price > 0;
    if (typeof price === 'string') {
      const num = parseFloat(price);
      return !isNaN(num) && num > 0;
    }
    if (isArray(price)) {
      const first = price[0];
      return isValidPrice(first);
    }
    return false;
  };
</script>

<style lang="scss" scoped>
  .goods-box {
    width: calc((100% - 20rpx) / 2);
    margin-bottom: 20rpx;
    background: #ffffff;
    border-radius: 12rpx;
    overflow: hidden;
    box-shadow: 0px 4rpx 24rpx rgba(0, 0, 0, 0.12);
    transition: all 0.3s ease;

    &:active {
      transform: scale(0.98);
      box-shadow: 0px 2rpx 12rpx rgba(0, 0, 0, 0.08);
    }

    .goods-img-wrap {
      width: 100%;
      height: 246rpx;
      background: linear-gradient(135deg, #e8e8e8 0%, #d0d0d0 100%);
      border-radius: 12rpx 12rpx 0px 0px;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;

      .goods-img {
        width: 100%;
        // height: 100%;
      }
    }

    .goods-content {
      width: 100%;
      padding: 20rpx 16rpx 28rpx;
      box-sizing: border-box;
      background: #ffffff;

      .goods-title {
        font-size: 26rpx;
        font-weight: 600;
        color: #333333;
        line-height: 36rpx;
      }

      .goods-price {
        font-size: 28rpx;
        font-weight: 600;
        color: #e1212b;
        line-height: 40rpx;
        
        .price-unit {
          font-size: 28rpx;
          margin-right: 4rpx;
        }
      }
    }

    &:nth-child(2n + 1) {
      margin-right: 20rpx;
    }
  }
</style>