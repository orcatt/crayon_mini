var utils = require('../../../../../api/util.js');

Component({
  properties: {
    tabbarRealHeight: {
      type: Number,
      value: 0
    }
  },
  data: {
    metricUnits: [
      { label: '吨', unit: 't', value: '' },
      { label: '公斤', unit: 'kg', value: '' },
      { label: '克', unit: 'g', value: '' }
    ],
    imperialUnits: [
      { label: '磅', unit: 'lb', value: '' },
      { label: '盎司', unit: 'oz', value: '' }
    ],
    chineseUnits: [
      { label: '市斤', unit: 'jin', value: '' },
      { label: '两', unit: 'liang', value: '' },
      { label: '钱', unit: 'qian', value: '' }
    ]
  },
  methods: {
    // 清空公制单位
    clearMetric() {
      const metricUnits = this.data.metricUnits.map(item => ({
        ...item,
        value: ''
      }));
      this.setData({ metricUnits });
    },

    // 清空英制单位
    clearImperial() {
      const imperialUnits = this.data.imperialUnits.map(item => ({
        ...item,
        value: ''
      }));
      this.setData({ imperialUnits });
    },

    // 清空市制单位
    clearChinese() {
      const chineseUnits = this.data.chineseUnits.map(item => ({
        ...item,
        value: ''
      }));
      this.setData({ chineseUnits });
    },

    // 公制单位输入处理
    onMetricInput(e) {
      const value = e.detail.value;
      const unit = e.currentTarget.dataset.unit;
      
      // 转换为克作为基准单位
      let grams;
      switch(unit) {
        case 't':
          grams = parseFloat(value) * 1000000;
          break;
        case 'kg':
          grams = parseFloat(value) * 1000;
          break;
        case 'g':
          grams = parseFloat(value);
          break;
      }

      if (!isNaN(grams)) {
        // 更新所有单位的值
        const metricUnits = this.data.metricUnits.map(item => ({
          ...item,
          value: item.unit === unit ? value : this.convertFromGrams(grams, item.unit)
        }));

        // 更新英制单位
        const imperialUnits = this.data.imperialUnits.map(item => ({
          ...item,
          value: this.convertFromGramsToImperial(grams, item.unit)
        }));

        // 更新市制单位
        const chineseUnits = this.data.chineseUnits.map(item => ({
          ...item,
          value: this.convertFromGramsToChinese(grams, item.unit)
        }));

        this.setData({ 
          metricUnits,
          imperialUnits,
          chineseUnits
        });
      }
    },

    // 英制单位输入处理
    onImperialInput(e) {
      const value = e.detail.value;
      const unit = e.currentTarget.dataset.unit;
      
      // 转换为克作为基准单位
      let grams;
      switch(unit) {
        case 'lb':
          grams = parseFloat(value) * 453.59237;
          break;
        case 'oz':
          grams = parseFloat(value) * 28.349523125;
          break;
      }

      if (!isNaN(grams)) {
        // 更新所有英制单位的值
        const imperialUnits = this.data.imperialUnits.map(item => ({
          ...item,
          value: item.unit === unit ? value : this.convertFromGramsToImperial(grams, item.unit)
        }));

        // 更新公制单位
        const metricUnits = this.data.metricUnits.map(item => ({
          ...item,
          value: this.convertFromGrams(grams, item.unit)
        }));

        // 更新市制单位
        const chineseUnits = this.data.chineseUnits.map(item => ({
          ...item,
          value: this.convertFromGramsToChinese(grams, item.unit)
        }));

        this.setData({ 
          imperialUnits,
          metricUnits,
          chineseUnits
        });
      }
    },

    // 市制单位输入处理
    onChineseInput(e) {
      const value = e.detail.value;
      const unit = e.currentTarget.dataset.unit;
      
      // 转换为克作为基准单位
      let grams;
      switch(unit) {
        case 'jin':
          grams = parseFloat(value) * 500;
          break;
        case 'liang':
          grams = parseFloat(value) * 50;
          break;
        case 'qian':
          grams = parseFloat(value) * 5;
          break;
      }

      if (!isNaN(grams)) {
        // 更新所有市制单位的值
        const chineseUnits = this.data.chineseUnits.map(item => ({
          ...item,
          value: item.unit === unit ? value : this.convertFromGramsToChinese(grams, item.unit)
        }));

        // 更新公制单位
        const metricUnits = this.data.metricUnits.map(item => ({
          ...item,
          value: this.convertFromGrams(grams, item.unit)
        }));

        // 更新英制单位
        const imperialUnits = this.data.imperialUnits.map(item => ({
          ...item,
          value: this.convertFromGramsToImperial(grams, item.unit)
        }));

        this.setData({ 
          chineseUnits,
          metricUnits,
          imperialUnits
        });
      }
    },

    // 从克转换到其他公制单位
    convertFromGrams(grams, targetUnit) {
      let result;
      switch(targetUnit) {
        case 't':
          result = grams / 1000000;
          break;
        case 'kg':
          result = grams / 1000;
          break;
        case 'g':
          result = grams;
          break;
        default:
          return '';
      }
      return this.formatNumber(result);
    },

    // 从克转换到英制单位
    convertFromGramsToImperial(grams, targetUnit) {
      let result;
      switch(targetUnit) {
        case 'lb':
          result = grams / 453.59237;
          break;
        case 'oz':
          result = grams / 28.349523125;
          break;
        default:
          return '';
      }
      return this.formatNumber(result);
    },

    // 从克转换到市制单位
    convertFromGramsToChinese(grams, targetUnit) {
      let result;
      switch(targetUnit) {
        case 'jin':
          result = grams / 500;
          break;
        case 'liang':
          result = grams / 50;
          break;
        case 'qian':
          result = grams / 5;
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