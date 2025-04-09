// pages/explore/tools/dict/index.js
var utils = require('../../../../../api/util.js');

Page({
  data: {
		tabbarRealHeight: 0,
    fund_name: '',
    fund_id: '',
    fund_code: '',
    buySellList: [],
    currentMonth: '',
    currentDate: '',
    
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
  },
  onLoad(options) {
		var that = this;
    let now = new Date();
    let year = now.getFullYear();
    let month = (now.getMonth() + 1).toString().padStart(2, '0'); // 月份加 1 并补零
    let day = String(now.getDate()).padStart(2, '0');
    
		that.setData({
			tabbarRealHeight: wx.getStorageSync('tabbarRealHeight'),
      fund_name: options.fund_name,
      fund_id: options.fund_id,
      fund_code: options.fund_code,
      currentMonth: `${year}-${month}`,
      currentDate: `${year}-${month}-${day}`
		})
    that.getData();
  },
  getData() {
    var that = this;
    let postData = {
      fund_id: that.data.fund_id,
      transaction_date: that.data.currentMonth,
    }
    utils.getData({
      url: 'fund/holdingTransactions/list',
      params: postData,
      success: (res) => {
        if (res.code === 200) {
          res.data.forEach(item => {
            item.shares = parseInt(item.shares).toFixed(2);
          })
          that.setData({
            buySellList: res.data
          })
        } else {
          wx.showToast({
            title: res.message,
            icon: 'none'
          });
        }
      }
    });
  },
  handleMonthChange(e) {
    var that = this;
    that.setData({
      currentMonth: e.detail.value
    }, () => {
      that.getData(); // 重新获取数据
    });
  },
  openCloseRecordMovable(e) {
    var that = this;
    let index = e.currentTarget.dataset.index;
    let buySellList = [...that.data.buySellList];
    if (buySellList[index].x == -180) {
      buySellList.forEach(item => {
        item.x = 0;
      });
    } else {
      buySellList.forEach((item, idx) => {
        item.x = idx === index ? -180 : 0;
      });
    }
    that.setData({
      buySellList: buySellList
    });
  },
  closeRecordMovable() {
    var that = this;
    let buySellList = [...that.data.buySellList];
    buySellList.forEach(item => {
      item.x = 0;
    });
    that.setData({
      buySellList: buySellList
    });
  },
  handleRecordDelete(e) {
    var that = this;
    wx.showModal({
      title: '提示',
      content: '是否删除该交易记录？',
      success: (res) => {
        if (res.confirm) {
          utils.getData({
            url: 'fund/holdingTransactions/delete',
            params: {
              transaction_id: e.currentTarget.dataset.id
            },
            success: (res) => {
              if (res.code === 200) {
                wx.showToast({
                  title: '删除成功',
                  icon: 'none'
                });
                that.getData();
              }
            }
          });
        } else {
          that.closeRecordMovable();
        }
      }
    });
    
  },
  // ? ------ 买入卖出 ------
  showBuySellDrawer() {
    var that = this;
    that.setData({
      showBuySellDrawer: true,
      buySellFormData: {
        fund_id: that.data.fund_id,
        transaction_type: 'buy',
        shares: '',
        net_value: '',
        amount: '',
        transaction_date: that.data.currentDate,
        fund_name: that.data.fund_name
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
      'buySellFormData.transaction_type': this.data.transactionTypes[e.detail.value].value
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
  onReady() {},
  onShow() {},
  onHide() {},
  onUnload() {},
  onPullDownRefresh() {},
  onReachBottom() {},
  onShareAppMessage() {},
  
})