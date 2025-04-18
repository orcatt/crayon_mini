var utils = require('../../../api/util.js');

Component({
  properties: {

  },
  data: {
		tabbarRealHeight: 0,
		currentDate: '',
		welcomeStep: 1,
		userInfo: {},
		userTotalInfo: {
			total_assets_user: '', // 原始投入（本金）
			total_available_assets_user: '', // 总资产=原始投入+-总盈亏
			total_market_value_user: '', // 总市值=所有持仓市值之和
			available_user: '', // 可用=总资产-总市值
			total_profit_user_today: '', // 当日总盈亏=所有持仓当日盈亏之和
			total_profit_user: '', // 总盈亏=所有持仓盈亏之和
			holding_position_user: '', // 仓位=总市值/总资产
		},
		holdingList: [],
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
		transactionTypes: [
			{
				name: '买入',
				value: 'buy'
			},
			{
				name: '卖出',
				value: 'sell'
			}
		],
		showUpdateProfitDrawer: false,
		updateProfitFormData: {
			fund_id: '',
			current_net_value: '',
			transaction_date: '',
			fund_name: '', // 用于显示
			profit_loss_addOrUpdate: 'add' // 盈亏操作类型
		},
		count: 0,
		expandedFundId: null,
		sortType: [{
			name: '金额',
			type: 'amount',
			sort: null
		},{
			name: '数量',
			type: 'shares',
			sort: null
		},{
			name: '仓位',
			type: 'position',
			sort: null
		},{
			name: '盈亏',
			type: 'profit',
			sort: null
		},{
			name: '当日盈亏',
			type: 'daily_profit',
			sort: null
		}],
  },
  methods: {
		getData(){
			var that = this;
			if(that.data.count > 0){
				return;
			}
			that.setData({
				count: that.data.count + 1
			})
			let today = new Date();
			let year = today.getFullYear();
			let month = String(today.getMonth() + 1).padStart(2, '0');
			let day = String(today.getDate()).padStart(2, '0');
			let currentDate = `${year}-${month}-${day}`;
			that.setData({
				currentDate: currentDate,
			})

			
			let postData = {
				transaction_date: currentDate,
			}
			utils.getData({
				url: 'fund/holdingShares/list',
				params: postData,
				success: (res) => {
					if (res.code === 200) {
						let userTotalInfo = {
							total_assets_user: that.data.userInfo.total_assets_user, // 原始投入（本金）
							total_available_assets_user: that.data.userInfo.total_assets_user, // 总资产=原始投入+-总盈亏
							total_market_value_user: 0, // 总市值
							available_user: 0, // 可用
							total_profit_user_today: 0, // 当日总盈亏
							total_profit_user: 0, // 总盈亏
							holding_position_user: 0, // 仓位
						}
						
						res.data.forEach(item => {
							item.holding_cost = parseFloat(item.holding_cost).toFixed(3)
							
							item.current_net_value = ((1 + item.holding_profit_rate) * item.holding_cost).toFixed(3)
							
							item.holding_profit_rate_percentage = (item.holding_profit_rate * 100).toFixed(2)
							item.holding_shares = parseFloat(item.holding_shares).toFixed(0)
							userTotalInfo.total_market_value_user += item.holding_amount*1
							userTotalInfo.total_profit_user_today += item.dailyData.profit_loss*1
							userTotalInfo.total_profit_user += item.holding_profit*1

						})

						res.data.forEach(item => {
							// 个股仓位
							item.holding_position = parseFloat((item.holding_amount*1 / userTotalInfo.total_market_value_user * 100)).toFixed(2)
						})

						if(isNaN(userTotalInfo.total_profit_user_today)){
							userTotalInfo.total_profit_user_today = 0;
						}
						userTotalInfo.total_profit_user_today = parseFloat(userTotalInfo.total_profit_user_today).toFixed(2)
						userTotalInfo.total_market_value_user = parseFloat(userTotalInfo.total_market_value_user).toFixed(2)
						userTotalInfo.total_profit_user = parseFloat(userTotalInfo.total_profit_user).toFixed(2)
						userTotalInfo.total_available_assets_user = parseFloat(userTotalInfo.total_available_assets_user*1 + userTotalInfo.total_profit_user*1).toFixed(2)
						userTotalInfo.available_user = parseFloat((userTotalInfo.total_available_assets_user*1 - userTotalInfo.total_market_value_user*1)).toFixed(2)
						userTotalInfo.holding_position_user = parseFloat((userTotalInfo.total_market_value_user*1 / userTotalInfo.total_available_assets_user * 100)).toFixed(2)
						console.log(userTotalInfo, res.data);
						

						that.setData({
							holdingList: res.data,
							userTotalInfo: userTotalInfo
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
		// 排序
		handleSortTypeChange(e){
			var that = this;
			let type = e.currentTarget.dataset.type;
			let sort = !e.currentTarget.dataset.sort ? 'down' : e.currentTarget.dataset.sort === 'down' ? 'up' : null;

			that.setData({
				expandedFundId: null,
				sortType: that.data.sortType.map(item => ({...item, sort: item.type === type ? sort : null}))
			})

			if(type === 'amount'){
				that.data.holdingList.sort((a, b) => {
					return sort === 'up' ? a.holding_amount - b.holding_amount : b.holding_amount - a.holding_amount
				})
			}else if(type === 'shares'){
				that.data.holdingList.sort((a, b) => {
					return sort === 'up' ? a.holding_shares - b.holding_shares : b.holding_shares - a.holding_shares
				})
			}else if(type === 'position'){
				that.data.holdingList.sort((a, b) => {
					return sort === 'up' ? a.holding_position - b.holding_position : b.holding_position - a.holding_position
				})
			}else if(type === 'profit'){
				that.data.holdingList.sort((a, b) => {
					return sort === 'up' ? a.holding_profit - b.holding_profit : b.holding_profit - a.holding_profit
				})
			}else if(type === 'daily_profit'){
				that.data.holdingList.sort((a, b) => {
					return sort === 'up' ? a.dailyData.profit_loss - b.dailyData.profit_loss : b.dailyData.profit_loss - a.dailyData.profit_loss
				})
			}
			that.setData({
				holdingList: that.data.holdingList
			})
			// console.log(type, sort, that.data.sortType, that.data.holdingList);
			
		},
		toggleFundExpand(e) {
			const fundId = e.currentTarget.dataset.id;
			this.setData({
				expandedFundId: this.data.expandedFundId === fundId ? null : fundId
			});
		},
		// ? ------ 欢迎弹窗 ------
		showWelcomeDrawer() {
			var that = this;
			that.triggerEvent('toggleTabBar', { show: false }, {});
			that.setData({
				showWelcomeDrawer: true,
				welcomeStep: 1
			});
		},
		closeWelcomeDrawer() {
			var that = this;
			that.triggerEvent('toggleTabBar', { show: true }, {});
			that.setData({
				showWelcomeDrawer: false,
				welcomeStep: 1
			});
		},
		setTotalAssetsUser(e) {
			var that = this;
			that.setData({
				'userTotalInfo.total_assets_user': e.detail.value
			})
		},
		welcomeToNextStep(e) {
			var that = this;
			if(e.currentTarget.dataset.step === 1){
				that.setData({
					welcomeStep: 2
				});
			}else{
				if(that.data.userTotalInfo.total_assets_user == ''){
					wx.showToast({
						title: '请输入本金',
						icon: 'none'
					});
					return;
				}
				let total_assets_user = parseFloat(that.data.userTotalInfo.total_assets_user).toFixed(2);
				let postData = {
					total_assets_user: total_assets_user
				}
				that.setData({
					'userTotalInfo.total_assets_user': total_assets_user
				})
				utils.getData({
					url: 'auth/updateUserInfo',
					params: postData,
					success: function (res) {
						if (res.code == 200) {
							wx.setStorageSync('userInfo', res.data);
							that.setData({
								userInfo: res.data,
								showWelcomeDrawer: false,
								welcomeStep: 1,
								count: 0
							})

							that.getData();
						}
					}
				})
			}
			
		},
		updateTotalAssetsUser() {
			var that = this;
			that.triggerEvent('toggleTabBar', { show: false }, {});
			that.setData({
				welcomeStep: 2,
				showWelcomeDrawer: true
			})
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
					code: e.currentTarget.dataset.item.code,
					index_code: e.currentTarget.dataset.item.index_code
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
					code: '',
					index_code: ''
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
						that.setData({
							count: 0
						})
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
									that.setData({
										count: 0
									})
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
			
			that.setData({
				showBuySellDrawer: true,
				buySellFormData: {
					fund_id: item.id,
					transaction_type: 'buy',
					shares: '',
					net_value: '',
					amount: '',
					transaction_date: that.data.currentDate,
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
		addReduceSharesHundred(e) {
			var that = this;
			let type = e.currentTarget.dataset.type;
			let shares = that.data.buySellFormData.shares;
			if (type === 'reduce') {
				shares = shares*1 - 100;
				if (shares < 0) {
					wx.showToast({
						title: '份额不能小于0',
						icon: 'none'
					});
					return;
				}
			} else {
				shares = shares*1 + 100;
			}
			let netValue = that.data.buySellFormData.net_value;
			let amount = (parseFloat(shares) * parseFloat(netValue)).toFixed(2);
			that.setData({
				'buySellFormData.shares': shares,
				'buySellFormData.amount': amount
			});
		},
		handleBuySellInput(e) {
			var that = this;
			const field = e.currentTarget.dataset.field;
			const value = e.detail.value;
			that.setData({
				[`buySellFormData.${field}`]: value
			});

			// 如果修改了份额或现价,自动计算金额
			if (field === 'shares' || field === 'net_value') {
				let shares = that.data.buySellFormData.shares || 0;
				let netValue = that.data.buySellFormData.net_value || 0;
				let amount = (parseFloat(shares) * parseFloat(netValue)).toFixed(2);
				that.setData({
					'buySellFormData.amount': amount
				});
			}
		},
		handleTransactionTypeChange(e) {
			var that = this;
			that.setData({
				'buySellFormData.transaction_type': e.currentTarget.dataset.value
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
					title: '请输入现价',
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
						that.setData({
							count: 0
						})
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
		// ? ------ 更新盈亏 ------
		showUpdateProfitDrawer(e) {
			var that = this;
			let item = e.currentTarget.dataset.item;
			
			if (Object.keys(item.dailyData).length > 0) {
				wx.showModal({
					title: '提示',
					content: '今日已更新盈亏，是否重新更新？',
					success: (res) => {
						if (res.confirm) {
							that.triggerEvent('toggleTabBar', { show: false }, {});
							that.setData({
								showUpdateProfitDrawer: true,
								updateProfitFormData: {
									fund_id: item.id,
									current_net_value: item.dailyData.current_net_value,
									transaction_date: that.data.currentDate,
									fund_name: item.fund_name,
									profit_loss_id: item.dailyData.id,
									profit_loss_addOrUpdate: 'update'
								}
							});
						}
					}
				});
				return;
			}
			that.triggerEvent('toggleTabBar', { show: false }, {});
			that.setData({
				showUpdateProfitDrawer: true,
				updateProfitFormData: {
					fund_id: item.id,
					current_net_value: '',
					transaction_date: that.data.currentDate,
					fund_name: item.fund_name,
					profit_loss_addOrUpdate: 'add'
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
					current_net_value: '',
					transaction_date: '',
					fund_name: '',
					profit_loss_addOrUpdate: 'add'
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
		deleteUpdateProfit() {
			var that = this;
			if(that.data.updateProfitFormData.profit_loss_id == 0) {
				wx.showToast({
					title: '没有盈亏记录',
					icon: 'none'
				});
				return;
			}
			wx.showModal({
				title: '提示',
				content: '确定删除该盈亏记录吗？',
				success: (res) => {
					if (res.confirm) {
						let postData = {
							profit_loss_id: that.data.updateProfitFormData.profit_loss_id
						}
						utils.getData({
							url: 'fund/holdingShares/deleteProfitLoss',
							params: postData,
							success: (res) => {
								if (res.code === 200) {
									wx.showToast({
										title: '删除成功',
										icon: 'success'
									});
									that.closeUpdateProfitDrawer();
									that.setData({
										count: 0
									}, () => {
										that.getData();
									});
								} else {
									wx.showToast({
										title: res.message,
										icon: 'none'
									});
								}
							}
						});
					}
				}
			})
			
		},
		submitUpdateProfit() {
			var that = this;
			let formData = that.data.updateProfitFormData;
			
			if (!formData.current_net_value) {
				wx.showToast({
					title: '请输入现价',
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
			console.log(formData);
			
			
			if(formData.profit_loss_addOrUpdate === 'add'){
				utils.getData({
					url: 'fund/holdingShares/profitLoss',
					params: formData,
					success: (res) => {
						if (res.code === 200) {
							wx.showToast({
								title: '盈亏已更新',
								icon: 'success'
							});
							that.setData({
								count: 0
							})
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
			} else if (formData.profit_loss_addOrUpdate === 'update') {
				let postData = {
					profit_loss_id: formData.profit_loss_id
				}
				utils.getData({
					url: 'fund/holdingShares/deleteProfitLoss',
					params: postData,
					success: (res) => {
						if (res.code === 200) {
							utils.getData({
								url: 'fund/holdingShares/profitLoss',
								params: formData,
								success: (res) => {
									if (res.code === 200) {
										wx.showToast({
											title: '盈亏已更新',
											icon: 'success'
										});
										that.setData({
											count: 0
										})
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
		// ? ------ 跳转 ------
		toBuySellRecord(e) {
			var that = this;
			let item = e.currentTarget.dataset.item;
			that.setData({
				count: 0
			})
			wx.navigateTo({
				url: '/pages/fund/holding/record/buySell/index?fund_id=' + item.id + '&fund_name=' + item.fund_name+ '&fund_code=' + item.code,
			})
		},
		toProfitLossRecord(e) {
			var that = this;
			let item = e.currentTarget.dataset.item;
			that.setData({
				count: 0
			})
			wx.navigateTo({
				url: '/pages/fund/holding/record/profitLoss/index?fund_id=' + item.id + '&fund_name=' + item.fund_name+ '&fund_code=' + item.code,
			})
		},
		toProfitLossUserRecord(e) {
			var that = this;
			that.setData({
				count: 0
			})
			wx.navigateTo({
				url: '/pages/fund/holding/record/profitLossUser/index',
			})
		},
		toLLMAnalysis(e) {
			var that = this;
			let item = JSON.stringify(e.currentTarget.dataset.item);
			wx.navigateTo({
				url: '/pages/fund/holding/analysis/index?item=' + item,
			})
		},
		toBatchBuySell() {
			var that = this;
			wx.navigateTo({
				url: '/pages/fund/holding/batch/buysell/index',
			})
		},
		batchUpdateProfit() {
			var that = this;
			wx.navigateTo({
				url: '/pages/fund/holding/batch/profitLoss/index',
			})
		},
		
	},
  lifetimes: {
		attached: function () {
			var that = this;
			that.setData({
				tabbarRealHeight: wx.getStorageSync('tabbarRealHeight'),
				count: 0,
				userInfo: wx.getStorageSync('userInfo')
			})
			if(that.data.userInfo.total_assets_user == '0.00'){
				that.showWelcomeDrawer();
				return;
			}
			that.getData();
		}
	},
	pageLifetimes: {
		show: function () {
			var that = this;
			
			that.getData();
		}
	}

})