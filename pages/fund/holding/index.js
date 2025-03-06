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
		},
		showAddUpdateFundDrawer: false,
		fundFormData: {
			fund_name: '',
			code: ''
		},
		addUpdateFundType: 'add',
		showBuySellDrawer: false,
		buySellFormData: {
			fund_id: '',
			transaction_type: 'buy',
			shares: '',
			net_value: '',
			amount: '',
			transaction_date: '',
			fund_name: '' // 用于显示
		},
		transactionTypes: ['buy', 'sell'],
		showUpdateProfitDrawer: false,
		updateProfitFormData: {
			fund_id: '',
			price_change_percentage: '',
			transaction_date: '',
			fund_name: '' // 用于显示
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
		},
		// ? ------ 新增/编辑/删除基金 ------
		showFundDrawer(e) {
			var that = this;
			that.triggerEvent('toggleTabBar', { show: false }, {});
			if (e.currentTarget.dataset.type === 'add') {
				that.setData({
					showAddUpdateFundDrawer: true,
					addUpdateFundType: 'add'
				});
			} else {
				let item = {
					id: e.currentTarget.dataset.item.id,
					fund_name: e.currentTarget.dataset.item.fund_name,
					code: e.currentTarget.dataset.item.code
				}
				that.setData({
					showAddUpdateFundDrawer: true,
					fundFormData: item,
					addUpdateFundType: 'edit'
				});
			}
		},
		closeFundDrawer() {
			var that = this;
			that.triggerEvent('toggleTabBar', { show: true }, {});
			that.setData({
				showAddUpdateFundDrawer: false,
				fundFormData: {
					fund_name: '',
					code: ''
				},
				addUpdateFundType: 'add'
			});
		},
		handleInput(e) {
			const field = e.currentTarget.dataset.field;
			const value = e.detail.value;
			this.setData({
				[`fundFormData.${field}`]: value
			});
		},
		submitAddUpdateFund() {
			var that = this;
			if (!that.data.fundFormData.fund_name) {
				wx.showToast({
					title: '请输入基金名称',
					icon: 'none'
				});
				return;
			}
			if (!that.data.fundFormData.code) {
				wx.showToast({
					title: '请输入基金代码',
					icon: 'none'
				});
				return;
			}
			let url = that.data.addUpdateFundType === 'add' ? 'fund/holdingShares/add' : 'fund/holdingShares/update';
			utils.getData({
				url: url,
				params: that.data.fundFormData,
				success: (res) => {
					if (res.code === 200) {
						wx.showToast({
							title: res.message,
							icon: 'success'
						});
						that.closeFundDrawer();
						that.getData();
					} else {
						wx.showToast({
							title: res.message,
							icon: 'none'
						});
					}
				}
			});
		},
		deleteFund(e) {
			var that = this;
			wx.showModal({
				title: '提示',
				content: '确定删除该基金吗？',
				success: (res) => {
					if (res.confirm) {
						
						utils.getData({
							url: 'fund/holdingShares/delete',
							params: {
								id: e.currentTarget.dataset.id
							},
							success: (res) => {
								if (res.code === 200) {
									wx.showToast({
										title: res.message,
										icon: 'success'
									});
									that.getData();
								}
							}
						});
					}
				}
			});
		},
		// ? ------ 买入卖出 ------
		showBuySellDrawer(e) {
			var that = this;
			that.triggerEvent('toggleTabBar', { show: false }, {});
			let item = e.currentTarget.dataset.item;
			
			// 获取当前日期
			let today = new Date();
			let year = today.getFullYear();
			let month = String(today.getMonth() + 1).padStart(2, '0');
			let day = String(today.getDate()).padStart(2, '0');
			let currentDate = `${year}-${month}-${day}`;
			
			that.setData({
				showBuySellDrawer: true,
				buySellFormData: {
					fund_id: item.id,
					transaction_type: 'buy',
					shares: '',
					net_value: '',
					amount: '',
					transaction_date: currentDate,
					fund_name: item.fund_name
				}
			});
		},
		closeBuySellDrawer() {
			var that = this;
			that.triggerEvent('toggleTabBar', { show: true }, {});
			that.setData({
				showBuySellDrawer: false,
				buySellFormData: {
					fund_id: '',
					transaction_type: 'buy',
					shares: '',
					net_value: '',
					amount: '',
					transaction_date: '',
					fund_name: ''
				}
			});
		},
		handleBuySellInput(e) {
			const field = e.currentTarget.dataset.field;
			const value = e.detail.value;
			this.setData({
				[`buySellFormData.${field}`]: value
			});

			// 如果修改了份额或净值,自动计算金额
			if (field === 'shares' || field === 'net_value') {
				let shares = this.data.buySellFormData.shares || 0;
				let netValue = this.data.buySellFormData.net_value || 0;
				let amount = (parseFloat(shares) * parseFloat(netValue)).toFixed(4);
				this.setData({
					'buySellFormData.amount': amount
				});
			}
		},
		handleTransactionTypeChange(e) {
			this.setData({
				'buySellFormData.transaction_type': this.data.transactionTypes[e.detail.value]
			});
		},
		handleTransactionDateChange(e) {
			this.setData({
				'buySellFormData.transaction_date': e.detail.value
			});
		},
		submitBuySell() {
			var that = this;
			let formData = that.data.buySellFormData;
			
			if (!formData.shares) {
				wx.showToast({
					title: '请输入份额',
					icon: 'none'
				});
				return;
			}
			if (!formData.net_value) {
				wx.showToast({
					title: '请输入净值',
					icon: 'none'
				});
				return;
			}
			if (!formData.transaction_date) {
				wx.showToast({
					title: '请选择交易日期',
					icon: 'none'
				});
				return;
			}

			utils.getData({
				url: 'fund/holdingTransactions/buysell',
				params: formData,
				success: (res) => {
					if (res.code === 200) {
						wx.showToast({
							title: res.message,
							icon: 'success'
						});
						that.closeBuySellDrawer();
						that.getData();
					} else {
						wx.showToast({
							title: res.message,
							icon: 'none'
						});
					}
				}
			});
		},
		// ? ------ 更新收益 ------
		showUpdateProfitDrawer(e) {
			var that = this;
			that.triggerEvent('toggleTabBar', { show: false }, {});
			let item = e.currentTarget.dataset.item;
			
			// 获取当前日期
			let today = new Date();
			let year = today.getFullYear();
			let month = String(today.getMonth() + 1).padStart(2, '0');
			let day = String(today.getDate()).padStart(2, '0');
			let currentDate = `${year}-${month}-${day}`;
			
			that.setData({
				showUpdateProfitDrawer: true,
				updateProfitFormData: {
					fund_id: item.id,
					price_change_percentage: '',
					transaction_date: currentDate,
					fund_name: item.fund_name
				}
			});
		},
		closeUpdateProfitDrawer() {
			var that = this;
			that.triggerEvent('toggleTabBar', { show: true }, {});
			that.setData({
				showUpdateProfitDrawer: false,
				updateProfitFormData: {
					fund_id: '',
					price_change_percentage: '',
					transaction_date: '',
					fund_name: ''
				}
			});
		},
		handleUpdateProfitInput(e) {
			const field = e.currentTarget.dataset.field;
			const value = e.detail.value;
			this.setData({
				[`updateProfitFormData.${field}`]: value
			});
		},
		handleUpdateProfitDateChange(e) {
			this.setData({
				'updateProfitFormData.transaction_date': e.detail.value
			});
		},
		submitUpdateProfit() {
			var that = this;
			let formData = that.data.updateProfitFormData;
			
			if (!formData.price_change_percentage) {
				wx.showToast({
					title: '请输入盈亏率',
					icon: 'none'
				});
				return;
			}
			if (!formData.transaction_date) {
				wx.showToast({
					title: '请选择交易日期',
					icon: 'none'
				});
				return;
			}

			utils.getData({
				url: 'fund/holdingShares/profitLoss',
				params: formData,
				success: (res) => {
					if (res.code === 200) {
						wx.showToast({
							title: res.message,
							icon: 'success'
						});
						that.closeUpdateProfitDrawer();
						that.getData();
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
				tabbarRealHeight: wx.getStorageSync('tabbarRealHeight')
			})
			that.getData();
		}
	}

})