// pages/address/list/index.js
import { reqAddressList, reqDelAddress } from '../../../../../api/address';
import {swipeCellBehavior} from '../../../../../behavior/swipeCellBehavior'
const app = getApp();

Page({
  // 页面的初始数据
  data: {
    addressList: [],
  },
  behaviors: [swipeCellBehavior],

  // 去编辑页面
  toEdit(event) {
    const { id } = event.target.dataset;

    wx.navigateTo({
      url: `/modules/settingModule/pages/address/add/index?id=${id}`
    })
  },

  // 删除地址
  async delAddress(event) {
    const { id } = event.currentTarget.dataset;
    const res = await wx.showModal({content: '确定要删除吗？'})

    if (res.confirm) {
      await reqDelAddress(id);
      wx.showToast({title: '删除成功！'})
      // 重新获取收货地址列表
      this.getAddressList();
    }
  },

  // 获取收货地址列表
  async getAddressList() {
    const { data } = await reqAddressList();
    // 重新赋值
    this.setData({
      addressList: data
    })
  },

  // 更新收货地址，从支付页面来
  changeAddress(event) {
    // 先判断是不是从支付页面来
    if (this.flag !== '1') return;

    // 如果是从支付页面来的，需要获取点击的地址的信息
    const addressId = event.currentTarget.dataset.id;

    // 根据该id获取其详细信息
    const selectedAddress = this.data.addressList.find(item => item.id === addressId)

    if (selectedAddress) {
      // 成功获取地址后，需要赋值给全局共享的数据
      app.globalData.address = selectedAddress;

      // 返回支付页面
      wx.navigateBack();
    }
  },

  // 不在 onLoad 中调用，因为onLoad是页面加载时调用的，如果页面没有销毁再回到本页面，将不会调用该生命周期函数
  // 需要再 onShow 生命周期函数中调用请求获取数据，onShow是页面展示时调用
  onShow() {
    this.getAddressList();
  },
  onLoad(options) {
    this.flag = options.flag;
  }
})
