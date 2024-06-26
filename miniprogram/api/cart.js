import http from '../utils/http';

// 获取购物车列表数据
export const reqCartList = () => {
	return http.get('/cart/getCartList');
}

// 商品详情页面，加入购物车，
export const reqAddCart = ({ goodsId, count, ...data }) => {
	return http.get(`/cart/addToCart/${goodsId}/${count}`, data)
}

// 更新商品的选中状态
// goodsId 商品 id  ； isChecked 商品选中的状态
export const reqUpdateChecked = (goodsId, isChecked) => {
	return http.get(`/cart/checkCart/${goodsId}/${isChecked}`)
}

// 全选和全不选
// isChecked 商品的选中状态
export const reqCheckAddCart = (isChecked) => {
	return http.get(`/cart/checkAllCart/${isChecked}`)
}

// 删除购物车商品
export const reqDelCart = (goodsId) => {
	return http.get(`/cart/delete/${goodsId}`)
}