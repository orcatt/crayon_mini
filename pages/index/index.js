// pages/userList/index.js
Page({
  data: {
    current: 1,

	},
	currentClick(e) {
    this.setData({
      current: e.detail.index
    })
  },
  onLoad(options) {
    var that = this;
    if (options.index) {
      that.setData({
        current: options.index * 1
      })
      return;
    }
  },

  
  onReady() {},
  onShow() {},
  onHide() {},
  onUnload() {},
  onPullDownRefresh() {},
  onReachBottom() {},
  onShareAppMessage() {}
})