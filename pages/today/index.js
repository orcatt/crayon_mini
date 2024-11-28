// pages/today/index.js
var utils = require('../../api/util.js');

Component({
  properties: {

  },
  data: {
		tabbarRealHeight: 0,
		tabbarHeight: 0,
		tabbarMargin: 0,
		activeIndex: 0,
		
    tabsList: [{
      id: 0,
      title: '今日',
    }, {
      id: 1,
      title: '待办',
    },{
			id: 2,
			title: '倒数日',
		}],
  },
  methods: {
		changeTabs(e) {
      var that = this;
      that.setData({
        activeIndex: e.currentTarget.dataset.id
      })
    },
		
		// 监听子组件触发的切换事件
		handleSwitchTab(e) {
			this.setData({
				activeIndex: e.detail.id
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
		}
  },
  lifetimes: {
		attached: function () {
			var that = this;
			that.setData({
				tabbarMargin: wx.getMenuButtonBoundingClientRect().top,
				tabbarHeight: wx.getMenuButtonBoundingClientRect().height,
				tabbarRealHeight: wx.getMenuButtonBoundingClientRect().top + wx.getMenuButtonBoundingClientRect().height + 12
			})
			wx.setStorageSync('tabbarRealHeight', that.data.tabbarRealHeight)
			that.getLoginStatus()

		}
	}

})