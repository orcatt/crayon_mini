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
    weekDays: ['日', '一', '二', '三', '四', '五', '六'],
    calendarDays: [], // 日历天数
    totalProfitLoss: 0,
    todayProfitLoss: 0,
    todayPercent: 0,
    showType: 'profit', // 显示类型：profit-收益，percent-收益率
    showDetailDrawer: false,
    selectedDay: null
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
    console.log(that.data.currentDate);
    
    that.generateCalendar();
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
          // 将收益数据合并到日历数据中
          let calendarDays = that.data.calendarDays.map(day => {
            // 查找当前日期是否有收益数据
            const profitData = res.data.find(item => item.transaction_date === day.date);
            if (profitData) {
              return {
                ...day,
                profit_loss: profitData.profit_loss,
                price_change_percentage: profitData.price_change_percentage,
                profit_loss_type: profitData.price_change_percentage > 0 ? 1 : profitData.price_change_percentage < 0 ? -1 : 0
              };
            }else{
              return {
                ...day,
                profit_loss: '0.00',
                price_change_percentage: 0,
                profit_loss_type: 0
              };
            }
          });

          // 计算总收益和今日收益
          let totalProfitLoss = 0;
          let todayProfitLoss = 0;
          let todayPercent = 0;
          calendarDays.forEach(day => {
            // 累加总收益
            totalProfitLoss += parseFloat(day.profit_loss);
            
            // 获取今日收益
            if(day.isToday) {
              todayProfitLoss = parseFloat(day.profit_loss);
              todayPercent = day.price_change_percentage;
            }
          });
          
          that.setData({
            calendarDays: calendarDays,
            totalProfitLoss: totalProfitLoss.toFixed(2),
            todayProfitLoss: todayProfitLoss.toFixed(2),
            todayPercent: todayPercent.toFixed(2)
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
  handleMonthChange(e) {
    var that = this;
    that.setData({
      currentMonth: e.detail.value
    }, () => {
      that.generateCalendar();
    });
  },
  onReady() {},
  onShow() {},
  onHide() {},
  onUnload() {},
  onPullDownRefresh() {},
  onReachBottom() {},
  onShareAppMessage() {},
  
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
  switchShowType(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      showType: type
    });
  },
  showDayDetail(e) {
    const index = e.currentTarget.dataset.index;
    const day = this.data.calendarDays[index];
    this.setData({
      showDetailDrawer: true,
      selectedDay: day
    });
    console.log(day);
  },
  closeDetailDrawer() {
    this.setData({
      showDetailDrawer: false,
      selectedDay: null
    });
  },
  // deleteRecord() {
  //   var that = this;
  //   let postData = {
  //     profit_loss_id: that.data.selectedDay.profit_loss_id
  //   }
  //   utils.getData({
  //     url: 'fund/holdingShares/deleteProfitLoss',
  //     params: postData,
  //     success: (res) => {
  //       if (res.code === 200) {
  //         wx.showToast({
  //           title: res.message,
  //           icon: 'success'
  //         });
  //         that.closeBuySellDrawer();
  //         that.getData();
  //       } else {
  //         wx.showToast({
  //           title: res.message,
  //           icon: 'none'
  //         });
  //       }
  //     }
  //   });
  // }
})