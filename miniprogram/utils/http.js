import WxRequest from './request'
import {toast, modal} from './extendApi';
import env from './env'

// 实例化方法==============================================
// 在实例化的时候传入参数
const instance = new WxRequest({
	baseUrl: env.baseUrl,  //请求基准地址
	timeOut: 10000 
});

// 在此处配置之后，这里的代码将会覆盖原class里的默认拦截器================
// 配置请求拦截器
instance.interceptors.request = (config) => {
	// 发送请求前做点什么

	// 再发送请求前，需要判断本地是否存在访问令牌Token
	// 如果存在，就需要在请求头中添加 Token 字段
	const token = wx.getStorageSync('token')
	if (token) {
		config.header['token'] = token;
	}

	return config
}

// 配置响应拦截器
instance.interceptors.response = async (response) => {
	// 对服务器相应的数据做点什么、
	const {data, statusCode} = response;

	if (statusCode !== 200) {
		wx.showToast({
			title: '网络异常请重试',
			icon: 'error'
		})
	}

	// 判断服务器响应的业务状态码
	switch (data.code) {
		case 200:
			return data
		// code 为208时表示没有token或者token失效，需要让用户重新登陆
		case 208:
			const res = await modal({
				content: '鉴权失败，请重新登陆',
				showCancel: false
			})
			// 当用户点击了确认后
			if (res) {
				// 清除所有token
				wx.clearStorageSync()
				// 跳转到登录页面
				wx.navigateTo({
					url: "/pages/login/login",
				})
			}
			return Promise.reject(response)

		default:
			toast({
				title: '程序出现异常，请联系客服或稍后尝试'
			})
			return Promise.reject(response)
	}

}


export default instance;