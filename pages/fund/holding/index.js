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
			total_assets_user: '', // 总资产
			total_market_value_user: '', // 总市值
			available_user: '', // 可用
			total_profit_user_today: '', // 当日总盈亏
			total_profit_user: '', // 总盈亏
			holding_position_user: '', // 仓位
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
		transactionTypes: ['buy', 'sell'],
		showUpdateProfitDrawer: false,
		updateProfitFormData: {
			fund_id: '',
			price_change_percentage: '',
			transaction_date: '',
			fund_name: '', // 用于显示
			profit_loss_type: true, // 盈亏
			profit_loss_addOrUpdate: 'add' // 盈亏类型
		},
		count: 0
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
							total_assets_user: that.data.userInfo.total_assets_user, // 总资产
							total_market_value_user: 0, // 总市值
							available_user: 0, // 可用
							total_profit_user_today: 0, // 当日总盈亏
							total_profit_user: 0, // 总盈亏
							holding_position_user: 0, // 仓位
						}
						
						res.data.forEach(item => {
							item.current_net_value = ((1 + item.holding_profit_rate) * item.holding_cost).toFixed(4)
							item.holding_profit_rate_percentage = (item.holding_profit_rate * 100).toFixed(2)
							item.total_profit_rate_percentage = (item.total_profit_rate * 100).toFixed(2)
							userTotalInfo.total_market_value_user += item.holding_amount*1
							userTotalInfo.total_profit_user_today += item.dailyData.profit_loss*1
							userTotalInfo.total_profit_user += item.holding_profit*1
						})
						userTotalInfo.total_market_value_user = parseFloat(userTotalInfo.total_market_value_user).toFixed(2)
						userTotalInfo.total_profit_user_today = parseFloat(userTotalInfo.total_profit_user_today).toFixed(2)
						userTotalInfo.total_profit_user = parseFloat(userTotalInfo.total_profit_user).toFixed(2)
						userTotalInfo.available_user = parseFloat((userTotalInfo.total_assets_user*1 - userTotalInfo.total_market_value_user*1)).toFixed(2)
						userTotalInfo.holding_position_user = parseFloat((userTotalInfo.total_market_value_user*1 / userTotalInfo.total_assets_user * 100)).toFixed(2)
						console.log(userTotalInfo);
						
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
		// ? ------ 更新收益 ------
		showUpdateProfitDrawer(e) {
			var that = this;
			let item = e.currentTarget.dataset.item;
			
			if (Object.keys(item.dailyData).length > 0) {
				wx.showModal({
					title: '提示',
					content: '今日已更新收益，是否重新更新？',
					success: (res) => {
						if (res.confirm) {
							that.triggerEvent('toggleTabBar', { show: false }, {});
							that.setData({
								showUpdateProfitDrawer: true,
								updateProfitFormData: {
									fund_id: item.id,
									price_change_percentage: item.dailyData.price_change_percentage,
									transaction_date: that.data.currentDate,
									fund_name: item.fund_name,
									profit_loss_id: item.dailyData.id,
									profit_loss_type: item.dailyData.profit_loss > 0 ? true : false,
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
					price_change_percentage: '',
					transaction_date: that.data.currentDate,
					fund_name: item.fund_name,
					profit_loss_type: true,
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
					price_change_percentage: '',
					transaction_date: '',
					fund_name: '',
					profit_loss_type: true,
					profit_loss_addOrUpdate: 'add'
				}
			});
		},
		handleProfitSwitch(e) {
			var that = this;
			const profit_loss_type = e.currentTarget.dataset.value;
			let price_change_percentage = profit_loss_type ? 
				Math.abs(parseFloat(that.data.updateProfitFormData.price_change_percentage)) : 
				-Math.abs(parseFloat(that.data.updateProfitFormData.price_change_percentage));
			that.setData({
				'updateProfitFormData.profit_loss_type': profit_loss_type,
				'updateProfitFormData.price_change_percentage': price_change_percentage
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
			} else if (formData.price_change_percentage == 0) {
				wx.showToast({
					title: '盈亏率不能为0',
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

			// 盈利正数，亏损负数
			formData.price_change_percentage = formData.profit_loss_type ? 
      Math.abs(parseFloat(formData.price_change_percentage)) : 
      -Math.abs(parseFloat(formData.price_change_percentage));
			that.setData({
				'updateProfitFormData.price_change_percentage': formData.price_change_percentage
			});
			
			if(formData.profit_loss_addOrUpdate === 'add'){
				utils.getData({
					url: 'fund/holdingShares/profitLoss',
					params: formData,
					success: (res) => {
						if (res.code === 200) {
							wx.showToast({
								title: formData.profit_loss_type ? '盈利已更新' : '亏损已更新',
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
											title: formData.profit_loss_type ? '盈利已更新' : '亏损已更新',
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
		}
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