<template>
  <su-fixed bottom placeholder bg="bg-white">
    <view class="ui-tabbar-box">
      <view class="ui-tabbar ss-flex ss-col-center ss-row-between">
        <view
          v-if="collectIcon"
          class="detail-tabbar-item ss-flex ss-flex-col ss-row-center ss-col-center"
          @tap="onFavorite"
        >
          <block v-if="modelValue.favorite">
            <image
              class="item-icon"
              :src="sheep.$url.static('/static/img/shop/goods/collect_1.gif')"
              mode="aspectFit"
            ></image>
            <view class="item-title">已收藏</view>
          </block>
          <block v-else>
            <image
              class="item-icon"
              :src="sheep.$url.static('/static/img/shop/goods/collect_0.png')"
              mode="aspectFit"
            ></image>
            <view class="item-title">收藏</view>
          </block>
        </view>
        <!-- <view
          v-if="serviceIcon"
          class="detail-tabbar-item ss-flex ss-flex-col ss-row-center ss-col-center"
          @tap="exportExcel"
        >
          <image
            class="item-icon"
            :src="sheep.$url.static('/static/img/shop/goods/message.png')"
            mode="aspectFit"
          ></image>
          <view class="item-title">客服</view>
        </view> -->
        <view
          v-if="shareIcon"
          class="detail-tabbar-item ss-flex ss-flex-col ss-row-center ss-col-center"
          style="position: relative;"
          @tap="onShareClick"
        >
          <!-- #ifdef MP-WEIXIN -->
          <button
            open-type="share"
            class="ss-reset-button"
            style="position: absolute; width: 100%; height: 100%; z-index: 1; opacity: 0;"
          ></button>
          <!-- #endif -->
          <image
            class="item-icon"
            :src="sheep.$url.static('/static/img/shop/goods/share.png')"
            mode="aspectFit"
          ></image>
          <view class="item-title">分享</view>
        </view>
        <slot></slot>
      </view>
    </view>
  </su-fixed>
</template>

<script setup>
  /**
   *
   * 底部导航
   *
   * @property {String} bg 			 			- 背景颜色Class
   * @property {String} ui 			 			- 自定义样式Class
   * @property {Boolean} noFixed 		 			- 是否定位
   * @property {Boolean} topRadius 		 		- 上圆角
   *
   *
   */

  import { computed, reactive } from 'vue';
  import sheep from '@/sheep';
  import { showShareModal } from '@/sheep/hooks/useModal';
  // import * as XLSX from 'xlsx'
  // 数据
  const state = reactive({});

  // 接收参数
  const props = defineProps({
    modelValue: {
      type: Object,
      default() {},
    },
    bg: {
      type: String,
      default: 'bg-white',
    },
    bgStyles: {
      type: Object,
      default() {},
    },
    ui: {
      type: String,
      default: '',
    },

    noFixed: {
      type: Boolean,
      default: false,
    },
    topRadius: {
      type: Number,
      default: 0,
    },
    collectIcon: {
      type: Boolean,
      default: true,
    },
    serviceIcon: {
      type: Boolean,
      default: true,
    },
    shareIcon: {
      type: Boolean,
      default: true,
    },
  });
  const elStyles = computed(() => {
    return {
      'border-top-left-radius': props.topRadius + 'rpx',
      'border-top-right-radius': props.topRadius + 'rpx',
      overflow: 'hidden',
    };
  });

  const tabbarheight = (e) => {
    uni.setStorageSync('tabbar', e);
  };
  async function onFavorite() {
    const goodsId = props.modelValue?.product?.id ?? props.modelValue?.id;
    console.log('[favorite] click, goodsId:', goodsId);
    if (!goodsId) return;

    let favorites = uni.getStorageSync('my_favorites') || [];
    const targetId = String(goodsId);
    favorites = Array.isArray(favorites) ? favorites.map(String) : [];

    console.log('[favorite] before:', favorites);

    const index = favorites.indexOf(targetId);
    if (index === -1) {
      favorites.push(targetId);
      props.modelValue.favorite = true;
      sheep.$helper.toast('收藏成功');
    } else {
      favorites.splice(index, 1);
      props.modelValue.favorite = false;
      sheep.$helper.toast('已取消收藏');
    }

    uni.setStorageSync('my_favorites', favorites);
    console.log('[favorite] after:', favorites, 'favorite:', props.modelValue.favorite);
  }

  const onChat = () => {
    sheep.$helper.toast('功能暂未开发')
    // sheep.$router.go('/pages/chat/index', {
    //   id: props.modelValue.id,
    // });
  };

  // H5环境分享处理
  const onShareClick = () => {
    // #ifdef H5
    showShareModal();
    // #endif
  };

  
    const readFile = (filePath) => {
    console.log('readFilePath:', filePath)
    uni.getFileSystemManager().readFile({
      filePath: filePath,
      encoding: 'base64',
      success: (res) => {
        const data =  uni.base64ToArrayBuffer(res.data);
        console.log('data:', data)
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        console.log(jsonData);
      }
    });
  }
</script>

<style lang="scss" scoped>
  .ui-tabbar-box {
    box-shadow: 0px -6px 10px 0px rgba(51, 51, 51, 0.2);
  }
  .ui-tabbar {
    display: flex;
    height: 50px;
    background: #fff;

    .detail-tabbar-item {
      flex: 1;
      min-width: 0;

      .item-icon {
        width: 40rpx;
        height: 40rpx;
      }

      .item-title {
        font-size: 20rpx;
        font-weight: 500;
        line-height: 20rpx;
        margin-top: 12rpx;
      }
    }
  }
</style>
