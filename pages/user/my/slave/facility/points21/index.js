var utils = require('../../../../../../api/util.js');


Component({
  properties: {

  },
  data: {
		tabbarRealHeight: 0,
		
  },
  methods: {
		
		
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