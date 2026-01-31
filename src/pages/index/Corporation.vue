<template>
  <s-layout title="合作联系" tabbar="/pages/public/contact" :bgStyle="{ color: '#fff' }">
    <view class="hero-section ss-flex ss-row-center">
      <view class="big-logo-box">
        <image 
          class="logo-img" 
          src="https://bucket-t1-mall.oss-cn-chengdu.aliyuncs.com/lhf_260126/lhf_logo.png" 
          mode="widthFix" 
        />
      </view>
    </view>

    <view class="text-content-area">
      <view class="company-info ss-m-b-40">
        <view class="name">成都华飞茗品家具有限公司</view>
        <view class="tag">Established 2008 · 全屋家居一站式服务商</view>
        <view class="desc ss-m-t-20">
          成都华飞茗品家具有限公司创立于2008年，是一家集研发、生产、销售于一体的全屋家居企业。
        </view>
      </view>

      <view class="brand-list ss-m-b-40">
        <view class="label-title">旗下品牌</view>
        <view class="ss-flex ss-m-t-20">
          <view class="brand-tag" v-for="item in brands" :key="item.name">{{ item.name }}</view>
        </view>
      </view>

      <view class="detail-block ss-m-b-40">
        <view class="label-title">业务覆盖</view>
        <view class="content-text">
          产品覆盖套房家具、沙发、软床、床垫、茶几电视柜、餐桌椅及配套小件。
        </view>
      </view>

      <view class="detail-block ss-m-b-40">
        <view class="label-title">公司宗旨</view>
        <view class="content-text quote">
          “以匠心造好物，用品质筑家，让每一个空间都兼具舒适与美感。”
        </view>
      </view>

      <view class="contact-card ss-flex ss-row-between ss-col-center" @tap="sheep.$helper.util.makePhoneCall('400-xxx-xxxx')">
        <view>
          <view class="c-label">商务合作热线</view>
          <view class="c-value">189-8179-2927</view>
        </view>
        <text class="_icon-forward" style="font-size: 40rpx; color: #ccc"></text>
      </view>
      
      <view class="address-info ss-m-t-30">
        <view class="c-label">地址</view>
        <view class="c-value">成都崇州市三江镇工业园</view>
      </view>
    </view>

    <view class="ss-p-b-120"></view>
  </s-layout>
</template>

<script setup>
  import sheep from '@/sheep';

  const brands = [
    { name: '木子寝居' },
    { name: '华飞名床' },
    { name: '简约两厅' }
  ];
</script>

<style lang="scss" scoped>
  // 核心：让图片占据屏幕 90% 宽度的视觉重心
  .hero-section {
    width: 100%;
    padding: 60rpx 0;
    background-color: #fff;
    
    .big-logo-box {
      width: 90%; // 图片容器占屏宽 90%
      max-width: 680rpx;
      
      .logo-img {
        width: 100%;
        display: block;
        border-radius: 20rpx;
      }
    }
  }

  .text-content-area {
    padding: 0 40rpx;
    
    .name {
      font-size: 40rpx;
      font-weight: bold;
      color: #333;
    }
    
    .tag {
      font-size: 24rpx;
      color: var(--ui-BG-Main);
      margin-top: 10rpx;
    }
    
    .desc {
      font-size: 28rpx;
      color: #666;
      line-height: 1.6;
    }
  }

  .label-title {
    font-size: 30rpx;
    font-weight: 600;
    color: #333;
    display: flex;
    align-items: center;
    
    &::before {
      content: '';
      width: 8rpx;
      height: 30rpx;
      background: var(--ui-BG-Main-gradient);
      margin-right: 16rpx;
      border-radius: 4rpx;
    }
  }

  .brand-tag {
    padding: 10rpx 24rpx;
    background: #f6f6f6;
    border-radius: 10rpx;
    font-size: 26rpx;
    color: #444;
    margin-right: 20rpx;
  }

  .content-text {
    font-size: 28rpx;
    color: #666;
    margin-top: 16rpx;
    line-height: 1.6;
    
    &.quote {
      font-style: italic;
      color: #333;
      background: #fcfcfc;
      padding: 20rpx;
      border-left: 4rpx solid #eee;
    }
  }

  .contact-card {
    background: #333;
    padding: 40rpx;
    border-radius: 24rpx;
    color: #fff;
    
    .c-label {
      font-size: 24rpx;
      opacity: 0.7;
    }
    
    .c-value {
      font-size: 36rpx;
      font-weight: bold;
      margin-top: 10rpx;
    }
  }

  .address-info {
    .c-label { font-size: 24rpx; color: #999; }
    .c-value { font-size: 28rpx; color: #444; margin-top: 6rpx; }
  }
</style>