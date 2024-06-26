import {reIndexData} from '../../api/index'

Page({

	data: {
		bannerList: [],   // 轮播图数据
		categoryList: [],  // 分类数据
		activeList: [],  // 活动广告
		hotList: [], // 人气推荐
		guessList: [],  // 猜你喜欢
		loading: true
	},

	async getIndexData() {
		const res = await reIndexData();

		// 获取数据后，对数据进行赋值
		this.setData({
			bannerList: res[0].data,
			categoryList: res[1].data,
			activeList: res[2].data,
			hotList: res[3].data,
			guessList: res[4].data,
			loading: false,
		})
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		this.getIndexData();
	},

	// 转发功能，转发给好友，群聊
	onShareAppMessage(){},

	// 小程序分享到朋友圈
	onShareTimeline() {},
})