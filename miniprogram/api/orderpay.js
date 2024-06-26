import http from '../utils/http';

// 获取订单信息
 export const reqOrderInfo = () => {
	 return http.get('/order/trade')
 }

//  获取订单详情页面的收货地址
export const reqOrderAddress = () => {
	return http.get('/userAddress/getOrderAddress')
}

// 获取立即购买商品的详细信息
export const reqBuyNowGoods = ({goodsId, ...data}) => {
	return http.get(`/order/buy/${goodsId}`, data)
}

// 提交订单、进行下单
export const reqSubmitOrder = (data) => {
	return http.post('/order/submitOrder', data)
}

// 获取微信支付预支付信息，参数为订单id
export const reqPrepayInfo = (orderNo) => {
	return http.get(`/webChat/createJsapi/${orderNo}`)
}

// 微信支付转台查询,
export const reqPayStatus = (orderNo) => {
	return http.get(`/webChat/queryPayStatus/${orderNo}`)
}


// 获取订单列表
export const reqOrderList = (page, limit) => {
	return http.get(`/order/order/${page}/${limit}`)
}