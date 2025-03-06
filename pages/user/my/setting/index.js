// pages/explore/tools/dict/index.js
var utils = require('../../../../api/util.js');

Page({
  data: {
		tabbarRealHeight: 0,
    menuList: [
      {
        icon: '/static/image/my/close.png',
        title: '退出登录',
        desc: '可登出切换账号',
        type: 'logout'
      }
    ]
  },
  onLoad(options) {
		var that = this;
		that.setData({
			tabbarRealHeight: wx.getStorageSync('tabbarRealHeight')
		})

  },

  onReady() {},
  onShow() {},
  onHide() {},
  onUnload() {},
  onPullDownRefresh() {},
  onReachBottom() {},
  onShareAppMessage() {},

  handleTap(e) {
    const type = e.currentTarget.dataset.type;
    if (type === 'logout') {
      this.handleLogout();
    }
  },

  handleLogout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除本地存储
          wx.clearStorageSync();
          // 跳转到首页
          wx.reLaunch({
            url: '/pages/today/index'
          });
        }
      }
    });
  }
})