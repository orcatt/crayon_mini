Component({
  data: {
    current: 1,
    list: [{
			id: 1,
      title: '今日',
			icon: '/static/image/tabber/tab0.png',
      selectedIcon: "/static/image/tabber/tab0active.png",
      path: "/pages/home/index"
    }, {
			id: 2,
      title: '财事',
      icon: '/static/image/tabber/tab1.png',
      selectedIcon: "/static/image/tabber/tab1active.png",
      path: "/pages/home/index"
    },  {
			id: 3,
      title: '我的',
      icon: '/static/image/tabber/tab2.png',
      selectedIcon: "/static/image/tabber/tab2active.png",
      path: "/pages/my/index"
    }]
  },
  methods: {
    currentClick(e) {
			var that = this;
      this.setData({
        current: e.currentTarget.dataset.index
      })
      this.triggerEvent('currentShow', {
        index: e.currentTarget.dataset.index
      })
      if (getCurrentPages()[getCurrentPages().length - 1].route.indexOf('pages/index/index') === -1) {
        wx.reLaunch({
          url: `/pages/index/index?index=${e.currentTarget.dataset.index}`
        })
      }
      wx.setStorageSync('currentIndex', e.currentTarget.dataset.index)
		}
		
  },
  lifetimes: {
    attached: function () {
      this.setData({
        current: wx.getStorageSync('currentIndex') || 1
      })
    }
  }
})