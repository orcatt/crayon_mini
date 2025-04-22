var utils = require('../../../../../../api/util.js');


Component({
  properties: {

  },
  data: {
    tabbarRealHeight: 0,
    datas: [{
      "id": "792085712309854208",
      "imgUrl": "/static/image/incomplete.png",
      "title": "迅雷月卡 - 1"
    }, {
      "id": "766410261029724160",
      "imgUrl": "/static/image/incomplete.png",
      "title": "迅雷月卡 - 2"
    }, {
      "id": "770719340921364480",
      "imgUrl": "/static/image/incomplete.png",
      "title": "迅雷月卡 - 3"
    }, {
      "id": "770946438416048128",
      "imgUrl": "/static/image/incomplete.png",
      "title": "迅雷月卡 - 4"
    }, {
      "id": "781950121802735616",
      "imgUrl": "/static/image/incomplete.png",
      "title": "迅雷月卡 - 5"
    }, {
      "id": "766411654436233216",
      "imgUrl": "/static/image/incomplete.png",
      "title": "迅雷月卡 - 6"
    }, {
      "id": "770716883860332544",
      "imgUrl": "/static/image/incomplete.png",
      "title": "迅雷月卡 - 7"
    }, {
      "id": "796879308510732288",
      "imgUrl": "/static/image/incomplete.png",
      "title": "迅雷月卡 - 8"
    }], // 数据 
    prizeId: '',  // 抽中结果id，通过属性方式传入组件
  },
  methods: {
		// 次数不足回调
		onNotEnoughHandle(e) {
			wx.showToast({
				icon: 'none',
				title: e.detail
			})
		},

		// 抽奖回调
		onLuckDrawHandle() {
			this.setData({
				prizeId: this.data.datas[Math.floor(Math.random() * 10 % this.data.datas.length)].id
			});
		},

		// 动画旋转完成回调
		onLuckDrawFinishHandle() {
			const datas = this.data.datas;
			const data = datas.find((item) => {
				return item.id === this.data.prizeId;
			});
			wx.showToast({
				icon: 'none',
				title: `恭喜你抽中 ${data.title}`
			})
			this.setData({
				prizeId: ''
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