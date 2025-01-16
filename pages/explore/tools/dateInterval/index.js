// pages/explore/tools/dict/index.js
Page({
  data: {
		tabbarRealHeight: 0,
    startDate: '',
    endDate: '',
    daysDiff: null,
    startTime: '',
    endTime: '',
    timeResult: null
  },
  onLoad(options) {
		var that = this;
		that.setData({
			tabbarRealHeight: wx.getStorageSync('tabbarRealHeight')
		})

  },
  
  // 计算日期差
  calculateDaysDiff() {
    const { startDate, endDate } = this.data;
    if (!startDate || !endDate) return;

    let start = new Date(startDate);
    let end = new Date(endDate);
    
    // 如果结束日期在开始日期之前，交换两个日期
    if (end < start) {
      // 交换日期对象
      [start, end] = [end, start];
      // 同时更新显示的日期字符串
      this.setData({
        startDate: endDate,
        endDate: startDate
      });
    }
    
    // 将时间设置为当天的0点，避免时区影响
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    
    // 计算天数差（排除开始日期，包括结束日期）
    const diffTime = end - start;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    this.setData({
      daysDiff: diffDays
    });
  },

  // 开始日期变化
  onStartDateChange(e) {
    this.setData({
      startDate: e.detail.value
    }, () => {
      this.calculateDaysDiff();
    });
  },

  // 结束日期变化
  onEndDateChange(e) {
    this.setData({
      endDate: e.detail.value
    }, () => {
      this.calculateDaysDiff();
    });
  },

  // 计算时间差
  calculateTimeDiff() {
    const { startTime, endTime } = this.data;
    if (!startTime || !endTime) return;

    // 将时间转换为分钟
    const getMinutes = (timeStr) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };

    let startMinutes = getMinutes(startTime);
    let endMinutes = getMinutes(endTime);
    let totalMinutes;
    let crossMidnight = false;

    // 判断是否跨午夜
    if (endMinutes < startMinutes) {
      // 跨午夜情况：加上一天的分钟数
      totalMinutes = (24 * 60 - startMinutes) + endMinutes;
      crossMidnight = true;
    } else {
      totalMinutes = endMinutes - startMinutes;
    }

    // 转换为小时和分钟
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    this.setData({
      timeResult: {
        hours,
        minutes,
        crossMidnight
      }
    });
  },

  // 开始时间变化
  onStartTimeChange(e) {
    this.setData({
      startTime: e.detail.value
    }, () => {
      this.calculateTimeDiff();
    });
  },

  // 结束时间变化
  onEndTimeChange(e) {
    this.setData({
      endTime: e.detail.value
    }, () => {
      this.calculateTimeDiff();
    });
  },
  onReady() {},
  onShow() {},
  onHide() {},
  onUnload() {},
  onPullDownRefresh() {},
  onReachBottom() {},
  onShareAppMessage() {}
})
