var utils = require('../../../api/util.js');

Component({
  properties: {

  },
  data: {
		tabbarRealHeight: 0,
		activeIndex: 0,
    tabsList: [{
      id: 0,
      title: '目标成本价'
    },{
      id: 1,
      title: '想补多少钱'
    }],
  },
  methods: {
		  // 标签切换
			changeTabs(e) {
				const id = e.currentTarget.dataset.id;
				this.setData({
					activeIndex: id
				});
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