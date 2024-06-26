// 配置小程序的环境变量
const {miniProgram} = wx.getAccountInfoSync();

const {envVersion} = miniProgram;

const env = {
	baseUrl: 'https://gmall-prod.atguigu.cn/mall-api'
}

switch (envVersion) {
	// 开发版
	case 'develop':
		env.baseUrl = 'https://gmall-prod.atguigu.cn/mall-api';
		break;
	// 测试版 
	case 'trial':
		env.baseUrl = 'https://gmall-prod.atguigu.cn/mall-api';
		break;
	// 生产版
	case 'release':
		env.baseUrl = 'https://gmall-prod.atguigu.cn/mall-api';
		break;
	default:
		env.baseUrl = 'https://gmall-prod.atguigu.cn/mall-api';
		break;
}

export default env;