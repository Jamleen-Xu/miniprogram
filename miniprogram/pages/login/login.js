import { toast } from '../../utils/extendApi';
import { reqLogin, reqUserInfo } from '../../api/user'
import { userStore } from '../../stores/userstore'

import { ComponentWithStore } from 'mobx-miniprogram-bindings'

// 导入防抖函数
import { debounce } from 'miniprogram-licia'

ComponentWithStore({

	storeBindings: {
		store: userStore,
		fields: ['token', 'userInfo'],
		actions: ['setToken', 'setUserInfo']
	},

	methods: {
		// 授权登录
		login: debounce(async function () {
			// 使用 该方法 获取用户的临时登录凭证
			wx.login({
				success: async ({ code }) => {
					if (code) {
						// 获取到临时登录凭证后
						const { data } = await reqLogin(code)
						wx.setStorageSync('token', data.token)

						// 存储到 store 对象中
						this.setToken(data.token)

						// 获取用户信息
						this.getUserInfo();

						wx.navigateBack();
					} else {
						toast({ title: '授权失败，请重新尝试' })
					}
				},
			})
		}, 500),

		// 获取用户信息
		async getUserInfo() {
			const { data } = await reqUserInfo();

			// 将用户信息存储到本地
			wx.setStorageSync('userInfo', data);
			// 将用户信息存储到 store
			this.setUserInfo(data);
		}
	},

})