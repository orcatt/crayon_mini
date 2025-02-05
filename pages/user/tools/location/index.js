// pagesusertools/dict/index.js
Page({
  data: {
		tabbarRealHeight: 0,
		activeIndex: 0,
		tabsList: [{
			id: 0,
			title: '属地'
		},{
			id:1,
			title: '籍贯'
		}]
  },
  onLoad(options) {
		var that = this;
		that.setData({
			tabbarRealHeight: wx.getStorageSync('tabbarRealHeight')
		})

  },
	changeTabs(e) {
		const id = e.currentTarget.dataset.id;
		// 先设置缩小动画
		this.setData({
			activeIndex: -1
		});
		// 短暂延迟后设置新的选中状态，触发放大动画
		setTimeout(() => {
			this.setData({
				activeIndex: id
			});
		}, 50);
	},
	// 滑动切换事件处理
	handleSwiper(e) {
		this.setData({
			activeIndex: e.detail.current
		})
	},

  onReady() {},
  onShow() {},
  onHide() {},
  onUnload() {},
  onPullDownRefresh() {},
  onReachBottom() {},
  onShareAppMessage() {}
})