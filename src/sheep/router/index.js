import $store from '@/sheep/store';
import { isString, isEmpty, startsWith, isObject, isNil } from 'lodash';
import throttle from '@/sheep/helper/throttle';

// 1. 手动定义底部导航栏路径 (根据你的 pages.json)
const TABBAR = [
  '/pages/index/index',
  '/pages/index/category',
  '/pages/index/cart',
  '/pages/user/user', // 注意：Shopro 通常是 /pages/user/index 或 /pages/user/user，请核对
  '/pages/chat/index', // 如果你把聊天也放到底部导航的话
];

// 2. 需要强制登录的路径前缀
const AUTH_required = ['/pages/user/', '/pages/order/', '/pages/pay/'];

const _go = (
  path,
  params = {},
  options = {
    redirect: false,
  },
) => {
  let page = ''; // 跳转页面
  let query = ''; // 页面参数
  let url = ''; // 跳转页面完整路径

  // --- 参数解析逻辑 (保持不变) ---
  if (isString(path)) {
    if (startsWith(path, 'http')) {
      // #ifdef H5
      window.location = path;
      return;
      // #endif
      // #ifndef H5
      page = `/pages/public/webview`;
      query = `url=${encodeURIComponent(path)}`;
      // #endif
    } else {
      [page, query] = path.split('?');
    }
    if (!isEmpty(params)) {
      let query2 = paramsToQuery(params);
      query = isEmpty(query) ? query2 : query + '&' + query2;
    }
  }

  if (isObject(path)) {
    page = path.url;
    if (!isNil(path.params)) {
      query = paramsToQuery(path.params);
    }
  }

  // --- 路径标准化 ---
  // 确保路径以 / 开头，防止匹配失败
  if (page && !page.startsWith('/')) {
    page = '/' + page;
  }

  // --- 3. 核心鉴权优化 (替代 nextRoute.meta.auth) ---
  // 如果路径包含需要登录的关键词，且用户未登录
  const needLogin = AUTH_required.some(prefix => page.includes(prefix));
  if (needLogin && !$store('user').isLogin) {
    // 直接跳转登录页，避免循环调用 showAuthModal
    uni.navigateTo({ url: '/pages/index/login' });
    return;
  }

  url = page;
  if (!isEmpty(query)) {
    url += `?${query}`;
  }

  // --- 4. 跳转逻辑优化 ---
  
  // 如果是 Tabbar 页面，必须用 switchTab
  if (TABBAR.includes(page)) {
    uni.switchTab({ url });
    return;
  }

  // 使用 redirect 跳转
  if (options.redirect) {
    uni.redirectTo({ url });
    return;
  }

  // 普通跳转 (增加失败重试，防止 TABBAR 配置漏网之鱼)
  uni.navigateTo({
    url,
    fail: (err) => {
      // 如果报错是因为跳转到了 Tabbar 页面，尝试切换 tab
      if (err.errMsg && err.errMsg.includes('tabbar')) {
        uni.switchTab({ url });
      } else {
        console.error('路由跳转失败:', err);
      }
    }
  });
};

// --- 工具函数 (保持不变) ---

function go(...args) {
  throttle(() => {
    _go(...args);
  });
}

function paramsToQuery(params) {
  if (isEmpty(params)) return '';
  let query = [];
  for (let key in params) {
    query.push(key + '=' + params[key]);
  }
  return query.join('&');
}

function back() {
  // #ifdef H5
  history.back();
  // #endif
  // #ifndef H5
  uni.navigateBack();
  // #endif
}

// 导出
export default {
  go,
  back,
};