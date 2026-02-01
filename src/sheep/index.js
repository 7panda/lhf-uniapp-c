import $url from '@/sheep/url';
import $platform from '@/sheep/platform';
import $helper from '@/sheep/helper';
import zIndex from '@/sheep/config/zIndex.js';

// ---------------------------------------------------------
// 修复核心：显式映射变量名 ($zIndex: zIndex)
// ---------------------------------------------------------
const sheep = {
  $url,
  $platform,
  $helper,
  $zIndex: zIndex, // ✅ 必须这样写，因为引入的变量名是 zIndex
};

// 加载Shopro底层依赖
export async function ShoproInit() {
  console.log('Shopro Init - Chat Client Mode');
  
  // 平台初始化
  $platform.load();
}

export default sheep;