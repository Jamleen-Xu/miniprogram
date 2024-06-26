import {reqCategoryData} from '../../api/category'

Page({

	data: {
		categoryList: [{}, {}, {}],  // 分类数据列表
		activeIndex: 0
	},

	// 导航分类点击事件
	updateActive(event) {
		this.setData({
			activeIndex: event.target.dataset.index
		})
	},

	async getCategoryData() {
		const res = await reqCategoryData();
		this.setData({
			categoryList: res.data,
		})
	},

	onLoad(options) {
		this.getCategoryData();
	},

})