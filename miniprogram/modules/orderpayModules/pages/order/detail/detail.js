import { reqOrderInfo, reqOrderAddress, reqBuyNowGoods, reqSubmitOrder, reqPrepayInfo, reqPayStatus } from '@/api/orderpay';
import { formatTime } from '@/utils/formatTime';
import Schema from 'async-validator';
// 导入防抖函数
import { debounce } from 'miniprogram-licia'
// 获取app实例
const app = getApp()

Page({
  data: {
    buyName: '', // 订购人姓名
    buyPhone: '', // 订购人手机号
    deliveryDate: '选择送达日期', // 期望送达日期
    blessing: '', // 祝福语
    show: false, // 期望送达日期弹框
    minDate: new Date().getTime(),
    currentDate: new Date().getTime(),
    orderAddress: {},  // 收货地址
    orderInfo: {},  // 订单详情
  },

  // 选择期望送达日期
  onShowDateTimerPopUp() {
    this.setData({
      show: true,
    })
  },

  // 期望送达日期确定按钮
  onConfirmTimerPicker(event) {
    // event.detail 为送达时间，为数字时间戳

    const time = formatTime(new Date(event.detail))
    this.setData({
      show: false,
      deliveryDate: time
    })
  },

  // 期望送达日期取消按钮 以及 关闭弹框时触发
  onCancelTimePicker() {
    this.setData({
      show: false,
      minDate: new Date().getTime(),
      currentDate: new Date().getTime()
    })
  },

  // 跳转到收货地址
  toAddress() {
    wx.navigateTo({
      url: '/modules/settingModule/pages/address/list/index'
    })
  },

  // 获取页面订单收货地址
  async getAddress() {

    // 判断全局共享的address中有没有数据
    // 如果存在数据，就需要从全局共享的数据中取到该数据
    const addressId = app.globalData.address.id

    if (addressId) {
      this.setData({
        orderAddress: app.globalData.address
      })
      return;
    }

    // 如果没有全局共享的address数据，就需要发送请求调用接口地址数据进行喧嚷
    const { data: orderAddress } = await reqOrderAddress();

    this.setData({ orderAddress })
  },

  // 获取订单详情
  async getOrderInfo() {

    const { goodsId, blessing } = this.data;

    const { data } = goodsId ? await reqBuyNowGoods({ goodsId, blessing }) : await reqOrderInfo();

    const goodsInfo = data.cartVoList.find(item => item.blessing !== '');

    this.setData({
      blessing: goodsInfo ? goodsInfo.blessing : this.blessing,
      orderInfo: data
    })
  },

  // 处理提交订单
  submitOrder: debounce(async function() {
    // 从data中解构数据
    const {
      buyName,
      buyPhone,
      deliveryDate,
      blessing,
      orderAddress,
      orderInfo,
    } = this.data;

    // 根据请求接口要求组织参数
    const params = {
      buyName,
      buyPhone,
      deliveryDate,
      remarks: blessing,
      cartList: orderInfo.cartVoList,
      userAddressId: orderAddress.id,
    }

    const { valid } = await this.validatorAddress(params)

    // 如果验证失败，不执行后续逻辑
    if (!valid) return;

    // 成功则执行支付逻辑， 1、创建平台订单
    const res = await reqSubmitOrder(params)

    if (res.code === 200) {
      // 平台订单创建成功后，需要将服务器、后端返回的订单编号挂载到页面实例上
      this.orderNo = res.data;

      // 获取预付信息，支付参数
      this.advancePay();
    }
  }, 500),

  // 获取预付信息，支付参数
  async advancePay() {
    try {
      const res = await reqPrepayInfo(this.orderNo);
      if (res.code === 200) {
        // 发起微信支付
        const payInfo = await wx.requestPayment(res.data);

        // 查询支付结果
        if (payInfo.errMsg === 'requestPayment:ok') {
          // 查询支付状态
          const payStatus = reqPayStatus(this.orderNo)

          if (payStatus.code === 200) {
            wx.redirectTo({
              url: '/modules/orderPayModules/pages/order/list/list',
              success: () => {
                wx.showToast({title: '支付成功',icon: 'success'})
              }
            })
          }
        }
      }
    } catch {
      wx.showToast({ title: '支付失败', icon: 'error' })
    }

  },

  // 检验函数
  validatorAddress(params) {
    // 验证收货人，是否只包含大小写字母、数字和中文字符
    const nameRegExp = '^[a-zA-Z\\d\\u4e00-\\u9fa5]+$';
    // 验证手机号，是否符合中国大陆手机号格式
    const phoneReg = '^1(?:3\\d|4[4-9]|5[0-35-9]|6[67]|7[0-8]|8\\d|9\\d)\\d{8}$';

    // 创建验证规则
    const rules = {
      userAddressId: [{ required: true, message: '请选择收货地址' }],
      buyName: [
        { required: true, message: '请输入订购人姓名' },
        { pattern: nameRegExp, message: '姓名不合法' }
      ],
      buyPhone: [
        { required: true, message: '请输入订购人号码' },
        { pattern: phoneReg, message: '手机号码不合法' }
      ],
      deliveryDate: { required: true, message: '请选择送达时间' },
    }

    // 实例化
    const validator = new Schema(rules);

    // 调用实例方法对请求参数进行验证
    // 我们希望返回的验证结果通过 promise 的形式返回给函数的调用者
    return new Promise((resolve) => {
      validator.validate(params, (error) => {
        // 如果验证失败，需要给用户进行提示
        if (error) {
          wx.showToast({ title: error[0].message, icon: 'none' })
          // 如果属性值是false，说明验证失败
          resolve({ valid: false })
        } else {
          // 如果属性值是 true， 说明验证成功
          resolve({ valid: true })
        }
      })
    })
  },

  // 生命周期函数
  onLoad(options) {
    this.setData({
      ...options,   // 没有就添加新属性，有就覆盖原来的属性
    })
  },

  // 页面展示的时候触发
  onShow() {
    this.getAddress();
    this.getOrderInfo();
  },
  onUnload() {
    // 页面销毁后，需要重置 全局共享的 address 地址
    // 当用户重新进入该页面，需要重接口获取默认地址进行渲染
    app.globalData.address = {}
  }
})
