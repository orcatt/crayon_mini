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
  },
  onLoad(options) {
		var that = this;
    let now = new Date();
    let year = now.getFullYear();
    let month = (now.getMonth() + 1).toString().padStart(2, '0'); // 月份加 1 并补零
    
		that.setData({
			tabbarRealHeight: wx.getStorageSync('tabbarRealHeight'),
      fund_name: options.fund_name,
      fund_id: options.fund_id,
      fund_code: options.fund_code,
      currentMonth: `${year}-${month}`
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
      url: 'fund/holdingShares/profitList',
      params: postData,
      success: (res) => {
        if (res.code === 200) {
          res.data.forEach(item => {
            item.profit_loss_type = item.price_change_percentage > 0 ? true : false;
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
  handleRecordDelete(e) {
    var that = this;
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
  },
  onReady() {},
  onShow() {},
  onHide() {},
  onUnload() {},
  onPullDownRefresh() {},
  onReachBottom() {},
  onShareAppMessage() {},
  
})