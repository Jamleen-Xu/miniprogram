// pages/goods/list/index.js
import { reqGoodsList } from '../../../../../api/goods'

Page({
  /**
   * 页面的初始数据
   */
  data: {
    goodsList: [], // 商品列表数据
    total: 0,  // 数据总条数
    isFinish: false, // 判断数据是否加载完毕
    isLoading: false,  // 节流，判断数据是否加载完毕，发送请求前改为true，请求发送后，改为false

    // 定义商品列表的请求参数
    requestData: {
      page: 1,  //当前页码
      limit: 10, //每一页请求的条数
      category1Id: '',  // 一级分类id
      category2Id: '', // 二级分类id
    }
  },

  // 获取商品列表
  async getGoodsList() {
    // 节流设置，数据正在请求中
    this.data.isLoading = true; 

    const { data } = await reqGoodsList(this.data.requestData);

    // 数据请求完毕,
    this.data.isLoading = false;

    this.setData({
      goodsList: [...this.data.goodsList, ...data.records],
      total: data.total,
    })
  },

  // 上拉刷新
  onReachBottom() {
    let { total,  requestData, goodsList, isLoading } = this.data
    const { page } =  requestData

    // 如果请求数据没有加载完成，即 isLoading 为true时，停止以下程序，不发送新的请求
    if (isLoading) return;

    // 判断数据是否加载完成
    if (total === goodsList.length) {
      this.setData({ isFinish: true })
      return;   // 停止下面程序执行
    }

    // 页码 + 1
    this.setData({
      requestData: { ...this.data.requestData, page: page + 1 }
    });
    // 从新发送请求
    this.getGoodsList();
  },

  // 下拉刷新
  onPullDownRefresh() {
    // 将所有数据进行重置
    this.setData({
      goodsList: [],
      total: 0,
      isFinish: false,
      requestData: { ...this.data.requestData, page: 1 }
    });

    // 重新获取列表数据
    this.getGoodsList();
  },

  // 返回上一个页面
  gotoBack() {
    wx.navigateBack();
  },

  onLoad(options) {
    // 合并对象，后面对象的属性会往前进行覆盖
    Object.assign(this.data.requestData, options);
    this.getGoodsList();
  },

  	// 转发功能，转发给好友，群聊
	onShareAppMessage(){},

	// 小程序分享到朋友圈
	onShareTimeline() {},

})
