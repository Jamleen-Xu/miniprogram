// pages/order/list/index.js
import { reqOrderList } from '@/api/orderpay'

Page({
  // 页面的初始数据
  data: {
    orderList: [], // 订单列表
    page: 1,   // 页码
    limit: 10,  // 每页展示的条数
    total: 0,  // 订单总数  
    isLoading: false,
  },

  // 获取商品列表数据，并赋值 this.data
  async getOrderList() {
    // 获取解构数据
    const { page, limit } = this.data;

    // 数据正在请求中
    this.data.isLoading = true;

    // 调用接口
    const res = await reqOrderList(page, limit);
    console.log(res)
    // 数据加载完毕
    this.data.isLoading = false;

    if (res.code === 200) {
      this.setData({
        orderList: [...this.data.orderList, ...res.data.records],
        total: res.data.total,
      })
    }
  },

  // 上拉操作
  onReachBottom() {
    const { page, total, orderList, isLoading } = this.data;

    if (isLoading) return;

    if (total === orderList.length) {
      return wx.showToast({title: '没有更多数据了~', icon: 'none'})
    }
    // 更新page
    this.setData({
      page: page + 1,
    })

    // 重新发送请求
    this.getOrderList();

  },

  onLoad() {
    this.getOrderList();
  }

})
