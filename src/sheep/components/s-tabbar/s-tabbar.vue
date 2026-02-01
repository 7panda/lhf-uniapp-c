<template>
  <view class="u-page__item" v-if="tabbar?.list?.length > 0">
    <su-tabbar
      :value="path"
      :fixed="true"
      :placeholder="true"
      :safeAreaInsetBottom="true"
      :inactiveColor="tabbar.inactiveColor"
      :activeColor="tabbar.activeColor"
      :midTabBar="tabbar.mode === 2"
      :customStyle="tabbarStyle"
    >
      <su-tabbar-item
        v-for="(item, index) in tabbar.list"
        :key="item.text"
        :text="item.text"
        :name="item.url"
        :isCenter="getTabbarCenter(index)"
        :centerImage="sheep.$url.cdn(item.inactiveIcon)"
        @tap="onTab(item)"
      >
        <template v-slot:active-icon>
          <image class="u-page__item__slot-icon" :src="sheep.$url.cdn(item.activeIcon)"></image>
        </template>
        <template v-slot:inactive-icon>
          <image class="u-page__item__slot-icon" :src="sheep.$url.cdn(item.inactiveIcon)"></image>
        </template>
      </su-tabbar-item>
    </su-tabbar>
  </view>
</template>

<script setup>
  import { computed, unref } from 'vue';
  import sheep from '@/sheep';
  // ✅ 1. 引入 store 和 router
  import sheepStore from '@/sheep/store'; 
  import sheepRouter from '@/sheep/router';

  const props = defineProps({
    path: { type: String, default: '' },
    defaultTabbar: { type: Object, default: () => ({}) }
  });

  // ✅ 2. 替换 store 获取方式
  const tabbar = computed(() => {
    // 原来是 sheep.$store('app').tabbar
    const appTabbar = sheepStore('app').tabbar; 
    return appTabbar && appTabbar.list ? appTabbar : props.defaultTabbar;
  });

  const tabbarStyle = computed(() => {
    const appTabbar = sheepStore('app').tabbar;
    return appTabbar && appTabbar.style ? appTabbar.style : {};
  });

  // ✅ 3. 替换 router 跳转
  function onTab(item) {
    if(item.url) {
       sheepRouter.go(item.url);
    }
  }
</script>

<style lang="scss">
  .u-page {
    padding: 0;

    &__item {
      &__title {
        color: var(--textSize);
        background-color: #fff;
        padding: 15px;
        font-size: 15px;

        &__slot-title {
          color: var(--textSize);
          font-size: 14px;
        }
      }

      &__slot-icon {
        width: 25px;
        height: 25px;
      }
    }
  }
</style>
