export const swipeCellBehavior = Behavior({
	data: {
		swipeCellQueue: [],  //组件实例队列
	},

	methods: {
		// 优化删除滑块--------
		// 打开滑块时，将实例存储到队列中
		onSwipeCellOpen(event) {
			// 通过 selectComponent 可以获取到 SwipeCell 实例并调用实例方法
			let instance = this.selectComponent(`#${event.target.id}`);

			this.data.swipeCellQueue.push(instance);
		},
		// 点击页面空白区域，关掉开启的滑块
		onSwipeCellPageTap() {
			this.offSwipeCellCommon();
		},
		// 点击其他滑块时，关掉开启的滑块
		onSwipeCellClick() {
			this.offSwipeCellCommon();
		},
		// 关掉滑块的统一方法
		offSwipeCellCommon() {
			// 循环关闭开启的滑块
			this.data.swipeCellQueue.forEach(item => {
				item.close();
			})
			// 将滑块实例列表清空
			this.data.swipeCellQueue = [];
		},
	}
})