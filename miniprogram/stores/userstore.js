import { observable, action } from 'mobx-miniprogram'

export const userStore = observable({
	// 创建可观察状态 token
	token: wx.getStorageSync('token') || '',
	// 用户信息
	userInfo: wx.getStorageSync('userInfo') || {},

	// 修改状态的方法
	setToken: action(function (token) {
		this.token = token
	}),

	setUserInfo: action(function (userInfo) {
		this.userInfo = userInfo
	})
})