// pages/health/cookbook/index.js
var utils = require('../../../api/util.js');

Component({
  properties: {

  },
  data: {
		tabbarRealHeight: 0,
    cookbookList: [],
    page: 1,
    limit: 20

  },
  methods: {
    getCookbookList() {
      var that = this;
      const postData = {
				page: that.data.page,
				limit: that.data.limit
			};
			utils.getData({
				url: 'health/recipes/list',
				params: postData,
				method: 'GET',
				success: (res) => {
					if (res.code === 200) {
            res.data.data.forEach(item => {
              item.tags = item.tags.split(',')
            });
            that.setData({
              cookbookList: res.data.data
            })
            console.log(res.data.data)
					} else {
						wx.showToast({
							title: res.message,
							icon: 'none'
						});
					}
				}
			});
    }
  },
	lifetimes: {
		attached: function () {
			var that = this;
			that.setData({
				tabbarRealHeight: wx.getStorageSync('tabbarRealHeight'),
			})
      that.getCookbookList()
		}
	}
})