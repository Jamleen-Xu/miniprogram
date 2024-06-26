import { profileBehavior } from './behavior'
import { reqUpdateUserInfo } from '../../../../api/user'

Page({
  // 页面的初始数据
  data: {
    isShowPopup: false // 控制更新用户昵称的弹框显示与否
  },

  behaviors: [profileBehavior],

  // 更新用户信息
  async updateUserInfo() {
    const res = await reqUpdateUserInfo(this.data.userInfo)

    if (res.code === 200) {
      wx.setStorageSync('userInfo', this.data.userInfo)
      this.setUserInfo(this.data.userInfo)
      console.log(res);

      wx.showToast({
        title: '头像更新成功',
        icon: 'none'
      })
    }
  },

  // 更新用户头像
  async chooseAvatar(event) {
    const { avatarUrl } = event.detail;

    wx.uploadFile({
      filePath: avatarUrl,
      name: 'file',
      url: 'https://gmall-prod.atguigu.cn/mall-api/fileUpload',
      header: {
        token: wx.getStorageSync('token')
      },
      success: (res) => {
        // 将获取到的头像赋值给 data 中变量同步
        const uploadRes = JSON.parse(res.data)
        this.setData({
          'userInfo.headimgurl': uploadRes.data
        })
      },
      fail(err) {
        wx.showToast({
          title: '头像获取失败，请稍后尝试',
          icon: 'none'
        })
      }
    })


  },

  // 姓名修改的表单提交事件
  saveNewUserInfo(event) {
    const { nickname } = event.detail.value;
    // 更新对应的用户名
    this.setData({
      'userInfo.nickname': nickname,
      isShowPopup: false
    })
  },

  // 显示修改昵称弹框
  onUpdateNickName() {
    this.setData({
      isShowPopup: true,
      // 点击取消修改按钮后重新赋值给表单value
      'userInfo.nickname': this.data.userInfo.nickname,
    })
  },

  // 弹框取消按钮
  cancelForm() {
    this.setData({
      isShowPopup: false
    })
  }
})
