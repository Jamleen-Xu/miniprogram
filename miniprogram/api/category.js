import http from '../utils/http';

export const reqCategoryData = () => {
	return http.request({url: '/index/findCategoryTree'})
}