<!-- 商品卡片组件 -->
<template>
  <view class="ss-goods-wrap">
    <!-- xs 卡片 -->
    <view
      v-if="size === 'xs'"
      class="xs-goods-card ss-flex ss-col-stretch"
      :style="[elStyles]"
      @tap="onClick"
    >
      <view v-if="tagStyle.show" class="tag-icon-box">
        <image class="tag-icon" :src="sheep.$url.cdn(tagStyle.src)"></image>
      </view>
      <image class="xs-img-box" :src="sheep.$url.cdn(data.image)" mode="aspectFit"></image>
      <view
        v-if="goodsFields.title?.show || (goodsFields.price?.show && isValidPrice(data.price))"
        class="xs-goods-content ss-flex-col ss-row-around"
      >
        <view
          v-if="goodsFields.title?.show"
          class="xs-goods-title ss-line-1"
          :style="[{ color: titleColor, width: titleWidth ? titleWidth + 'rpx' : '' }]"
        >
          {{ data.title }}
        </view>
        <view
          v-if="goodsFields.price?.show && isValidPrice(data.price)"
          class="xs-goods-price font-OPPOSANS"
          :style="[{ color: goodsFields.price.color }]"
        >
          <text class="price-unit ss-font-24">{{ priceUnit }}</text>
          {{ isArray(data.price) ? data.price[0] : data.price }}
        </view>
      </view>
    </view>

    <!-- sm 卡片 -->
    <view v-if="size === 'sm'" class="sm-goods-card ss-flex-col" :style="[elStyles]" @tap="onClick">
      <view v-if="tagStyle.show" class="tag-icon-box">
        <image class="tag-icon" :src="sheep.$url.cdn(tagStyle.src)"></image>
      </view>
      <image class="sm-img-box" :src="sheep.$url.cdn(data.image)" mode="aspectFill"></image>
      <view
        v-if="goodsFields.title?.show || (goodsFields.price?.show && isValidPrice(data.price))"
        class="sm-goods-content"
        :style="[{ color: titleColor, width: titleWidth ? titleWidth + 'rpx' : '' }]"
      >
        <view v-if="goodsFields.title?.show" class="sm-goods-title ss-line-1 ss-m-b-16">
          {{ data.title }}
        </view>
        <view
          v-if="goodsFields.price?.show && isValidPrice(data.price)"
          class="sm-goods-price font-OPPOSANS"
          :style="[{ color: goodsFields.price.color }]"
        >
          <text class="price-unit ss-font-24">{{ priceUnit }}</text>
          {{ isArray(data.price) ? data.price[0] : data.price }}
        </view>
      </view>
    </view>

    <!-- md 卡片 -->
    <view v-if="size === 'md'" class="md-goods-card ss-flex-col" :style="[elStyles]" @tap="onClick">
      <view v-if="tagStyle.show" class="tag-icon-box">
        <image class="tag-icon" :src="sheep.$url.cdn(tagStyle.src)"></image>
      </view>
      <image
        class="md-img-box"
        :src="sheep.$url.cdn(data.pic || data.image)"
        mode="widthFix"
        @load="calculatePanelHeight"
      ></image>
      <view
        class="md-goods-content ss-flex-col ss-row-around ss-p-b-20 ss-p-t-20 ss-p-x-16"
        :id="elId"
      >
        <view
          v-if="goodsFields.title?.show"
          class="md-goods-title ss-line-1"
          :style="[{ color: titleColor, width: titleWidth ? titleWidth + 'rpx' : '' }]"
        >
          {{ data.name || data.title }}
        </view>
        <view
          v-if="goodsFields.subtitle?.show"
          class="md-goods-subtitle ss-m-t-16 ss-line-1"
          :style="[{ color: subTitleColor, background: subTitleBackground }]"
        >
          {{ data.subtitle }}
        </view>
        <slot name="activity">
          <view v-if="data.promos?.length" class="tag-box ss-flex-wrap ss-flex ss-col-center">
            <view
              class="activity-tag ss-m-r-10 ss-m-t-16"
              v-for="item in data.promos"
              :key="item.id"
            >
              {{ item.title }}
            </view>
          </view>
        </slot>
        <view class="ss-flex ss-col-bottom">
          <view
            v-if="goodsFields.price?.show && isValidPrice(data.price)"
            class="md-goods-price ss-m-t-16 font-OPPOSANS ss-m-r-10"
            :style="[{ color: goodsFields.price.color }]"
          >
            <text class="price-unit ss-font-24">{{ priceUnit }}</text>
            {{ isArray(data.price) ? data.price[0] : data.price }}
          </view>

          <view
            v-if="goodsFields.original_price?.show && isValidPrice(data.original_price)"
            class="goods-origin-price ss-m-t-16 font-OPPOSANS ss-flex"
            :style="[{ color: originPriceColor }]"
          >
            <text class="price-unit ss-font-20">{{ priceUnit }}</text>
            <view class="ss-m-l-8">{{ data.original_price }}</view>
          </view>
        </view>
      </view>

      <slot name="cart">
        <view class="cart-box ss-flex ss-col-center ss-row-center">
          <image class="cart-icon" src="/static/img/shop/tabbar/category2.png" mode=""></image>
        </view>
      </slot>
    </view>

    <!-- lg 卡片 -->
    <view
      v-if="size === 'lg'"
      class="lg-goods-card ss-flex ss-col-stretch"
      :style="[elStyles]"
      @tap="onClick"
    >
      <view v-if="tagStyle.show" class="tag-icon-box">
        <image class="tag-icon" :src="sheep.$url.cdn(tagStyle.src)"></image>
      </view>
      <view v-if="seckillTag" class="seckill-tag ss-flex ss-row-center"> 秒杀 </view>
      <view v-if="grouponTag" class="groupon-tag ss-flex ss-row-center">
        <view class="tag-icon">拼团</view>
      </view>
      <image class="lg-img-box" :src="sheep.$url.cdn(data.image)" mode="aspectFill"></image>
      <view class="lg-goods-content ss-flex-1 ss-flex-col ss-row-between ss-p-b-10 ss-p-t-20">
        <view>
          <view
            v-if="goodsFields.title?.show"
            class="lg-goods-title ss-line-2"
            :style="[{ color: titleColor }]"
          >
            {{ data.title }}
          </view>
          <view
            v-if="goodsFields.subtitle?.show"
            class="lg-goods-subtitle ss-m-t-10 ss-line-1"
            :style="[{ color: subTitleColor, background: subTitleBackground }]"
          >
            {{ data.subtitle }}
          </view>
        </view>
        <view>
          <slot name="activity">
            <view v-if="data.promos?.length" class="tag-box ss-flex ss-col-center">
              <view class="activity-tag ss-m-r-10" v-for="item in data.promos" :key="item.id">
                {{ item.title }}
              </view>
            </view>
          </slot>
          <view class="ss-flex ss-col-bottom ss-m-t-10">
            <view
              v-if="goodsFields.price?.show && isValidPrice(data.price)"
              class="lg-goods-price ss-m-r-12 ss-flex ss-col-bottom font-OPPOSANS"
              :style="[{ color: goodsFields.price.color }]"
            >
              <text class="ss-font-24">{{ priceUnit }}</text>
              {{ isArray(data.price) ? data.price[0] : data.price }}
            </view>
            <view
              v-if="goodsFields.original_price?.show && isValidPrice(data.original_price)"
              class="goods-origin-price ss-flex ss-col-bottom font-OPPOSANS"
              :style="[{ color: originPriceColor }]"
            >
              <text class="price-unit ss-font-20">{{ priceUnit }}</text>
              <view class="ss-m-l-8">{{ data.original_price }}</view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- sl 卡片 -->
    <view v-if="size === 'sl'" class="sl-goods-card ss-flex-col" :style="[elStyles]" @tap="onClick">
      <view v-if="tagStyle.show" class="tag-icon-box">
        <image class="tag-icon" :src="sheep.$url.cdn(tagStyle.src)"></image>
      </view>
      <image class="sl-img-box" :src="sheep.$url.cdn(data.image)" mode="aspectFill"></image>
      <view class="sl-goods-content">
        <view>
          <view
            v-if="goodsFields.title?.show"
            class="sl-goods-title ss-line-1"
            :style="[{ color: titleColor }]"
          >
            {{ data.title }}
          </view>
          <view
            v-if="goodsFields.subtitle?.show"
            class="sl-goods-subtitle ss-m-t-16"
            :style="[{ color: subTitleColor, background: subTitleBackground }]"
          >
            {{ data.subtitle }}
          </view>
        </view>
        <view>
          <slot name="activity">
            <view v-if="data.promos?.length" class="tag-box ss-flex ss-col-center ss-flex-wrap">
              <view
                class="activity-tag ss-m-r-10 ss-m-t-16"
                v-for="item in data.promos"
                :key="item.id"
              >
                {{ item.title }}
              </view>
            </view>
          </slot>
          <view v-if="goodsFields.price?.show" class="ss-flex ss-col-bottom font-OPPOSANS">
            <view
              v-if="isValidPrice(data.price)"
              class="sl-goods-price ss-m-r-12"
              :style="[{ color: goodsFields.price.color }]"
            >
              <text class="price-unit ss-font-24">{{ priceUnit }}</text>
              {{ isArray(data.price) ? data.price[0] : data.price }}
            </view>
            <view
              v-if="goodsFields.original_price?.show && isValidPrice(data.original_price)"
              class="goods-origin-price ss-m-t-16 font-OPPOSANS ss-flex"
              :style="[{ color: originPriceColor }]"
            >
              <text class="price-unit ss-font-20">{{ priceUnit }}</text>
              <view class="ss-m-l-8">{{ data.original_price }}</view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, reactive, getCurrentInstance } from 'vue';
import sheep from '@/sheep';
import { formatSales } from '@/sheep/hooks/useGoods';
import { isArray } from 'lodash';

// ✅ 核心：判断价格是否有效
function isValidPrice(price) {
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
}

const props = defineProps({
  goodsFields: {
    type: Object,
    default() {
      return {
        title: { show: true },
        subtitle: { show: true },
        price: { show: true },
        original_price: { show: true },
        sales: { show: true },
        stock: { show: true },
      };
    },
  },
  tagStyle: {
    type: Object,
    default: () => ({}),
  },
  data: {
    type: Object,
    default: () => ({}), // 注意：这里不能返回 null 或不安全结构
  },
  size: {
    type: String,
    default: 'sl',
  },
  background: {
    type: String,
    default: '',
  },
  topRadius: {
    type: Number,
    default: 0,
  },
  bottomRadius: {
    type: Number,
    default: 0,
  },
  titleWidth: {
    type: Number,
    default: 0,
  },
  titleColor: {
    type: String,
    default: '#333',
  },
  priceColor: {
    type: String,
    default: '',
  },
  originPriceColor: {
    type: String,
    default: '#C4C4C4',
  },
  priceUnit: {
    type: String,
    default: '￥',
  },
  subTitleColor: {
    type: String,
    default: '#999999',
  },
  subTitleBackground: {
    type: String,
    default: '',
  },
  buttonShow: {
    type: Boolean,
    default: true,
  },
  seckillTag: {
    type: Boolean,
    default: false,
  },
  grouponTag: {
    type: Boolean,
    default: false,
  },
});

const elStyles = computed(() => {
  return {
    background: props.background,
    'border-top-left-radius': props.topRadius + 'px',
    'border-top-right-radius': props.topRadius + 'px',
    'border-bottom-left-radius': props.bottomRadius + 'px',
    'border-bottom-right-radius': props.bottomRadius + 'px',
  };
});

const salesAndStock = computed(() => {
  let text = [];
  if (props.goodsFields.sales?.show) {
    text.push(formatSales(props.data.sales_show_type, 10000));
  }
  return text.join(' | ');
});

const emits = defineEmits(['click', 'getHeight']);

const onClick = () => {
  emits('click');
};

const { proxy } = getCurrentInstance();
const elId = `sheep_${Math.ceil(Math.random() * 10e5).toString(36)}`;

function calculatePanelHeight(e) {
  if (props.size === 'md') {
    const view = uni.createSelectorQuery().in(proxy);
    view.select(`#${elId}`).fields({ size: true });
    view.exec((data) => {
      const goodsPriceCard = data[0];
      const card = {
        width: goodsPriceCard.width,
        height: (goodsPriceCard.width / e.detail.width) * e.detail.height + goodsPriceCard.height,
      };
      emits('getHeight', card.height);
    });
  }
}
</script>

<style lang="scss" scoped>
  .tag-icon-box {
    position: absolute;
    left: 0;
    top: 0;
    z-index: 2;
    .tag-icon {
      width: 72rpx;
      height: 44rpx;
    }
  }
  .seckill-tag {
    position: absolute;
    left: 0;
    top: 0;
    z-index: 2;
    width: 68rpx;
    height: 38rpx;
    background: linear-gradient(90deg, #ff5854 0%, #ff2621 100%);
    border-radius: 10rpx 0px 10rpx 0px;
    font-size: 24rpx;
    font-weight: 500;
    color: #ffffff;
    line-height: 32rpx;
  }
  .groupon-tag {
    position: absolute;
    left: 0;
    top: 0;
    z-index: 2;
    width: 68rpx;
    height: 38rpx;
    background: linear-gradient(90deg, #fe832a 0%, #ff6600 100%);
    border-radius: 10rpx 0px 10rpx 0px;
    font-size: 24rpx;
    font-weight: 500;
    color: #ffffff;
    line-height: 32rpx;
  }
  .goods-img {
    width: 100%;
    height: 100%;
    background-color: #f5f5f5;
  }
  .price-unit {
    margin-right: -4px;
  }
  .sales-text {
    display: table;
    font-size: 24rpx;
    transform: scale(0.8);
    margin-left: 0rpx;
    color: #c4c4c4;
  }

  .activity-tag {
    font-size: 20rpx;
    color: #ff0000;
    line-height: 30rpx;
    padding: 0 10rpx;
    border: 1px solid rgba(#ff0000, 0.25);
    border-radius: 4px;
    flex-shrink: 0;
  }

  .goods-origin-price {
    font-size: 20rpx;
    color: #c4c4c4;
    line-height: 36rpx;
    text-decoration: line-through;
  }

  // xs
  .xs-goods-card {
    overflow: hidden;
    // max-width: 375rpx;
    background-color: $white;
    position: relative;

    .xs-img-box {
      width: 128rpx;
      height: 128rpx;
      margin-right: 20rpx;
    }

    .xs-goods-title {
      font-size: 26rpx;
      color: #333;
      font-weight: 500;
    }

    .xs-goods-price {
      font-size: 30rpx;
      color: $red;
    }
  }

  // sm
  .sm-goods-card {
    overflow: hidden;
    // width: 223rpx;
    // width: 100%;
    background-color: $white;
    position: relative;

    .sm-img-box {
      // width: 228rpx;
      width: 100%;
      height: 208rpx;
    }
    .sm-goods-content {
      padding: 20rpx 16rpx;
      box-sizing: border-box;
    }
    .sm-goods-title {
      font-size: 26rpx;
      color: #333;
    }

    .sm-goods-price {
      font-size: 30rpx;
      color: $red;
    }
  }

  // md
  .md-goods-card {
    overflow: hidden;
    width: 100%;
    position: relative;
    z-index: 1;
    background-color: $white;
    position: relative;

    .md-img-box {
      width: 100%;
    }

    .md-goods-title {
      font-size: 26rpx;
      color: #333;
      width: 100%;
    }
    .md-goods-subtitle {
      font-size: 24rpx;
      font-weight: 400;
      color: #999999;
    }

    .md-goods-price {
      font-size: 30rpx;
      color: $red;
      line-height: 36rpx;
    }

    .cart-box {
      width: 54rpx;
      height: 54rpx;
      background: linear-gradient(90deg, #fe8900, #ff5e00);
      border-radius: 50%;
      position: absolute;
      bottom: 50rpx;
      right: 20rpx;
      z-index: 2;

      .cart-icon {
        width: 30rpx;
        height: 30rpx;
      }
    }
  }

  // lg
  .lg-goods-card {
    overflow: hidden;
    position: relative;
    z-index: 1;
    background-color: $white;
    height: 280rpx;

    .lg-img-box {
      width: 280rpx;
      height: 280rpx;
      margin-right: 20rpx;
    }

    .lg-goods-title {
      font-size: 28rpx;
      font-weight: 500;
      color: #333333;
    }
    .lg-goods-subtitle {
      font-size: 24rpx;
      font-weight: 400;
      color: #999999;
    }

    .lg-goods-price {
      font-size: 30rpx;
      color: $red;
      line-height: 36rpx;
    }

    .buy-box {
      position: absolute;
      bottom: 20rpx;
      right: 20rpx;
      z-index: 2;
      width: 120rpx;
      height: 50rpx;
      background: linear-gradient(90deg, #fe8900, #ff5e00);
      border-radius: 25rpx;
      font-size: 24rpx;
      color: #ffffff;
    }
    .tag-box {
      width: 100%;
    }
  }

  // sl

  .sl-goods-card {
    overflow: hidden;
    position: relative;
    zindex: 1;
    width: 100%;
    background-color: $white;
    .sl-goods-content {
      padding: 20rpx 20rpx;
      box-sizing: border-box;
    }
    .sl-img-box {
      width: 100%;
      height: 360rpx;
    }

    .sl-goods-title {
      font-size: 26rpx;
      color: #333;
      font-weight: 500;
    }
    .sl-goods-subtitle {
      font-size: 24rpx;
      font-weight: 400;
      color: #999999;
      line-height: 30rpx;
    }

    .sl-goods-price {
      font-size: 30rpx;
      color: $red;
      line-height: 36rpx;
    }

    .buy-box {
      position: absolute;
      bottom: 20rpx;
      right: 20rpx;
      z-index: 2;
      width: 148rpx;
      height: 50rpx;
      background: linear-gradient(90deg, #fe8900, #ff5e00);
      border-radius: 25rpx;
      font-size: 24rpx;
      color: #ffffff;
    }
  }
</style>