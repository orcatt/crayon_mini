var utils = require('../../../../../api/util.js');
const bihuabushou = require('../../../../../utils/BihuaBushouSearch.js');

Component({
	properties: {
	},
	data: {
		tabbarRealHeight: 0,
		bihuabushou: [],
		activeIndex: 0
	},
	methods: {
		handleBihuaBushou(e) {
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
		toFontResultBs(e) {
			wx.navigateTo({
				url: `/pages/explore/tools/dict/fontResult/index?type=bihua&bihua=${e.currentTarget.dataset.item}`
			})
		},
		toFontResult(e) {
			var that = this;
			wx.navigateTo({
				url: `/pages/explore/tools/dict/fontResult/index?type=bhbs&bihua=${that.data.bihuabushou[that.data.activeIndex].bihua}&bushou=${e.currentTarget.dataset.item}`
			})
		}

	},
	lifetimes: {
		attached: function () {
			var that = this;
			that.setData({
				bihuabushou: bihuabushou.default
			})

			console.log(111, that.data.bihuabushou);
		}
	}

})