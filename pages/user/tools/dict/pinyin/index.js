var utils = require('../../../../../api/util.js');
const pinyin = require('../../../../../utils/PinyinSearch.js');

Component({
  properties: {
  },
  data: {
		tabbarRealHeight: 0,
		pinyin: [],
		activeIndex: 0
  },
  methods: {
		handlePinyin(e){
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
				url: `/pages/user/tools/dict/fontResult/index?type=pinyin&pinyin=${e.currentTarget.dataset.item}`
			})
		}
		
  },
  lifetimes: {
		attached: function () {
			var that = this;
			that.setData({
				pinyin: pinyin.default
			})
			
			console.log(that.data.pinyin);
		}
	}

})