import http from '../utils/http';


// 实现新增收货地址
export const reqAddAddress = (data) => {
	return http.request({url: '/userAddress/save', data, method: 'POST'})
}

// 获取收货地址列表
export const reqAddressList = () => {
	return http.request({url: '/userAddress/findUserAddress'})
}

// 获取收货地址详情
export const reqAddressInfo = (id) => {
	return http.get(`/userAddress/${id}`)
}

// 编辑收货地址
export const reqUpdateAddress = (data) => {
	// return http.request({url: 'userAddress/uptate', data, method: 'POST'})
	return http.post('/userAddress/update', data)
}

// 删除收货地址
export const reqDelAddress = (id) => {
	// return http.get(`/userAddress/delete/${id}`)
	return http.request({url: `/userAddress/delete/${id}`})
}