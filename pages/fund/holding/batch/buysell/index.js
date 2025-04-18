// pages/explore/tools/dict/index.js
var utils = require('../../../../../api/util.js');

Page({
  data: {
    tabbarRealHeight: 0,
    currentDate: '',
    holdingList: [],
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
    buySellFormDataList: [],
  },
  onLoad(options) {
    var that = this;
    let today = new Date();
    let year = today.getFullYear();
    let month = String(today.getMonth() + 1).padStart(2, '0');
    let day = String(today.getDate()).padStart(2, '0');
    let currentDate = `${year}-${month}-${day}`;
    that.setData({
    })

    that.setData({
      tabbarRealHeight: wx.getStorageSync('tabbarRealHeight'),
      currentDate: currentDate,

    })
    that.getData();


  },
  handleDateChange(e) {
    var that = this;
    that.setData({
      currentDate: e.detail.value
    })
    that.getData();
  },
  getData() {
    var that = this;
    let postData = {
      transaction_date: that.data.currentDate,
    }
    utils.getData({
      url: 'fund/holdingShares/list',
      params: postData,
      success: (res) => {
        if (res.code === 200) {
          let buySellFormDataList = []
          res.data.forEach(item => {
            item.holding_cost = parseFloat(item.holding_cost).toFixed(3)
            item.current_net_value = ((1 + item.holding_profit_rate) * item.holding_cost).toFixed(3)
            item.holding_profit_rate_percentage = (item.holding_profit_rate * 100).toFixed(2)
            item.holding_shares = parseFloat(item.holding_shares).toFixed(0)
            
            let buySellObj = {
                fund_id: item.id,
                transaction_type: 'buy',
                shares: '',
                net_value: '',
                amount: '',
                transaction_date: that.data.currentDate
            }
            buySellFormDataList.push(buySellObj)
          })
          that.setData({
            holdingList: res.data,
            buySellFormDataList: buySellFormDataList
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
  handleTransactionTypeChange(e) {
    var that = this;
    let fundIndex = that.data.holdingList.findIndex(item => item.id === e.currentTarget.dataset.fundid);
    let buySellFormDataList = that.data.buySellFormDataList;
    buySellFormDataList[fundIndex].transaction_type = e.currentTarget.dataset.value;
    
    that.setData({
      buySellFormDataList: buySellFormDataList
    });
  },
  
  addReduceSharesHundred(e) {
    var that = this;
    let type = e.currentTarget.dataset.type;
    let fundId = e.currentTarget.dataset.fundid;
    let buySellFormDataList = that.data.buySellFormDataList;
    let fundIndex = buySellFormDataList.findIndex(item => item.fund_id === fundId);
    let shares = buySellFormDataList[fundIndex].shares;
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
    
    let netValue = buySellFormDataList[fundIndex].net_value;
    let amount = (parseFloat(shares) * parseFloat(netValue)).toFixed(2);
    buySellFormDataList[fundIndex].shares = shares;
    buySellFormDataList[fundIndex].amount = amount;
    
    that.setData({
      buySellFormDataList: buySellFormDataList
    });
  },
  handleBuySellInput(e) {
    var that = this;
    const field = e.currentTarget.dataset.field;
    const fundId = e.currentTarget.dataset.fundid;
    let buySellFormDataList = that.data.buySellFormDataList;
    let fundIndex = buySellFormDataList.findIndex(item => item.fund_id === fundId);
    buySellFormDataList[fundIndex][field] = e.detail.value;

    // 如果修改了份额或现价,自动计算金额
    if (field === 'shares' || field === 'net_value') {
      let shares = buySellFormDataList[fundIndex].shares || 0;
      let netValue = buySellFormDataList[fundIndex].net_value || 0;
      let amount = (parseFloat(shares) * parseFloat(netValue)).toFixed(2);
      buySellFormDataList[fundIndex].amount = amount;
    }
    that.setData({
      buySellFormDataList: buySellFormDataList
    });
    console.log(buySellFormDataList);
    
  },
  removeFund(e) {
    var that = this;
    let fundIndex = that.data.holdingList.findIndex(item => item.id === e.currentTarget.dataset.id);
    let buySellFormDataList = that.data.buySellFormDataList;
    buySellFormDataList.splice(fundIndex, 1);

    let holdingList = that.data.holdingList;
    holdingList.splice(fundIndex, 1);
    that.setData({
      holdingList: holdingList,
      buySellFormDataList: buySellFormDataList
    });
    console.log(buySellFormDataList);
  },
  submitBatch(e) {
    var that = this;
    utils.getData({
      url: 'fund/holdingTransactions/batch',
      params: that.data.buySellFormDataList,
      success: (res) => {
        if (res.code === 200) {
          wx.showToast({
            title: res.message,
            icon: 'success'
          });
        } else {
          wx.showToast({
            title: res.message,
            icon: 'none'
          });
        }
      }
    });
  },
  onReady() { },
  onShow() { },
  onHide() { },
  onUnload() { },
  onPullDownRefresh() { },
  onReachBottom() { },
  onShareAppMessage() { }
})