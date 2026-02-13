<template>
  <view>
  <s-layout title="分类" tabbar="/pages/category/category" :bgStyle="{ color: '#fff' }">
    <view class="s-category">
      <view class="three-level-wrap ss-flex ss-col-top" :style="[{ height: pageHeight + 'px' }]">
        <scroll-view class="side-menu-wrap" scroll-y :style="[{ height: pageHeight + 'px' }]">
          <view
            class="menu-item ss-flex"
            v-for="(item, index) in state.categoryList?.children"
            :key="item.id"
            :class="[{ 'menu-item-active': index == state.activeMenu }]"
            @tap="onMenu(index)"
          >
            <view class="menu-title ss-line-1">
              {{ item.name }}
            </view>
          </view>
        </scroll-view>
        <scroll-view
          class="goods-list-box"
          scroll-y
          :style="[{ height: pageHeight + 'px' }]"
          v-if="state.categoryList?.children?.length"
        >
          <image
            v-if="state.categoryList.children[state.activeMenu].image"
            class="banner-img"
            :src="sheep.$url.cdn(state.categoryList.children[state.activeMenu].image)"
            mode="widthFix"
          >
          </image>
          <first-one
            v-if="state.categoryList.style === 'first_one'"
            :data="state.categoryList"
            :activeMenu="state.activeMenu"
            :pagination="state.pagination"
          />
          <first-two
            v-if="state.categoryList.style === 'first_two'"
            :data="state.categoryList"
            :activeMenu="state.activeMenu"
            :pagination="state.pagination"
          />
          <second-one
            v-if="state.categoryList.style === 'second_one'"
            :data="state.categoryList"
            :activeMenu="state.activeMenu"
            :pagination="state.pagination"
          />
          <third-one
            v-if="state.categoryList.style === 'third_one'"
            :data="state.categoryList"
            :activeMenu="state.activeMenu"
            :pagination="state.pagination"
          />
          <uni-load-more
            v-if="
              (state.categoryList.style === 'first_one' ||
                state.categoryList.style === 'first_two') &&
              state.pagination.total > 0
            "
            :status="state.loadStatus"
            :content-text="{
              contentdown: '加载中...',
              contentnomore: '已加载全部',
            }"
          />
        </scroll-view>
      </view>
    </view>
  </s-layout>
  </view>
</template>

<script setup>
  import secondOne from '../index/components/second-one.vue';
  import thirdOne from '../index/components/third-one.vue';
  import firstOne from '../index/components/first-one.vue';
  import firstTwo from '../index/components/first-two.vue';
  import sheep from '@/sheep';

  import { onLoad, onReachBottom } from '@dcloudio/uni-app';
  import { computed, reactive } from 'vue';
  import _ from 'lodash';
  
  // 防抖定时器
  let loadmoreTimer = null;
  
  const state = reactive({
    categoryList: [],
    activeMenu: '0',

    pagination: {
      data: [],
      current_page: 1,
      total: 1,
      last_page: 1,
    },
    loadStatus: '',
  });

  const { screenHeight, safeAreaInsets, screenWidth, safeArea } = sheep.$platform.device;
  const pageHeight = computed(() => safeArea.height - 44 - 50);

  async function getList(options) {
    const envDeptId = import.meta.env.VITE_SHOPRO_DEPT_ID || import.meta.env.SHOPRO_DEPT_ID || '200';
    
    console.log(' [分类页面] 请求参数:', { id: options.id, dept_id: envDeptId });
    
    const res = await sheep.$api.category.list({
      id: options.id,
      dept_id: envDeptId, // 显式注入部门ID
    });
    
    console.log(' [分类接口] 完整响应:', res);
    console.log(' [响应类型]:', typeof res, Array.isArray(res) ? '(数组)' : '(对象)');
    
    // 适配多种响应格式
    let actualData = null;
    
    if (Array.isArray(res)) {
      // 格式1: 直接返回数组
      actualData = res;
      console.log('🔍 [响应格式] 直接数组，长度:', actualData.length);
    } else if (res && res.data !== undefined) {
      // 格式2: {code, data, msg} 包装
      actualData = res.data;
      console.log('🔍 [响应格式] {data} 包装:', actualData);
    } else if (res && typeof res === 'object') {
      // 格式3: 其他对象
      actualData = res;
      console.log('🔍 [响应格式] 对象:', actualData);
    }
    
    if (actualData) {
      // 数据结构适配：如果后端返回数组，包装成对象
      if (Array.isArray(actualData)) {
        state.categoryList = {
          children: actualData,
          style: 'first_one', // 默认样式
        };
        console.log('✅ [分类数据] 已适配数组结构 -> 对象:', state.categoryList);
      } else if (actualData && typeof actualData === 'object') {
        // 如果是对象但缺少style，补充默认值
        state.categoryList = {
          style: 'first_one',
          ...actualData,
        };
        console.log('✅ [分类数据] 已加载对象结构:', state.categoryList);
      } else {
        state.categoryList = actualData;
        console.warn('⚠️ [分类数据] 未知数据结构:', actualData);
      }
    } else {
      console.error('❌ [分类列表] 无法解析响应数据，原始响应:', res);
    }
  }

  const onMenu = (val) => {
    console.log('🔄 [分类切换] activeMenu:', state.activeMenu, '->', val);
    
    state.activeMenu = val;
    if (state.categoryList.style === 'first_one' || state.categoryList.style === 'first_two') {
      // 重置分页数据
      state.pagination = {
        data: [],
        current_page: 1,
        total: 1,
        last_page: 1,
      };
      console.log('🔄 [分类切换] 加载商品 category_id:', state.categoryList.children[val].id);
      getGoodsList(state.categoryList.children[val].id);
    }
  };

  async function getGoodsList(id, page = 1, list_rows = 6) {
    // 状态锁：防止并发请求导致的死循环
    if (state.loadStatus === 'loading') {
      console.warn('⚠️ [商品列表] 正在请求中，跳过重复调用');
      return;
    }
    
    state.loadStatus = 'loading';
    const envDeptId = import.meta.env.VITE_SHOPRO_DEPT_ID || import.meta.env.SHOPRO_DEPT_ID || '200';
    const res = await sheep.$api.goods.list({
      category_id: id,
      list_rows,
      page,
      dept_id: envDeptId, // 显式注入部门ID
    });
    
    console.log('📦 [分类商品列表] category_id:', id, 'dept_id:', envDeptId, 'result:', res);
    
    if (res) {
      // 兼容处理：后端返回的是 Spring Data Page 格式（res.content），不是 res.data.data
      const rawList = res.content || (res.data ? res.data.data : []);
      
      console.log('🔍 [字段适配] content:', res.content?.length, 'rawList:', rawList?.length);
      
      // 重要：字段映射 - 后端返回 pic/name，前端组件期待 image/title
      const actualList = rawList.map(item => ({
        ...item,
        image: item.pic || item.image, // 核心修复：组件找的是 image
        title: item.name || item.title, // 核心修复：组件找的是 title
        price: item.price || [item.minPrice, item.maxPrice] // 价格兼容处理
      }));
      
      console.log('🔄 [字段映射] 示例数据:', actualList[0]);
      
      // 如果是第一页，直接赋值；如果是加载更多，则合并
      state.pagination.data = page === 1 ? actualList : _.concat(state.pagination.data, actualList);
      
      // 同步更新分页元数据（适配 Spring Data Page 字段）
      state.pagination.total = res.totalElements || res.total || 0;
      state.pagination.current_page = res.number !== undefined ? res.number + 1 : (res.current_page || page);
      state.pagination.last_page = res.totalPages || res.last_page || 1;
      
      console.log('✅ [分页状态] data.length:', state.pagination.data.length, 
                  'current:', state.pagination.current_page, 
                  'last:', state.pagination.last_page);
      
      // 更新加载状态
      if (state.pagination.current_page >= state.pagination.last_page) {
        state.loadStatus = 'noMore';
      } else {
        state.loadStatus = 'more';
      }
    } else {
      console.error('❌ [商品列表] 响应为空');
      state.loadStatus = ''; // 失败时重置状态，允许重试
    }
  }
  // 加载更多
  function loadmore() {
    // 如果已到最后一页或正在加载，则不触发
    if (state.loadStatus === 'noMore' || state.loadStatus === 'loading') {
      return;
    }
    
    // 防抖：300ms内多次触发只执行一次
    clearTimeout(loadmoreTimer);
    loadmoreTimer = setTimeout(() => {
      console.log('📄 [自动加载] 触发下一页，当前页:', state.pagination.current_page);
      getGoodsList(
        state.categoryList.children[state.activeMenu].id,
        state.pagination.current_page + 1,
      );
    }, 300);
  }
  
  onLoad(async (options) => {
    await getList(options);
    
    // 只有在确定分类列表有内容且没有正在请求商品时，才初始化第一项
    if (state.categoryList?.children?.length > 0) {
      if (state.categoryList.style === 'first_one' || state.categoryList.style === 'first_two') {
        // 确保只初始化一次，防止重复触发
        if (state.pagination.data.length === 0) {
          console.log('🚀 [初始化] 加载第一个分类的商品:', state.categoryList.children[0].id);
          getGoodsList(state.categoryList.children[0].id);
        }
      }
    }
  });
  
  onReachBottom(() => {
    loadmore();
  });
</script>

<style lang="scss" scoped>
  .s-category {
    :deep() {
      .side-menu-wrap {
        width: 200rpx;
        height: 100%;
        padding-left: 12rpx;
        background-color: #f6f6f6;

        .menu-item {
          width: 100%;
          height: 88rpx;
          position: relative;
          transition: all linear 0.2s;

          .menu-title {
            line-height: 32rpx;
            font-size: 30rpx;
            font-weight: 400;
            color: #333;
            margin-left: 28rpx;
            position: relative;
            z-index: 0;

            &::before {
              content: '';
              width: 64rpx;
              height: 12rpx;
              background: linear-gradient(
                90deg,
                var(--ui-BG-Main-gradient),
                var(--ui-BG-Main-light)
              ) !important;
              position: absolute;
              left: -64rpx;
              bottom: 0;
              z-index: -1;
              transition: all linear 0.2s;
            }
          }

          &.menu-item-active {
            background-color: #fff;
            border-radius: 20rpx 0 0 20rpx;

            &::before {
              content: '';
              position: absolute;
              right: 0;
              bottom: -20rpx;
              width: 20rpx;
              height: 20rpx;
              background: radial-gradient(circle at 0 100%, transparent 20rpx, #fff 0);
            }

            &::after {
              content: '';
              position: absolute;
              top: -20rpx;
              right: 0;
              width: 20rpx;
              height: 20rpx;
              background: radial-gradient(circle at 0% 0%, transparent 20rpx, #fff 0);
            }

            .menu-title {
              font-weight: 600;

              &::before {
                left: 0;
              }
            }
          }
        }
      }

      .goods-list-box {
        background-color: #fff;
        width: calc(100vw - 100px);
        padding: 10px;
      }

      .banner-img {
        width: calc(100vw - 130px);
        border-radius: 5px;
        margin-bottom: 20rpx;
      }
    }
  }
</style>
