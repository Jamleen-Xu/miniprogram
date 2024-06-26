// pages/goods/detail/index.js
import { reqGoodsInfo } from '@/api/goods';
import { userBehavior } from '@/behavior/userBehavior'
import { reqAddCart, reqCartList } from '@/api/cart'

Page({
  // 页面的初始数据
  behaviors: [userBehavior],
  data: {
    goodsInfo: {}, // 商品详情
    show: false, // 控制加入购物车和立即购买弹框的显示
    count: 1, // 商品购买数量，默认是 1
    blessing: '', // 祝福语
    buyNow: '', // 判断用户点击的是购物车还是立即购买, 0 -> 加入购物车， 1->立即购买
    allCount: '', // 显示购物车数量
  },

  // 加入购物车
  handleAddcart() {
    this.setData({
      show: true,
      buyNow: 0
    })
  },

  // 立即购买
  handeGotoBuy() {
    this.setData({
      show: true,
      buyNow: 1
    })
  },

  // 点击关闭弹框时触发的回调
  onClose() {
    this.setData({ show: false })
  },

  // 监听是否更改了购买数量
  onChangeGoodsCount(event) {
    this.setData({
      count: Number(event.detail)
    })
  },

  // 弹窗的确定按钮
  async handleSubmit() {
    const { token, count, blessing, buyNow } = this.data;
    const goodsId = this.goodsId;

    // 如果没有token，就让用户重新登陆
    if (!token) {
      wx.navigateTo({
        url: 'pages/login/login',
      });
      return;
    }

    // 区分处理加入购物车、立即购买
    // buyNow 为0时->加入购物车 ，为 1 时 -> 立即购买
    if (buyNow === 0) {
      // 新增购物车请求
      const res = await reqAddCart({ goodsId, count, blessing });
      console.log(res)
      if (res.code === 200) {
        wx.showToast({ title: '添加到购物车成功！' })
        this.getCartCount();
      }
      this.setData({ show: false })
    } else {
      // 转跳到支付页面
      wx.navigateTo({
        url: `/modules/orderpayModules/pages/order/detail/detail?goodsId=${goodsId}&blessing=${blessing}`,
      })
    }

  },

  async getCartCount() {
    // 使用 token 来判断用户是否进行了登陆，如果没有token，即没有登陆，不执行后续步骤
    if (!this.data.token) return;

    // 如果登录了，发送请求获取购物车列表的数据
    const res = await reqCartList();
    // 判断购物车中是否有商品
    if (res.data.length !== 0) {
      // 累积得出的商品购买数量
      let allCount = 0;

      res.data.forEach(item => {
        allCount += item.count
      })

      this.setData({
        // info 要求的属性是 字符串类型，且购买数量大于 99 页面上显示 99+
        allCount: (allCount > 99 ? '99+' : allCount) + ''
      })
    }
  },

  // 获取商品详情信息
  async getGoodsInfo(goodsId) {
    const { data } = await reqGoodsInfo(goodsId)
    this.setData({
      goodsInfo: data
    })
  },

  // 商品图片放大
  previewImg() {
    wx.previewImage({
      urls: this.data.goodsInfo.detailList,
    })
  },

  // 加入购物车、立即购买弹窗的 input 事件
  onTextAreaChange() { },

  // 生命周期函数
  onLoad(options) {
    const id = options.goodsId
    this.goodsId = options.goodsId;

    this.getGoodsInfo(id)
    this.getCartCount();
  },

  // 转发功能，转发给好友，群聊
  onShareAppMessage() {
    return {
      title: '所有的怦然心动，都是你',
      path: '/pages/index/index', // 别人点击后，跳到哪个路径
      imageUrl: '../../../../../assets/images/love.jpg',  //分享的图片信息
    }
  },

  // 小程序分享到朋友圈
  onShareTimeline() { },
})
