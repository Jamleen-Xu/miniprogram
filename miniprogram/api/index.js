import http from '../utils/http';

export const reIndexData = () => {
	return Promise.all([
		http.request({url: '/index/findBanner'}),
		http.request({url: '/index/findCategory1'}),
		http.request({url: '/index/advertisement'}),
		http.request({url: '/index/findListGoods'}),
		http.request({url: '/index/findRecommendGoods'}),
	])
}