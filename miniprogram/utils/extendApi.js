// 封装一些常用的方法


// 消息提示框
// 要求调用者传入一个对象
// 对形参数进行结构赋值，如果没有传入参数，则使用默认参数，否则使用传入的参数
const toast = ({title='数据加载中...', icon='none', duration=2000, mask=true} = {}) => {

	wx.showToast({
		title,
		icon,
		duration,
		mask
	})
}

const modal = (options = {}) => {
	return new Promise((resolve) => {

		// 定义一个默认参数
		const defaultOpt = {
			title: '提示',
			content: '你确定执行此操作码？',
			confirmColor: '#f3514f'
		}

		// 将参入的参数和默认的参数进行合并
		const newOpt = Object.assign({}, defaultOpt, options);

		wx.showModal({
			...newOpt,
			complete({confirm, cancel}) {
				confirm && resolve(true);
				cancel && resolve(false)
			}
		});

	})
}

// 导出，导入调用 
export {toast, modal}

wx.toast = toast;