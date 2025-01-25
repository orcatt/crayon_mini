// pages/explore/tools/dict/index.js
Page({
  data: {
		tabbarRealHeight: 0,
    zodiacList: ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'],
    inputYear: '',
    inputAge: '',
    selectedZodiac: '',
    yearRange: {
      start: 1950,
      end: 2030
    },
    result: null,
    zodiacYears: [],
    minYear: 1900,
    maxAge: 125
  },
  onLoad(options) {
		var that = this;
		that.setData({
			tabbarRealHeight: wx.getStorageSync('tabbarRealHeight')
		})

  },

  onReady() {},
  onShow() {},
  onHide() {},
  onUnload() {},
  onPullDownRefresh() {},
  onReachBottom() {},
  onShareAppMessage() {},

  // 生肖计算函数
  getZodiac(year) {
    const baseYear = 1900;
    const index = (year - baseYear) % 12;
    return this.data.zodiacList[index];
  },

  // 根据出生年份查询
  getZodiacInfoByYear(birthYear) {
    const year = Number(birthYear);
    const zodiac = this.getZodiac(year);
    const age = new Date().getFullYear() - year;

    return {
      year: year,
      zodiac: zodiac,
      age: age
    };
  },

  // 根据年龄查询
  getZodiacInfoByAge(age) {
    const currentYear = new Date().getFullYear();
    const birthYear = currentYear - age;
    return this.getZodiacInfoByYear(birthYear);
  },

  // 根据生肖查询年份范围
  getYearsByZodiac(zodiac) {
    const { start, end } = this.data.yearRange;
    const years = [];
    
    for (let year = start; year <= end; year++) {
      if (this.getZodiac(year) === zodiac) {
        const age = new Date().getFullYear() - year;
        years.push({
          year: year,
          zodiac: zodiac,
          age: age
        });
      }
    }
    return years;
  },

  // 输入年份变化
  onYearInput(e) {
    var that = this;
    const year = e.detail.value;
    that.setData({
      selectedZodiac: '',
      zodiacYears: []
    })
    // 检查年份是否小于1900
    if (year && year < this.data.minYear) {
      wx.showToast({
        title: '年份不能小于1900年',
        icon: 'none'
      });
      return;
    }
    
    this.setData({ inputYear: year });
    
    if (year && year.length === 4) {
      const result = this.getZodiacInfoByYear(year);
      // 同步设置年龄输入框的值
      this.setData({ 
        result: result,
        zodiacYears: [],
        inputAge: result.age.toString()
      });
    }
  },

  // 输入年龄变化
  onAgeInput(e) {
    const age = e.detail.value;
    
    // 检查年龄是否大于125
    if (age && age > this.data.maxAge) {
      wx.showToast({
        title: '年龄不能大于125岁',
        icon: 'none'
      });
      return;
    }
    
    this.setData({ inputAge: age });
    
    if (age) {
      const result = this.getZodiacInfoByAge(age);
      // 同步设置出生年份输入框的值
      this.setData({ 
        result: result,
        zodiacYears: [],
        inputYear: result.year.toString()
      });
    }
  },

  // 选择生肖变化
  onZodiacChange(e) {
    const zodiac = this.data.zodiacList[e.detail.value];
    this.setData({ 
      selectedZodiac: zodiac,
      result: null,
      inputYear: '',
      inputAge: ''
    });
    
    const years = this.getYearsByZodiac(zodiac);
    this.setData({ zodiacYears: years });
  },

  // 清空选择
  clearSelection() {
    this.setData({
      inputYear: '',
      inputAge: '',
      selectedZodiac: '',
      result: null,
      zodiacYears: []
    });
  }
})