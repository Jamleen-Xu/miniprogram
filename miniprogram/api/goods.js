import http from '../utils/http';

// 获取商品列表数据
// 参数是一个对象 {page, limit, category1Id, category2Id}，返回promise

export const reqGoodsList = ({page, limit, ...data}) => {
	return http.get(`/goods/list/${page}/${limit}`, data)
}

// 获取商品的详情
// params 商品的id

export const reqGoodsInfo = (goodsId) => {
	return http.get(`/goods/${goodsId}`);
}