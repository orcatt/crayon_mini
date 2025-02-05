var utils = require('../../../../../api/util.js');
const bushou = require('../../../../../utils/BushouSearch.js');

Component({
  properties: {
  },
  data: {
		tabbarRealHeight: 0,
		bushou: [],
		activeIndex: 0
  },
  methods: {
		handleBushou(e){
			// 先设置缩小动画
			this.setData({
				activeIndex: -1
			});
			// 短暂延迟后设置新的选中状态，触发放大动画
			setTimeout(() => {
				this.setData({
					activeIndex: e.currentTarget.dataset.index
				});
			}, 50);
		},
		toFontResult(e){
			wx.navigateTo({
				url: `/pages/user/tools/dict/fontResult/index?type=bushou&bushou=${e.currentTarget.dataset.item}`
			})
		}
		
  },
  lifetimes: {
		attached: function () {
			var that = this;
			that.setData({
				bushou: bushou.default
			})
			
			console.log(that.data.bushou);
		}
	}

})