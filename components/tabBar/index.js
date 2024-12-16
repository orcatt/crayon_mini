Component({
  data: {
    current: 1,
    list: [{
			id: 1,
      title: '日子',
			icon: '/static/image/tabber/tab0.png',
      selectedIcon: "/static/image/tabber/tab0active.png",
      path: "/pages/today/index"
    }, {
			id: 2,
      title: '康健',
      icon: '/static/image/tabber/tab1.png',
      selectedIcon: "/static/image/tabber/tab1active.png",
      path: "/pages/health/index"
    }, {
			id: 3,
      title: '箱子',
      icon: '/static/image/tabber/tab2.png',
      selectedIcon: "/static/image/tabber/tab2active.png",
      path: "/pages/home/index"
    },  {
			id: 4,
      title: '我的',
      icon: '/static/image/tabber/tab3.png',
      selectedIcon: "/static/image/tabber/tab3active.png",
      path: "/pages/my/index"
    }]
  },
  methods: {
    currentClick(e) {
      console.log(e);
      
			var that = this;
      this.setData({
        current: e.currentTarget.dataset.index
      })
      this.triggerEvent('currentShow', {
        index: e.currentTarget.dataset.index
      })
      wx.redirectTo({
        url: e.currentTarget.dataset.path
      })
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