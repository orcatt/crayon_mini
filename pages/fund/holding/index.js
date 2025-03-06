var utils = require('../../../api/util.js');

Component({
  properties: {

  },
  data: {
		tabbarRealHeight: 0,
		holdingList: [],
		totalData: {
			totalAmount: 0, // 总金额
			totalProfit: 0, // 总收益
			profitRate: 0, // 收益率
			holdingCount: 0, // 持仓数量
			avgCost: 0, // 平均成本
			maxProfit: 0, // 最大收益
			maxLoss: 0, // 最大亏损
			avgHoldingDays: 0 // 平均持有天数
		}
  },
  methods: {
		getData(){
			var that = this;
			let postData = {
				transaction_date: '2025-03-02',
			}
			utils.getData({
				url: 'fund/holdingShares/list',
				params: postData,
				success: (res) => {
					if (res.code === 200) {
						// // 计算总计数据
						// let totalAmount = 0;
						// let totalProfit = 0;
						// let maxProfit = -Infinity;
						// let maxLoss = Infinity;
						// let totalDays = 0;

						// res.data.forEach(item => {
						// 	totalAmount += item.amount;
						// 	totalProfit += item.profit;
						// 	maxProfit = Math.max(maxProfit, item.profit);
						// 	maxLoss = Math.min(maxLoss, item.profit);
						// 	totalDays += item.holdingDays;
						// });

						that.setData({
							holdingList: res.data,
							totalData: {
								// totalAmount: totalAmount.toFixed(2),
								// totalProfit: totalProfit.toFixed(2),
								// profitRate: ((totalProfit / totalAmount) * 100).toFixed(2),
								// holdingCount: res.data.length,
								// avgCost: (totalAmount / res.data.length).toFixed(2),
								// maxProfit: maxProfit.toFixed(2),
								// maxLoss: maxLoss.toFixed(2),
								// avgHoldingDays: Math.floor(totalDays / res.data.length)
							}
						})
					}else{
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
				tabbarRealHeight: wx.getStorageSync('tabbarRealHeight')
			})
			that.getData();
		}
	}

})