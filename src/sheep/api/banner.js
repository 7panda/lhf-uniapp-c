// 轮播图相关API
import request from '@/sheep/request'

// 获取首页轮播图列表
export function listBanner(params = {}) {
  // 示例接口路径和参数，可根据实际后端调整
  return request({
    url: '/banner/list',
    method: 'get',
    params
  })
}

export default {
  list: listBanner
}
