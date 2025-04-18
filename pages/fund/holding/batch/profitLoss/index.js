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
    updateProfitFormData: [],
  },
  onLoad(options) {
    var that = this;
    let today = new Date();
    let year = today.getFullYear();
    let month = String(today.getMonth() + 1).padStart(2, '0');
    let day = String(today.getDate()).padStart(2, '0');
    let currentDate = `${year}-${month}-${day}`;
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
          let updateProfitFormData = []
          let stock_codes_list = []
          res.data.forEach(item => {
            item.holding_cost = parseFloat(item.holding_cost).toFixed(3)
            item.current_net_value = ((1 + item.holding_profit_rate) * item.holding_cost).toFixed(3)
            item.holding_profit_rate_percentage = (item.holding_profit_rate * 100).toFixed(2)
            item.holding_shares = parseFloat(item.holding_shares).toFixed(0)
            
            let buySellObj = {
              fund_id: item.id,
              code: item.code,
              current_net_value: '',
              transaction_date: that.data.currentDate
            }
            updateProfitFormData.push(buySellObj)
            stock_codes_list.push(item.code)
          })
          that.setData({
            holdingList: res.data,
            updateProfitFormData: updateProfitFormData,
          })
          that.getTodayMarketList(stock_codes_list)
        } else {
          wx.showToast({
            title: res.message,
            icon: 'none'
          });
        }
      }
    });
  },
  getTodayMarketList(stock_codes_list) {
    var that = this;
    let postData = {
      market_date: that.data.currentDate,
      stock_codes_list: stock_codes_list
    }
    utils.getData({
      url: 'stocks/todayMarket',
      params: postData,
      success: (res) => {
        if (res.code === 200) {
          const list = [];
          const keyMap = {
            "开盘": "open",
            "成交量": "volume",
            "成交额": "turnover",
            "振幅": "amplitude",
            "换手率": "turnover_rate",
            "收盘": "close",
            "日期": "date",
            "最低": "low",
            "最高": "high",
            "涨跌幅": "change_percentage",
            "涨跌额": "change_amount",
            "股票代码": "stock_code",
            "股票名称": "stock_name"
          };

          res.data.list.forEach(item => {
            const newItem = {};
            for (const [key, value] of Object.entries(item)) {
              const newKey = keyMap[key] || key;
              newItem[newKey] = value;
            }
            list.push(newItem);
          });
          
          // 如果list中存在stock_code与updateProfitFormData中的code相同，则将current_net_value赋值为close
          that.data.updateProfitFormData.forEach(lis => {
            const stock = list.find(item => item.stock_code === lis.code);
            if (stock) {
              lis.current_net_value = stock.close;
            }
          });
          that.setData({
            updateProfitFormData: that.data.updateProfitFormData
          });
          wx.showToast({
            title: '当日市值已获取',
            icon: 'success'
          });
          console.log(that.data.updateProfitFormData);
        }
      }
    })
  },
  handleProfitInput(e) {
    var that = this;
    const field = e.currentTarget.dataset.field;
    const fundId = e.currentTarget.dataset.fundid;
    let updateProfitFormData = that.data.updateProfitFormData;
    let fundIndex = updateProfitFormData.findIndex(item => item.fund_id === fundId);
    updateProfitFormData[fundIndex][field] = e.detail.value;

    // 如果修改了份额或现价,自动计算金额
    if (field === 'shares' || field === 'net_value') {
      let shares = updateProfitFormData[fundIndex].shares || 0;
      let netValue = updateProfitFormData[fundIndex].net_value || 0;
      let amount = (parseFloat(shares) * parseFloat(netValue)).toFixed(2);
      updateProfitFormData[fundIndex].amount = amount;
    }
    that.setData({
      updateProfitFormData: updateProfitFormData
    });
    console.log(updateProfitFormData);
    
  },
  removeFund(e) {
    var that = this;
    let fundIndex = that.data.holdingList.findIndex(item => item.id === e.currentTarget.dataset.id);
    let updateProfitFormData = that.data.updateProfitFormData;
    updateProfitFormData.splice(fundIndex, 1);

    let holdingList = that.data.holdingList;
    holdingList.splice(fundIndex, 1);
    that.setData({
      holdingList: holdingList,
      updateProfitFormData: updateProfitFormData
    });
    console.log(updateProfitFormData);
  },
  submitBatch(e) {
    var that = this;

    // 检查现价数据是否完整
    let dataCheck = true;
    that.data.updateProfitFormData.forEach((item) => {
      if (item.current_net_value === '' || !item.current_net_value) {
        dataCheck = false;
      }
    });
    if (!dataCheck) {
      wx.showToast({
        title: '现价数据不完整',
        icon: 'none'
      });
      return;
    }

    // 检查盈亏记录是否存在
    let profit_loss_id_list = [];
    let profit_existence_fundlist = [];
    that.data.holdingList.forEach(item => {
      if (item.dailyData && item.dailyData.id) {
        profit_loss_id_list.push(item.dailyData.id);
        profit_existence_fundlist.push(item.id);
      }
    });
    if (profit_loss_id_list.length > 0) {
      wx.showModal({
        title: '提示',
        content: '是否重置已存在的盈亏记录？',
        cancelText: '否',
        confirmText: '是',
        success: (res) => {
          if (res.confirm) {
            profit_loss_id_list.forEach(item => {
              that.deleteUpdateProfit(item);
            });
            that.getData();

          }else{
            profit_existence_fundlist.forEach(item => {
              let updateProfitFormData = that.data.updateProfitFormData;
              let holdingList = that.data.holdingList;
              let fundIndex = holdingList.findIndex(lis => lis.id === item);
              holdingList.splice(fundIndex, 1);
              updateProfitFormData.splice(fundIndex, 1);
              that.setData({
                holdingList: holdingList,
                updateProfitFormData: updateProfitFormData
              });
            });
          }
        }
      });
      return;
    }

    console.log('预提交数据',that.data.updateProfitFormData);
    utils.getData({
      url: 'fund/holdingShares/batchProfitLoss',
      params: that.data.updateProfitFormData,
      success: (res) => {
        if (res.code === 200) {
          wx.showToast({
            title: res.message,
            icon: 'success'
          });
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
  deleteUpdateProfit(profit_loss_id) {
    var that = this;
    let postData = {
      profit_loss_id: profit_loss_id
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