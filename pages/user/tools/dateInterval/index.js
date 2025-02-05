// pagesusertools/dict/index.js
Page({
  data: {
		tabbarRealHeight: 0,
    activeIndex: 0,
		tabsList: [{
			id: 0,
			title: '间隔'
		},{
			id:1,
			title: '推算'
		}],
    startDate: '',
    endDate: '',
    daysDiff: null,
    startTime: '',
    endTime: '',
    timeResult: null,
    baseDate: '',
    dateDirection: 'after',
    daysToCalculate: '',
    calculatedDate: null,
    baseTime: '',
    timeDirection: 'after',
    hoursToCalculate: '',
    calculatedTime: null
  },
  onLoad(options) {
		var that = this;
		that.setData({
			tabbarRealHeight: wx.getStorageSync('tabbarRealHeight')
		})

  },
  changeTabs(e) {
		const id = e.currentTarget.dataset.id;
		// 先设置缩小动画
		this.setData({
			activeIndex: -1
		});
		// 短暂延迟后设置新的选中状态，触发放大动画
		setTimeout(() => {
			this.setData({
				activeIndex: id
			});
		}, 50);
	},
	// 滑动切换事件处理
	handleSwiper(e) {
		this.setData({
			activeIndex: e.detail.current
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

  // 新增方法：计算日期推算
  calculateDateResult() {
    const { baseDate, dateDirection, daysToCalculate } = this.data;
    if (!baseDate || !daysToCalculate) return;

    const date = new Date(baseDate);
    const days = parseInt(daysToCalculate);
    
    if (dateDirection === 'after') {
      date.setDate(date.getDate() + days);
    } else {
      date.setDate(date.getDate() - days);
    }

    const resultDate = date.toISOString().split('T')[0];
    
    this.setData({
      calculatedDate: resultDate
    });
  },

  // 基准日期变化
  onBaseDateChange(e) {
    this.setData({
      baseDate: e.detail.value
    }, () => {
      this.calculateDateResult();
    });
  },

  // 日期方向变化
  onDateDirectionChange(e) {
    const index = parseInt(e.detail.value);
    this.setData({
      dateDirection: index === 0 ? 'after' : 'before'
    }, () => {
      this.calculateDateResult();
    });
  },

  // 天数输入变化
  onDaysInput(e) {
    this.setData({
      daysToCalculate: e.detail.value
    }, () => {
      this.calculateDateResult();
    });
  },

  // 计算时间推算
  calculateTimeResult() {
    const { baseTime, timeDirection, hoursToCalculate } = this.data;
    if (!baseTime || !hoursToCalculate) return;

    const [hours, minutes] = baseTime.split(':').map(Number);
    const hoursToAdd = parseInt(hoursToCalculate);
    
    let totalMinutes = hours * 60 + minutes;
    const minutesToAdd = hoursToAdd * 60;

    if (timeDirection === 'after') {
      totalMinutes += minutesToAdd;
    } else {
      totalMinutes -= minutesToAdd;
    }

    // 处理负数时间
    while (totalMinutes < 0) {
      totalMinutes += 24 * 60;
    }

    const resultHours = Math.floor((totalMinutes / 60) % 24);
    const resultMinutes = totalMinutes % 60;
    const days = Math.floor(Math.abs(totalMinutes) / (24 * 60));

    this.setData({
      calculatedTime: {
        time: `${String(resultHours).padStart(2, '0')}:${String(resultMinutes).padStart(2, '0')}`,
        days: days
      }
    });
  },

  // 基准时间变化
  onBaseTimeChange(e) {
    this.setData({
      baseTime: e.detail.value
    }, () => {
      this.calculateTimeResult();
    });
  },

  // 时间方向变化
  onTimeDirectionChange(e) {
    const index = parseInt(e.detail.value);
    this.setData({
      timeDirection: index === 0 ? 'after' : 'before'
    }, () => {
      this.calculateTimeResult();
    });
  },

  // 小时数输入变化
  onHoursInput(e) {
    this.setData({
      hoursToCalculate: e.detail.value
    }, () => {
      this.calculateTimeResult();
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
