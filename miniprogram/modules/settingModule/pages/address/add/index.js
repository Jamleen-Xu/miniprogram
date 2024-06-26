let QQMapWX = require('../../../../../libs/qqmap-wx-jssdk.js');
import Schema from 'async-validator';
import { reqAddAddress, reqAddressInfo, reqUpdateAddress } from '../../../../../api/address'

Page({
  // 页面的初始数据
  data: {
    name: '',
    phone: '',
    provinceName: '',
    provinceCode: '',
    cityName: '',
    cityCode: '',
    districtName: '',
    districtCode: '',
    address: '',
    fullAddress: '',
    isDefault: 0,
  },

  // 保存收货地址
  async saveAddrssForm(event) {
    const { provinceName, cityName, districtName, address, isDefault } = this.data;

    // 拼凑出完整的地址
    const fullAddress = provinceName + cityName + districtName + address;

    // 合并接口请求参数
    const params = {
      ...this.data,
      fullAddress,
      isDefault: isDefault ? 1 : 0
    }

    const { valid } = await this.validatorAddress(params);
    if (!valid) return;

    // 发送请求，保存收货地址，如果有addressId就说明是修改信息，需要进行判断
    const res = this.addressId
      ? await reqUpdateAddress(params)
      : await reqAddAddress(params)

    if (res.code === 200) {
      wx.navigateBack({
        success: () => {
          wx.showToast({ title: this.addressId ? '更新地址成功' : '新增地址成功' })
        }
      })
    }
  },

  // 对组织以后的参数进行验证，验证通过以后，需要调用新增的接口实现功能
  validatorAddress(params) {
    // 验证收货人，是否只包含大小写字母、数字和中文字符
    const nameRegExp = '^[a-zA-Z\\d\\u4e00-\\u9fa5]+$';
    // 验证手机号，是否符合中国大陆手机号格式
    const phoneReg = '^1(?:3\\d|4[4-9]|5[0-35-9]|6[67]|7[0-8]|8\\d|9\\d)\\d{8}$';

    // 创建验证规则
    const rules = {
      name: [
        { required: true, message: '请输入收货人姓名' },
        { pattern: nameRegExp, message: '收货人姓名不合法' }
      ],
      phone: [
        { required: true, message: '请输入收货人号码' },
        { pattern: phoneReg, message: '手机号码不合法' }
      ],
      provinceName: { required: true, message: '请输入省份' },
      address: { required: true, message: '地址不能为空' }
    }

    // 实例化
    const validator = new Schema(rules);

    // 调用实例方法对请求参数进行验证
    // 我们希望返回的验证结果通过 promise 的形式返回给函数的调用者
    return new Promise((resolve) => {
      validator.validate(params, (error) => {
        // 如果验证失败，需要给用户进行提示
        if (error) {
          wx.showToast({ title: error[0].message })
          // 如果属性值是false，说明验证失败
          resolve({ valid: false })
        } else {
          // 如果属性值是 true， 说明验证成功
          resolve({ valid: true })
        }
      })
    })
  },

  // 省市区选择
  onAddressChange(event) {
    const [provinceName, cityName, districtName] = event.detail.value;
    const [provinceCode, cityCode, districtCode] = event.detail.code;

    // 存储省市区对应的编码
    this.setData({
      provinceName,
      provinceCode,
      cityName,
      cityCode,
      districtCode,
      districtName,
    })
  },

  // 地理定位
  async onLocation() {
    // 获取经度纬度进行逆地址解析
    const { latitude, longitude, name } = await wx.chooseLocation();

    // 使用 reverseGeocoder 方法进行逆地址解析
    this.qqmapsdk.reverseGeocoder({
      // 传入经度纬度
      location: {
        latitude,
        longitude
      },

      // 逆地址解析成功后执行
      success: (res) => {
        const {
          adcode,
          city,
          province,
          district,
          nation_code,
          city_code } = res.result.ad_info;

        this.setData({
          // 省级：前面两位有值，后面四位为 0
          provinceCode: adcode.replace(adcode.substring(2, 6), '0000'),
          provinceName: province,

          // 市级，前面讴歌国家代码，需要进行截取
          cityCode: city_code.slice(nation_code.length),
          cityName: city,

          // 有一些市区下无县级，需要进行判断
          districtCode: district && adcode,
          districtName: district,

          // 详细地址
          address: name,
          fullAddress: [province, city, district, name].join('')
        })
      }
    })

  },

  // 处理处理相关更新的逻辑
  async showAddressInfo(id) {
    // 判断是否存在 id ， 不存在，就不执行后续操作
    if (!id) return;

    // 将 id 挂载到当前页面的实例（this）上，方便在多个方法中使用 id
    this.addressId = id;
    // 动态设置当前页面的标题
    wx.setNavigationBarTitle({
      title: '更新收货地址',
    });

    // 获取详情收货地址信息
    const { data } = await reqAddressInfo(id);
    // 将详情数据进行赋值，复制以后，页面上会显示对应的信息
    this.setData(data)
  },

  // 生命周期函数
  onLoad(option) {
    // 实例化 API 核心类
    this.qqmapsdk = new QQMapWX({
      key: 'C4XBZ-YEXC5-RHTIG-I5U2I-LLAGO-TSBDT'
    });

    // 调用更新的函数
    this.showAddressInfo(option.id);
  }
})