var utils = require('../../../api/util.js');

Component({
  properties: {

  },
  data: {
		tabbarRealHeight: 0,
		toolsList: [
			{
				id: 1,
				title: "盈亏",
				desc: "涨跌幅计算盈亏收益",
				url: "/pages/user/tools/unitConversion/index",
				icon: "/static/image/tools/19.png"
			},{
				id: 2,
				title: "止盈止亏",
				desc: "止盈亏核算结果收益",
				url: "/pages/user/tools/drug/index",
				icon: "/static/image/tools/21.png"
			},{
				id: 3,
				title: "补仓",
				desc: "补充资金与成本计算",
				url: "/pages/user/tools/dateInterval/index",
				icon: "/static/image/tools/18.png"
			},{
				id: 4,
				title: "量化套利",
				desc: "低买高卖与短线交易",
				url: "/pages/user/tools/location/index",
				icon: "/static/image/tools/19.png"
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