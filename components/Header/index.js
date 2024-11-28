Component({
  properties: {
    // 显示类型 left：左对齐 / center：居中对齐
    classTitle: {
      type: String,
      value: ''
    },
    // 文字颜色 true：黑色 / false：白色
    classColor: {
      type: Boolean,
      value: false
    },
    // 是否展示返回按钮
    isBack: {
      type: Boolean,
      value: false
    },
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
  methods: {
    // 回退按钮
    back() {
      wx.navigateBack({
				delta: 1,
				success: function (res) {
				},
				fail: function (res) {
					wx.redirectTo({
						url: '/pages/index/index',
					})
				}
      })
    }
  },
  lifetimes: {
    // 页面加载时确定顶部导航高度
    attached: function () {
      this.setData({
        tabbarMargin: wx.getMenuButtonBoundingClientRect().top,
        tabbarHeight: wx.getMenuButtonBoundingClientRect().height,
        tabbarRealHeight: wx.getMenuButtonBoundingClientRect().top + wx.getMenuButtonBoundingClientRect().height + 12
      })
      wx.setStorageSync('tabbarRealHeight', this.data.tabbarRealHeight)
    }
  }
})