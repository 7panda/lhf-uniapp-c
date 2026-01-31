<template>
	<view>
		<s-layout title="首页" navbar="custom" tabbar="/pages/index/index" :navbarStyle="template.style?.navbar"
			onShareAppMessage>
			<!--轮播图 -->
				 <view class="banner-content" v-if="bannerList.length">
					 <swiper class="swiper-content" :indicator-dots="bannerIndicatorDots" :autoplay="true">
						 <swiper-item v-for="it in bannerList" :key="it.id" @tap="clickBanner(it)">
							 <image :src="it.src" class="img"/>
						 </swiper-item>
					 </swiper>
				 </view>

			<!-- 分类 -->
			<template v-if="false">
				<view class="category-content">
					<view class="category-item" v-for="it in categoryList" :key="it.id"
						@tap="sheep.$router.go('/pages/goods/list', { categoryId: it.id })">
						<image :src="it.icon" class="ct-icon" />
						<view class="ct-text">{{it.name}}</view>
					</view>
				</view>
			</template>

			<!-- 广告模块 -->
			<!--      <s-popup-image />-->
			<!--      <view class="icon-text">-->
			<!--        <view class="text-info">-->
			<!--          <view class="left"></view>-->
			<!--          <view class="center">-->
			<!--            推荐商品-->
			<!--          </view>-->
			<!--          <view class="right"></view>-->
			<!--        </view>-->
			<!--      </view>-->
			<view class="goods-block">
				<s-goods-card :data="goodsCard.data" :styles="goodsCard.style" @goodsLoaded="onGoodsLoaded" />
			</view>
		</s-layout>
	</view>
</template>

<script setup>
	import {
		computed,
		ref
	} from 'vue';
	import {
		onLoad,
		onPageScroll,
		onPullDownRefresh,
		onReachBottom,
		onShareAppMessage
	} from '@dcloudio/uni-app';
	import sheep from '@/sheep';
	// 单独引入banner接口（可选，若sheep.$api.banner已自动挂载可省略）
	import $share from '@/sheep/platform/share';
	//#ifdef H5
	import weixin from '@/sheep/libs/sdk-h5-weixin';
// import { sys } from '@/src/sheep/helper';
import { sys } from '@/sheep/helper';

	//#endif
	const categoryList = ref([])
	const shareData = ref($share.getShareInfo())
	// 新增：轮播图数据（直接复用商品列表内容）
	const bannerData = ref([])
	const goodsCard = {
		"data": {
			"mode": 2,
			"goodsFields": {
				"title": { "show": 1 },
				"subtitle": { "show": 1 },
				"price": { "show": 1 },
				"original_price": { "show": 1 },
				"sales": { "show": 1 },
				"stock": { "show": 0 }
			},
			"buyNowStyle": {},
			"tagStyle": { "show": 0, "src": "" },
			params: { orderField: 'sort', orderSort: 'asc' },
			"borderRadiusTop": 6,
			"borderRadiusBottom": 6,
			"space": 8
		},
		"style": {
			"background": { "type": "color", "bgImage": "", "bgColor": "" },
			"marginLeft": 8,
			"marginRight": 8,
			"marginTop": 0,
			"marginBottom": 10,
			"borderRadiusTop": 0,
			"borderRadiusBottom": 0,
			"padding": 0
		}
	};

	// 隐藏原生tabBar
	uni.hideTabBar();

	const template = computed(() => sheep.$store('app').template.home);
	// 轮播图指示点
	const bannerIndicatorDots = computed(() => bannerData.value.length > 1)
	// 轮播图数据适配
	const bannerList = computed(() => {
		// 只用pic和id，其他字段不需要
		return bannerData.value.map((item, index) => ({
			id: item.id ?? `${index}`,
			src: sheep.$url.cdn(item.pic),
			title: item.title || item.name || '',
		}))
	})
const barHeight = ref(0)
	onLoad((options) => {
    const statusBarHeight = sheep.$platform.device.statusBarHeight;
    barHeight.value = (statusBarHeight + 54)+'px'
		// #ifdef MP
		// 小程序识别二维码
		if (options.scene) {
			const sceneParams = decodeURIComponent(options.scene).split('=');
			options[sceneParams[0]] = sceneParams[1];
		}
		// #endif

		// 预览模板
		if (options.templateId) {
			sheep.$store('app').init(options.templateId);
		}

		// 解析分享信息
		if (options.spm) {
			$share.decryptSpm(options.spm);
		}

		// 进入指定页面(完整页面路径)
		if (options.page) {
			sheep.$router.go(decodeURIComponent(options.page));
		}
		refreshShareData()
		getCategoryList()
		// getList()
		//#ifdef H5
		setOpenShare()
		//#endif
	});
	// 商品卡片组件回调，接收商品数据并筛选轮播图内容
	function onGoodsLoaded(goods) {
		console.log('GOODS:', goods);
		// 只保留pic不为null的商品，最多5个
		bannerData.value = (goods || []).filter(item => item.pic).slice(0, 5);
		console.log('BANNERDATA:', bannerData.value);
	}
	onShareAppMessage((res) => {
		return {
			...shareData.value
		}
	});
	// 下拉刷新
	onPullDownRefresh(() => {
		sheep.$store('app').init();
		setTimeout(function() {
			uni.stopPullDownRefresh();
		}, 800);
	});
	// 上拉加载更多
	onReachBottom(() => {
		// 该事件必须申明,子组件才会触发该事件
	})
	onPageScroll(() => {});
	//#ifdef H5
	// 微信h5分享；
	function setOpenShare() {
		weixin.updateShareInfo(shareData.value);
	}
	//#endif

	function refreshShareData() {
		shareData.value = $share.getShareInfo();
	}

	function clickBanner(item) {
		if (!item || !item.id) return;
		// 跳转到商品详情页，传递id
		sheep.$router.go('/pages/goods/index', { id: item.id });
	}
	// 获取商品分类
	function getCategoryList() {
		sheep.$api.category.list().then(res => {
			categoryList.value = res
		})
	}
</script>

<style lang="scss" scoped>
	.goods-block {
    /* #ifdef MP-WEIXIN */
		margin: v-bind(barHeight) 20rpx 10rpx 20rpx;
    /* #endif */

    /* #ifdef H5 */
    margin: 90rpx 20rpx 10rpx 20rpx;
    /* #endif */
	}

	.icon-text {
		display: flex;
		justify-content: center;
		margin-bottom: 24rpx;

		.text-info {
			display: flex;
			align-items: center;
			width: 440rpx;

			.left {
				width: 108rpx;
				height: 2rpx;
				background: #D8D8D8;
			}

			.center {
				width: 128rpx;
				height: 44rpx;
				font-size: 32rpx;
				font-family: PingFangSC-Medium, PingFang SC;
				font-weight: 500;
				color: #333333;
				line-height: 44rpx;
				margin-left: 48rpx;
				margin-right: 48rpx;
			}

			.right {
				width: 108 rpx;
				height: 2 rpx;
				background: #D8D8D8;
			}
		}
	}

	.category-content {
		margin-left: 40rpx;
		margin-right: 40rpx;
		display: grid;
		grid-template-columns: auto auto auto 112rpx;

		//grid-column-gap: v-bind(ml);
		.category-item {
			width: 112rpx;
			margin-bottom: 48rpx;


			.ct-icon {
				width: 88rpx;
				height: 88rpx;
				padding-left: 12rpx;
			}

			.ct-text {
				margin-top: 16rpx;
			}
		}

	}

/* 轮播图样式优化 */
.banner-content {
	display: flex;
	justify-content: center;
	align-items: center;
	width: 100%;
	margin: 60rpx 0 24rpx 0;
	background: linear-gradient(135deg, #f8fafc 0%, #e8ecf3 100%);
	border-radius: 20rpx;
	box-shadow: 0 8rpx 32rpx rgba(0,0,0,0.04);
}
.swiper-content {
	// min-width: 200rpx;
	width: 90%;
	max-width: 100%;
	height: 300rpx;
	border-radius: 16rpx;
	overflow: hidden;
	background: #fff;
	box-shadow: 0 4rpx 24rpx rgba(0,0,0,0.06);
	display: flex;
	align-items: center;
	justify-content: center;
}
.img {
	height: 300rpx;
	width: 100%;
	max-width: 100%;
	object-fit: cover;
	display: block;
	margin-left: auto;
	margin-right: auto;
	background: linear-gradient(135deg, #f5f5f5 60%, #e3e8ee 100%);
	border-radius: 16rpx;
	box-shadow: 0 4rpx 24rpx rgba(0,0,0,0.08);
	transition: box-shadow 0.3s, transform 0.3s;
	/* 悬浮时略微放大和加深阴影 */
}
.img:active {
	transform: scale(0.97);
	box-shadow: 0 8rpx 32rpx rgba(0,0,0,0.12);
}
/* 图片加载过渡动画 */
.img {
	opacity: 0;
	animation: imgFadeIn 0.6s ease-in forwards;
}
@keyframes imgFadeIn {
	from { opacity: 0; }
	to { opacity: 1; }
}
</style>
