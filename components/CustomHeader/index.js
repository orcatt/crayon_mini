Component({
  properties: {
    backgroundColor: {
      type: String,
      value: '#FFFFFF'
    }
  },
  data: {
    tabbarMargin: 0, // 手机状态栏高度
    tabbarHeight: 0, // 顶部导航高度
    tabbarRealHeight: 0
  },
  methods: {},
  lifetimes: {
    // 页面加载时确定顶部导航高度
    attached: function () {
      this.setData({
        tabbarMargin: wx.getMenuButtonBoundingClientRect().top,
				tabbarHeight: wx.getMenuButtonBoundingClientRect().height,
				tabbarWidth: wx.getMenuButtonBoundingClientRect().left,
        tabbarRealHeight: wx.getMenuButtonBoundingClientRect().top + wx.getMenuButtonBoundingClientRect().height + 12
			})
      wx.setStorageSync('tabbarRealHeight', this.data.tabbarRealHeight)
    }
  }
})