<template>
  <s-layout class="set-wrap" title="搜索" :bgStyle="{ color: '#FFF' }">
    <view class="ss-p-x-24">
      <view class="ss-flex ss-col-center">
        <uni-search-bar
          class="ss-flex-1"
          radius="33"
          placeholder="请输入关键字"
          cancelButton="none"
          :focus="true"
          :value="state.keyword"
          @input="onInput"
          @clear="onClear"
          @confirm="onSearch($event.value)"
        />
      </view>
      <view v-if="matchedItems.length" class="match-section">
        <view class="match-title">相关商品</view>
        <view class="match-list ss-flex ss-flex-wrap">
          <view
            class="match-item"
            v-for="item in matchedItems"
            :key="item.id"
            @tap="goDetail(item.id)"
          >
            <image class="match-img" :src="formatImg(item.pic)" mode="aspectFill" />
            <view class="match-name ss-line-1">{{ item.name }}</view>
          </view>
        </view>
      </view>
      <view class="ss-flex ss-row-between ss-col-center">
        <view class="serach-history">搜索历史</view>
        <button class="clean-history ss-reset-button" @tap="onDelete"> 清除搜索历史 </button>
      </view>
      <view class="history-list">
        <view class="history-card" v-for="item in displayHistory" :key="item.keyword">
          <view class="history-card-header ss-flex ss-row-between ss-col-center">
            <view class="history-keyword" @tap="onSearch(item.keyword)">
              {{ item.keyword }}
            </view>
            <button class="history-search-btn ss-reset-button" @tap="onSearch(item.keyword)">
              搜索
            </button>
          </view>
          <view v-if="item.items && item.items.length" class="history-products">
            <view
              class="history-product"
              v-for="goods in item.items"
              :key="goods.id"
              @tap="goDetail(goods.id)"
            >
              <image class="history-product-img" :src="formatImg(goods.pic)" mode="aspectFill" />
              <view class="history-product-name ss-line-1">{{ goods.name }}</view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </s-layout>
</template>

<script setup>
  import { computed, reactive } from 'vue';
  import sheep from '@/sheep';
  import { onLoad } from '@dcloudio/uni-app';
  const SEARCH_HISTORY_KEY = 'searchHistory';
  const SEARCH_HISTORY_LIMIT = 10;
  const state = reactive({
    historyList: [],
    keyword: '',
  });

  const displayHistory = computed(() => {
    const keyword = String(state.keyword || '').trim();
    if (!keyword) return state.historyList;
    return state.historyList.filter((item) => item.keyword.includes(keyword));
  });

  const matchedItems = computed(() => {
    const keyword = String(state.keyword || '').trim();
    if (!keyword) return [];
    const map = new Map();
    displayHistory.value.forEach((item) => {
      (item.items || []).forEach((goods) => {
        if (!goods || !goods.id) return;
        const name = String(goods.name || '');
        if (name.includes(keyword) && !map.has(goods.id)) {
          map.set(goods.id, goods);
        }
      });
    });
    return Array.from(map.values()).slice(0, 6);
  });

  function normalizeHistoryList(rawList) {
    const list = Array.isArray(rawList) ? rawList : [];
    return list
      .map((item) => {
        if (typeof item === 'string') {
          return {
            keyword: item,
            items: [],
            updatedAt: 0,
          };
        }
        if (!item || !item.keyword) return null;
        return {
          keyword: String(item.keyword).trim(),
          items: Array.isArray(item.items) ? item.items : [],
          updatedAt: item.updatedAt || 0,
        };
      })
      .filter((item) => item && item.keyword);
  }

  function formatImg(src) {
    if (!src) return '';
    return sheep.$url.cdn(src);
  }

  function onInput(value) {
    state.keyword = value;
  }

  function onClear() {
    state.keyword = '';
  }

  // 搜索
  function onSearch(keyword) {
    const safeKeyword = String(keyword || state.keyword || '').trim();
    if (!safeKeyword) return;
    saveSearchHistory(safeKeyword);
    sheep.$router.go('/pages/goods/list', { keyword: safeKeyword });
  }

  function goDetail(id) {
    if (!id) return;
    sheep.$router.go('/pages/goods/index', { id });
  }

  // 保存搜索历史
  function saveSearchHistory(keyword) {
    const safeKeyword = String(keyword || '').trim();
    if (!safeKeyword) return;
    const list = normalizeHistoryList(uni.getStorageSync(SEARCH_HISTORY_KEY) || []);
    const index = list.findIndex((item) => item.keyword === safeKeyword);
    const items = index >= 0 ? list[index].items || [] : [];
    if (index >= 0) list.splice(index, 1);
    list.unshift({
      keyword: safeKeyword,
      items,
      updatedAt: Date.now(),
    });
    if (list.length > SEARCH_HISTORY_LIMIT) list.length = SEARCH_HISTORY_LIMIT;
    uni.setStorageSync(SEARCH_HISTORY_KEY, list);
    state.historyList = list;
  }

  function onDelete() {
    uni.showModal({
      title: '提示',
      content: '确认清除搜索历史吗？',
      success: function (res) {
        if (res.confirm) {
          state.historyList = [];
          uni.removeStorageSync(SEARCH_HISTORY_KEY);
        }
      },
    });
  }
  onLoad(() => {
    state.historyList = normalizeHistoryList(uni.getStorageSync(SEARCH_HISTORY_KEY) || []);
  });
</script>

<style lang="scss" scoped>
  .serach-title {
    font-size: 30rpx;
    font-weight: 500;
    color: #333333;
  }

  .uni-searchbar {
    padding-left: 0;
  }

  .serach-history {
    font-weight: bold;
    color: #333333;
    font-size: 30rpx;
  }

  .clean-history {
    font-weight: 500;
    color: #999999;
    font-size: 28rpx;
  }

  .history-btn {
    padding: 0 38rpx;
    height: 60rpx;
    background: #f5f6f8;
    border-radius: 30rpx;
    font-size: 28rpx;
    color: #333333;
    max-width: 690rpx;
    margin: 0 20rpx 20rpx 0;
  }

  .match-section {
    margin-top: 20rpx;
  }

  .match-title {
    font-weight: bold;
    color: #333333;
    font-size: 30rpx;
    margin-bottom: 16rpx;
  }

  .match-list {
    gap: 20rpx;
  }

  .match-item {
    width: 210rpx;
    background: #f8f8f8;
    border-radius: 12rpx;
    padding: 12rpx;
  }

  .match-img {
    width: 186rpx;
    height: 186rpx;
    border-radius: 10rpx;
    background: #ffffff;
  }

  .match-name {
    margin-top: 10rpx;
    font-size: 24rpx;
    color: #333333;
  }

  .history-list {
    margin-top: 20rpx;
  }

  .history-card {
    background: #f7f8fa;
    border-radius: 16rpx;
    padding: 20rpx;
    margin-bottom: 20rpx;
  }

  .history-card-header {
    margin-bottom: 16rpx;
  }

  .history-keyword {
    font-size: 30rpx;
    font-weight: 600;
    color: #333333;
  }

  .history-search-btn {
    font-size: 24rpx;
    color: #666666;
    padding: 6rpx 20rpx;
    background: #ffffff;
    border-radius: 24rpx;
  }

  .history-products {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
  }

  .history-product {
    width: 200rpx;
    background: #ffffff;
    border-radius: 12rpx;
    padding: 10rpx;
  }

  .history-product-img {
    width: 180rpx;
    height: 180rpx;
    border-radius: 10rpx;
    background: #ffffff;
  }

  .history-product-name {
    margin-top: 8rpx;
    font-size: 24rpx;
    color: #333333;
  }
</style>
