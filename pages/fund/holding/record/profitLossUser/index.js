// pages/explore/tools/dict/index.js
var utils = require('../../../../../api/util.js');

Page({
  data: {
		tabbarRealHeight: 0,
    currentMonth: '',
    currentDate: '',
    weekDays: ['日', '一', '二', '三', '四', '五', '六'],
    calendarDays: [], // 日历天数
    totalProfitLoss: 0,
    todayProfitLoss: 0,
    selectedDay: null,
    showDetailDrawer: false,
    selectedItem: null,
    showUpdateProfitDrawer: false,
    updateProfitFormData: {
			fund_id: '',
			current_net_value: '',
			transaction_date: '',
			fund_name: '', // 用于显示
      profit_loss_id: '',
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
      currentMonth: `${year}-${month}`,
      currentDate: `${year}-${month}-${day}`
		})
    
    that.generateCalendar();
  },
  getData() {
    var that = this;
    let postData = {
      transaction_date: that.data.currentMonth,
    }
    utils.getData({
      url: 'fund/holdingShares/userProfitList',
      params: postData,
      success: (res) => {
        if (res.code === 200) {
          // 将盈亏数据合并到日历数据中
          let calendarDays = that.data.calendarDays.map(day => {
            // 查找当前日期是否有盈亏数据
            const profitData = res.data.find(item => item.transaction_date === day.date);
            if (profitData) {
              profitData.details.forEach(item => {
                item.current_net_value = parseFloat(item.current_net_value).toFixed(3);
              });
              return {
                ...day,
                total_profit_loss: profitData.total_profit_loss,
                profit_loss_noSet: parseInt(profitData.total_profit_loss) > 0 ? 1 : parseInt(profitData.total_profit_loss) < 0 ? -1 : 0,
                details: profitData.details
              };
            }else{
              return {
                ...day,
                total_profit_loss: 0,
                profit_loss_noSet: 0,
                details: []
              };
            }
          });

          // 计算总盈亏和今日盈亏
          let totalProfitLoss = 0;
          let todayProfitLoss = 0;
          let selectedDay = null;
          calendarDays.forEach(day => {
            // 累加总计盈亏
            totalProfitLoss += parseFloat(day.total_profit_loss);
            // 获取今日盈亏
            if(day.isToday) {
              todayProfitLoss = parseFloat(day.total_profit_loss);
              selectedDay = day;
            }
          });
          
          that.setData({
            calendarDays: calendarDays,
            totalProfitLoss: totalProfitLoss.toFixed(2),
            todayProfitLoss: todayProfitLoss.toFixed(2),
            selectedDay: selectedDay,
          });
          console.log(calendarDays);
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
    that.getData();
  },
  
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  showAllHoldingProfit(e) {
    var that = this;
    const index = e.currentTarget.dataset.index;
    const day = that.data.calendarDays[index];
    
    if (day.details && day.details.length > 0) {
      that.setData({
        selectedDay: day
      });
    }else{
      that.setData({
        selectedDay: null
      });
    }
  },
  showUpdateProfitDrawer(e) {
    var that = this;
    const item = e.currentTarget.dataset.item;
    that.setData({
      showUpdateProfitDrawer: true,
      selectedItem: item,
      updateProfitFormData: {
        fund_id: item.fund_id,
        current_net_value: item.current_net_value,
        transaction_date: that.data.selectedDay.date,
        fund_name: item.fund_name,
        profit_loss_id: item.id,

      }
    });
    
  },
  closeUpdateProfitDrawer() {
    this.setData({
      showUpdateProfitDrawer: false,
      selectedItem: null,
      updateProfitFormData: {
        fund_id: '',
        current_net_value: '',
        transaction_date: '',
        fund_name: '',
        profit_loss_id: '',
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
    wx.showToast({
      title: '日期不能修改',
      icon: 'none'
    });
  },
  deleteUpdateProfit() {
    var that = this;
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

    utils.getData({
      url: 'fund/holdingShares/deleteProfitLoss',
      params: {
        profit_loss_id: that.data.updateProfitFormData.profit_loss_id
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
  },
  onReady() {},
  onShow() {},
  onHide() {},
  onUnload() {},
  onPullDownRefresh() {},
  onReachBottom() {},
  onShareAppMessage() {},
})