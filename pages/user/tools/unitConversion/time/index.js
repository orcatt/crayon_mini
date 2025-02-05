var utils = require('../../../../../api/util.js');

Component({
  properties: {
    tabbarRealHeight: {
      type: Number,
      value: 0
    }
  },
  data: {
    timeUnits: [
      { label: '年', unit: 'year', value: '' },
      { label: '月', unit: 'month', value: '' },
      { label: '周', unit: 'week', value: '' },
      { label: '天', unit: 'day', value: '' },
      { label: '时', unit: 'hour', value: '' },
      { label: '分', unit: 'minute', value: '' },
      { label: '秒', unit: 'second', value: '' }
    ]
  },
  methods: {
    // 清空时间单位
    clearTime() {
      const timeUnits = this.data.timeUnits.map(item => ({
        ...item,
        value: ''
      }));
      this.setData({ timeUnits });
    },

    // 时间单位输入处理
    onTimeInput(e) {
      const value = e.detail.value;
      const unit = e.currentTarget.dataset.unit;
      
      // 转换为秒作为基准单位
      let seconds;
      switch(unit) {
        case 'year':
          seconds = parseFloat(value) * 365 * 24 * 3600;
          break;
        case 'month':
          seconds = parseFloat(value) * 30 * 24 * 3600;
          break;
        case 'week':
          seconds = parseFloat(value) * 7 * 24 * 3600;
          break;
        case 'day':
          seconds = parseFloat(value) * 24 * 3600;
          break;
        case 'hour':
          seconds = parseFloat(value) * 3600;
          break;
        case 'minute':
          seconds = parseFloat(value) * 60;
          break;
        case 'second':
          seconds = parseFloat(value);
          break;
      }

      if (!isNaN(seconds)) {
        // 更新所有单位的值
        const timeUnits = this.data.timeUnits.map(item => ({
          ...item,
          value: item.unit === unit ? value : this.convertFromSeconds(seconds, item.unit)
        }));

        this.setData({ timeUnits });
      }
    },

    // 从秒转换到其他时间单位
    convertFromSeconds(seconds, targetUnit) {
      let result;
      switch(targetUnit) {
        case 'year':
          result = seconds / (365 * 24 * 3600);
          break;
        case 'month':
          result = seconds / (30 * 24 * 3600);
          break;
        case 'week':
          result = seconds / (7 * 24 * 3600);
          break;
        case 'day':
          result = seconds / (24 * 3600);
          break;
        case 'hour':
          result = seconds / 3600;
          break;
        case 'minute':
          result = seconds / 60;
          break;
        case 'second':
          result = seconds;
          break;
        default:
          return '';
      }
      return this.formatNumber(result);
    },

    // 格式化数字，保留三位小数
    formatNumber(num) {
      if (isNaN(num)) return '';
      
      // 如果数值太小（接近于0）
      if (Math.abs(num) < 0.001) {
        return '输入值对本单位过小';
      }
      
      // 如果数值太大
      if (Math.abs(num) >= 1e10) {
        return '输入值对本单位过大';
      }
      
      // 如果是整数，直接返回
      if (Number.isInteger(num)) return num.toString();
      
      // 保留三位小数，并移除末尾不必要的0和小数点
      let str = Number(num.toFixed(3)).toString();
      
      return str;
    }
  },
  lifetimes: {
    attached: function () {
      var that = this;
      that.setData({
        tabbarRealHeight: wx.getStorageSync('tabbarRealHeight')
      })
    }
  }
})