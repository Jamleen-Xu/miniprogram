import http from '../utils/http';

export const reqLogin = (code) => {
	return http.request({url: `/weixin/wxLogin/${code}`})
}

export const reqUserInfo = () => {
	return http.request({url: '/weixin/getuserInfo'})
}

export const reqUploadFile = (filePath, name) => {
	return http.upload('/fileUpload', filePath, name)
}

// 更新用户信息，最新头像和名字
export const reqUpdateUserInfo = (userInfo) => {
	return http.post('/weixin/updateUser', userInfo)
}