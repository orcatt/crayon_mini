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
    showDetailDrawer: false,
    selectedDay: null,
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
          // 将收益数据合并到日历数据中
          let calendarDays = that.data.calendarDays.map(day => {
            // 查找当前日期是否有收益数据
            const profitData = res.data.find(item => item.transaction_date === day.date);
            if (profitData) {
              return {
                ...day,
                total_profit_loss: profitData.total_profit_loss,
                profit_loss_type: parseInt(profitData.total_profit_loss) > 0 ? 1 : parseInt(profitData.total_profit_loss) < 0 ? -1 : 0,
                details: profitData.details
              };
            }else{
              return {
                ...day,
                total_profit_loss: 0,
                profit_loss_type: 0,
                details: []
              };
            }
          });

          console.log(calendarDays);
          // 计算总收益和今日收益
          let totalProfitLoss = 0;
          let todayProfitLoss = 0;
          calendarDays.forEach(day => {
            // 累加总收益
            totalProfitLoss += parseFloat(day.total_profit_loss);
            // 获取今日收益
            if(day.isToday) {
              todayProfitLoss = parseFloat(day.total_profit_loss);
            }
          });
          
          that.setData({
            calendarDays: calendarDays,
            totalProfitLoss: totalProfitLoss.toFixed(2),
            todayProfitLoss: todayProfitLoss.toFixed(2),
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

  showDayDetail(e) {
    var that = this;
    const index = e.currentTarget.dataset.index;
    const day = that.data.calendarDays[index];
    that.setData({
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
  
  onReady() {},
  onShow() {},
  onHide() {},
  onUnload() {},
  onPullDownRefresh() {},
  onReachBottom() {},
  onShareAppMessage() {},
})