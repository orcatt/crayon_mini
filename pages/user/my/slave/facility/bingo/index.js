var utils = require('../../../../../../api/util.js');

Component({
  properties: {

  },
  data: {
		tabbarRealHeight: 0,
		numbers: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
		dealerNumber: null,
		playerNumber: null,
		showResult: false,
		gameResult: ''
	},
	methods: {
		startNewGame: function() {
			// 随机生成庄家和玩家的数字
			const dealerIndex = Math.floor(Math.random() * this.data.numbers.length);
			const playerIndex = Math.floor(Math.random() * this.data.numbers.length);
			
			this.setData({
				dealerNumber: this.data.numbers[dealerIndex],
				playerNumber: this.data.numbers[playerIndex],
				showResult: true,
				gameResult: dealerIndex > playerIndex ? '庄家赢' : '玩家赢'
			});
		}
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