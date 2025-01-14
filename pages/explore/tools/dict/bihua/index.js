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
		handleBihuaBushou(e){
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
		}
		
  },
  lifetimes: {
		attached: function () {
			var that = this;
			that.setData({
				bihuabushou: bihuabushou.default
			})
			
			console.log(111,that.data.bihuabushou);
		}
	}

})