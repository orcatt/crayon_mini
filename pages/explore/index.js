// pages/explore/index.js
var utils = require('../../api/util.js');

Page({
	data: {
		tabbarRealHeight: 0,
		tabbarHeight: 0,
		tabbarMargin: 0,
		current: 1,

		activeIndex: 0,

		tabsList: [{
			id: 0,
			title: '探索',
		}, {
			id: 1,
			title: '试试',
		},{
			id: 2,
			title: '更多',
		}],
		showTabBar: true,
	},
	onLoad(options) {
		var that = this;
		that.setData({
			tabbarMargin: wx.getMenuButtonBoundingClientRect().top,
			tabbarHeight: wx.getMenuButtonBoundingClientRect().height,
			tabbarRealHeight: wx.getMenuButtonBoundingClientRect().top + wx.getMenuButtonBoundingClientRect().height + 12
		})
		wx.setStorageSync('tabbarRealHeight', that.data.tabbarRealHeight)
		that.getLoginStatus()
	},
	currentClick(e) {
		this.setData({
			current: e.detail.index
		})
	},
	changeTabs(e) {
		var that = this;
		that.setData({
			activeIndex: e.currentTarget.dataset.id
		})
	},

	// 滑动切换事件处理
	handleSwiper(e) {
		this.setData({
			activeIndex: e.detail.current
		})
	},

	// 切换 TabBar 显示状态
	toggleTabBar(e) {
		this.setData({
			showTabBar: e.detail.show
		})
	},


	// 判断登录状态
	getLoginStatus() {
		var that = this;
		if (!wx.getStorageSync('userId')) {
			that.setData({
				LoginModal: true,
				loginStatus: false
			})
			return false;
		} else {
			that.setData({
				loginStatus: true
			})
			return true;
		}
	},
	// 登录框
	Notauthorized() { // 取消授权
		this.setData({
			LoginModal: false
		})
	},
	toLogin(e) { // 授权登录
		var that = this;
		wx.navigateTo({
			url: '/pages/login/index',
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