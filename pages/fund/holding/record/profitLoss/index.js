// pages/explore/tools/dict/index.js
var utils = require('../../../../../api/util.js');

Page({
  data: {
		tabbarRealHeight: 0,
    fund_name: '',
    fund_id: '',
    fund_code: '',
    currentMonth: '',
    currentDate: '',
    weekDays: ['日', '一', '二', '三', '四', '五', '六'],
    calendarDays: [], // 日历天数
    totalProfitLoss: 0,
    showType: 'profit', // 显示类型：profit-盈亏，percent-盈亏率
    selectedDay: null,
    showUpdateProfitDrawer: false,
    updateProfitFormData: {
      fund_id: '',
      current_net_value: '',
      transaction_date: '',
      fund_name: '',
      profit_loss_addOrUpdate: 'add',
      
    }
  },
  onLoad(options) {
		var that = this;
    let now = new Date();
    let year = now.getFullYear();
    let month = (now.getMonth() + 1).toString().padStart(2, '0'); // 月份加 1 并补零
    let day = now.getDate();
		that.setData({
			tabbarRealHeight: wx.getStorageSync('tabbarRealHeight'),
      fund_name: options.fund_name,
      fund_id: options.fund_id,
      fund_code: options.fund_code,
      currentMonth: `${year}-${month}`,
      currentDate: `${year}-${month}-${day}`
		})
    
    that.generateCalendar();
  },
  
  handleMonthChange(e) {
    var that = this;
    that.setData({
      currentMonth: e.detail.value
    }, () => {
      that.generateCalendar();
    });
  },
  
  // 生成日历数据
  generateCalendar() {
    const that = this;
    const [year, month] = that.data.currentMonth.split('-');
    const firstDay = new Date(year, month - 1, 1); // 当月第一天
    const lastDay = new Date(year, month, 0); // 当月最后一天
    
    const days = [];
    const firstDayWeek = firstDay.getDay(); // 第一天是星期几
    const totalDays = lastDay.getDate(); // 当月总天数
    
    // 填充当月日期
    for (let i = 1; i <= totalDays; i++) {
      const currentDate = `${year}-${month.padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({
        day: i,
        week: (firstDayWeek + i - 1) % 7,
        date: currentDate,
        isToday: currentDate === that.data.currentDate
      });
    }
    
    that.setData({ calendarDays: days });
    that.getTodayMarket(days[0].date,days[days.length - 1].date);
  },
  
  getTodayMarket(start_date,end_date) {
    var that = this;
    let postData = {
      start_date: start_date,
      end_date: end_date,
      stock_code: that.data.fund_code
    }
    utils.getData({
      url: 'stocks/tradeList',
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
          // 将价格数据合并到日历数据中
          let calendarDays = that.data.calendarDays.map(day => {
            const priceData = list.find(item => item.date === day.date);
            if (priceData) {
              return {
                ...day,
                market_info: priceData
              };
            }else{
              return {
                ...day,
                market_info: null
              };
            }
          });
          that.setData({
            calendarDays: calendarDays
          })
          
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
          // 将盈亏数据合并到日历数据中
          let calendarDays = that.data.calendarDays.map(day => {
            // 查找当前日期是否有盈亏数据
            const profitData = res.data.find(item => item.transaction_date === day.date);
            if (profitData) {
              return {
                ...day,
                profit_loss_id: profitData.id,
                profit_loss: profitData.profit_loss,
                current_net_value: parseFloat(profitData.current_net_value).toFixed(3),
              };
            }else{
              return {
                ...day,
                profit_loss_id: 0,
                profit_loss: '0.00',
                current_net_value: '0.000',
              };
            }
          });
          // 计算总盈亏和今日盈亏
          let totalProfitLoss = 0;
          let selectedDay = {};
          calendarDays.forEach(day => {
            // 累加总盈亏
            totalProfitLoss += parseFloat(day.profit_loss);
            if(day.isToday) {
              selectedDay = day;
            }
          });
          console.log(calendarDays);
          that.setData({
            calendarDays: calendarDays,
            totalProfitLoss: totalProfitLoss.toFixed(2),
            selectedDay: selectedDay
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
  switchShowType(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      showType: type
    });
  },
  updateSelectedDay(e) {
    var that = this;
    const index = e.currentTarget.dataset.index;
    const day = that.data.calendarDays[index];
    if(day.profit_loss_id != 0) { // 有盈亏记录，查看/更新/删除
      that.setData({
        selectedDay: day,
        updateProfitFormData: {
          fund_id: that.data.fund_id,
          current_net_value: day.current_net_value,
          transaction_date: day.date,
          fund_name: that.data.fund_name,
          profit_loss_id: day.profit_loss_id,
          profit_loss_addOrUpdate: 'update'
        }
      });
      
    }else{ // 没有盈亏记录，新增
      that.setData({
        selectedDay: day,
        updateProfitFormData: {
          fund_id: that.data.fund_id,
          current_net_value: '',
          transaction_date: day.date,
          fund_name: that.data.fund_name,
          profit_loss_addOrUpdate: 'add'
        }
      });
    }
  },
  showUpdateProfitDrawer(e) {
    var that = this;
    const index = e.currentTarget.dataset.index;
    const day = that.data.calendarDays[index];
    
    if(day.profit_loss_id != 0) { // 有盈亏记录，查看/更新/删除
      that.setData({
        showUpdateProfitDrawer: true,
        selectedDay: day,
        updateProfitFormData: {
          fund_id: that.data.fund_id,
          current_net_value: day.current_net_value,
          transaction_date: day.date,
          fund_name: that.data.fund_name,
          profit_loss_id: day.profit_loss_id,
          profit_loss_addOrUpdate: 'update'
        }
      });
      
    }else{ // 没有盈亏记录，新增
      that.setData({
        showUpdateProfitDrawer: true,
        selectedDay: day,
        updateProfitFormData: {
          fund_id: that.data.fund_id,
          current_net_value: '',
          transaction_date: day.date,
          fund_name: that.data.fund_name,
          profit_loss_addOrUpdate: 'add'
        }
      });
    }
  },
  closeUpdateProfitDrawer() {
    var that = this;
    that.setData({
      showUpdateProfitDrawer: false,
      selectedDay: null,
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
    if(that.data.selectedDay.profit_loss_id == 0) {
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
            profit_loss_id: that.data.selectedDay.profit_loss_id
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

    
    if(that.data.selectedDay.profit_loss_id != 0) { // 有盈亏记录，更新
      utils.getData({
        url: 'fund/holdingShares/deleteProfitLoss',
        params: {
          profit_loss_id: that.data.selectedDay.profit_loss_id
        },
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
    }else{ // 无盈亏记录，新增
      utils.getData({
        url: 'fund/holdingShares/profitLoss',
        params: formData,
        success: (res) => {
          if (res.code === 200) {
            wx.showToast({
              title: '盈亏已更新',
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
  
  onReady() {},
  onShow() {},
  onHide() {},
  onUnload() {},
  onPullDownRefresh() {},
  onReachBottom() {},
  onShareAppMessage() {},
})