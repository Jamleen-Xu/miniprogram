/**
 * @description 网络请求模块封装
 * 
 */

class WxRequest {
	// 设置默认参数
	defaults = {
		baseUrl: '',  // 请求基准地址
		url: '',   // 开发者服务区接口地址
		data: null,  // 请求参数
		method: 'GET',  // 
		// 请求头
		header:{
			'Content-type': 'application/json'  // 设置数据的交互格式
		},
		timeOut: 60000,
		isLoading: true,   // 设置是否使用 Loading 样式
	}

	// 定义拦截器对象 
	interceptors = {
		// 请求拦截器
		request: (config) => config,
		// 响应拦截器
		response: (response) => response,
	}

	// 定义数组队列，控制Lodding
	queue = [];

	// 实例化传入的参数，会被constructor接收，需要进行 请求参数的合并
	// 要注意：传入的参数要覆盖默认参数，所以传入的参数要放到后面
	constructor(parmas) {
		this.defaults = Object.assign({}, this.defaults, parmas);
	}

	// 接收一个对象，和wx.request传递的参数保持一致
	request(options) {
		// 新的请求发起时，判断是否有上一次的定时器timeId，有就清除
		this.timeId && clearTimeout(timeId);

		// 调用该方法时，会传入相关接口参数，需要进行完整的ulr拼接
		options.url = this.defaults.baseUrl + options.url;
		// 完整参数合并
		options = { ...this.defaults, ...options }
		// 发送请求时，需要调用请求拦截器
		options = this.interceptors.request(options)

				// 在发送请求之前，添加 Loading 效果
		// 如果queue为空，则显示 Loading，不为空，则不显示
		if (options.isLoading && options.method !== 'upload') {
			this.queue.length === 0 && wx.showLoading();
			this.queue.push('request');
		}
		
		// 使用 promise 封装 wx.request，处理异步请求
		return new Promise((resolve,reject) => {
			if (options.method === 'upload') {
				wx.uploadFile({
					...options,
					success: (res) => {
						// 返回的 res 为JSON字符串，需要转化为对象
						res.data = JSON.parse(res.data);
						// 合并参数，使用响应拦截器
						const mergeRes = Object.assign({}, res, {config: options, isSuccess: true})
						resolve(this.interceptors.response(mergeRes));
					},
					fail: (err) => {
						const mergeErr = Object.assign({}, err, {config: options, isSuccess: false})
						reject(this.interceptors.request(mergeErr));
					}
				})
				
			} else {
				wx.request({
					...options,
					success: (res) => {
						// 不管响应是否成功，都需要调用响应拦截器，接收返回的数据进行处理后再返回
						// 再给响应拦截器传参时，也要传递请求参数，进行参数合并，
						// 将合并的参数一起传递给响应拦截器
						const mergeRes = Object.assign({}, res, {config: options, isSuccess: true})
						resolve(this.interceptors.response(mergeRes));
					},
					fail: (err) =>{
						const mergeErr = Object.assign({}, err, {config: options, isSuccess: false})
						reject(this.interceptors.response(mergeErr));
					},
					complete: () => {
						// 无论请求成功与否，都执行该函数
						// 利用setTimeout的异步特性，防止网络请求过快导致 loading 闪烁显示
						// 执行到setTimeout时,其他的请求request也开始执行了,会清除掉上一个的timeId
	
						if (options.isLoading) {
							this.queue.pop();
							this.queue.length === 0 && this.queue.push('request')
	
							let timeId = setTimeout(() => {
								this.queue.pop()  // 负责清除上两三句添加的 request
								this.queue.length === 0 && wx.hideLoading();
								clearTimeout(timeId)
							}, 100)
						}
					}
				})
			}
		})
	}

	// 封装便捷方法，使得发送请求更为方便（需使用request方法）
	get(url, data={}, config={}) {
		return this.request(Object.assign({url, data, method: 'GET'}, config));
	}

	post(url, data = {}, config = {}) {
		return this.request(Object.assign({url, data, method: 'post'}, config))
	}

	// all 方法，处理并发请求，参数是异步任务
	all () {

	}

	// 封装 上传文件 upload 方法
	upload(url, filePath, name="file", config={}) {
		return this.request(Object.assign({url, filePath, name, method: upload}, config));
	}
}

export default WxRequest;
