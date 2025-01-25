var utils = require('../../../api/util.js');

Component({
  properties: {

  },
  data: {
		tabbarRealHeight: 0,
		toolsList: [
			{
				id: 1,
				title: "广告",
				desc: "广告位",
				url: "/pages/explore/tools/bloods/index",
				icon: "/static/image/tools/3.png"
			}
		]
  },
  methods: {
		goToPage(e) {	
			wx.navigateTo({
				url: e.currentTarget.dataset.url
			})
		},
  },
  lifetimes: {
		attached: function () {
			var that = this;
			that.setData({
				tabbarRealHeight: wx.getStorageSync('tabbarRealHeight')
			})
		}
	}

})