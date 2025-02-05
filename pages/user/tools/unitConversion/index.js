// pagesusertools/dict/index.js
Page({
  data: {
		tabbarRealHeight: 0,
    activeIndex: 0,
    tabsList: [{
      id: 0,
      title: '长度'
    },{
      id: 1,
      title: '面积'
    },{
      id: 2,
      title: '重量'
    },{
      id: 3,
      title: '时间'
    },{
      id: 4,
      title: '温度'
    }],
  },
  onLoad(options) {
		var that = this;
		that.setData({
			tabbarRealHeight: wx.getStorageSync('tabbarRealHeight')
		})

  },
  // 标签切换
  changeTabs(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({
      activeIndex: id
    });
  },

  // 滑动切换
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
  onShareAppMessage() {},

  



})