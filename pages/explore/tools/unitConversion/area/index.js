var utils = require('../../../../../api/util.js');

Component({
  properties: {
    tabbarRealHeight: {
      type: Number,
      value: 0
    }
  },
  data: {
    areaMetricUnits: [
      { label: '平方公里', unit: 'sqkm', value: '' },
      { label: '公顷', unit: 'ha', value: '' },
      { label: '平方米', unit: 'sqm', value: '' }
    ],
    areaImperialUnits: [
      { label: '平方英里', unit: 'sqmile', value: '' },
      { label: '平方英尺', unit: 'sqft', value: '' },
      { label: '平方英寸', unit: 'sqinch', value: '' },
      { label: '英亩', unit: 'acre', value: '' }
    ],
    areaChineseUnits: [
      { label: '亩', unit: 'mu', value: '' }
    ]
  },
  methods: {
    // 清空面积公制单位
    clearAreaMetric() {
      const areaMetricUnits = this.data.areaMetricUnits.map(item => ({
        ...item,
        value: ''
      }));
      this.setData({ areaMetricUnits });
    },

    // 清空面积英制单位
    clearAreaImperial() {
      const areaImperialUnits = this.data.areaImperialUnits.map(item => ({
        ...item,
        value: ''
      }));
      this.setData({ areaImperialUnits });
    },

    // 清空面积市制单位
    clearAreaChinese() {
      const areaChineseUnits = this.data.areaChineseUnits.map(item => ({
        ...item,
        value: ''
      }));
      this.setData({ areaChineseUnits });
    },

    // 面积公制单位输入处理
    onAreaMetricInput(e) {
      const value = e.detail.value;
      const unit = e.currentTarget.dataset.unit;
      
      // 转换为平方米作为基准单位
      let sqMeters;
      switch(unit) {
        case 'sqkm':
          sqMeters = parseFloat(value) * 1000000;
          break;
        case 'ha':
          sqMeters = parseFloat(value) * 10000;
          break;
        case 'sqm':
          sqMeters = parseFloat(value);
          break;
      }

      if (!isNaN(sqMeters)) {
        this.updateAllAreaUnits(sqMeters, unit, value);
      }
    },

    // 面积英制单位输入处理
    onAreaImperialInput(e) {
      const value = e.detail.value;
      const unit = e.currentTarget.dataset.unit;
      
      // 转换为平方米作为基准单位
      let sqMeters;
      switch(unit) {
        case 'sqmile':
          sqMeters = parseFloat(value) * 2589988.11;
          break;
        case 'sqft':
          sqMeters = parseFloat(value) * 0.092903;
          break;
        case 'sqinch':
          sqMeters = parseFloat(value) * 0.00064516;
          break;
        case 'acre':
          sqMeters = parseFloat(value) * 4046.86;
          break;
      }

      if (!isNaN(sqMeters)) {
        this.updateAllAreaUnits(sqMeters, unit, value);
      }
    },

    // 面积市制单位输入处理
    onAreaChineseInput(e) {
      const value = e.detail.value;
      const unit = e.currentTarget.dataset.unit;
      
      // 转换为平方米作为基准单位
      let sqMeters;
      if (unit === 'mu') {
        sqMeters = parseFloat(value) * 666.67;
      }

      if (!isNaN(sqMeters)) {
        this.updateAllAreaUnits(sqMeters, unit, value);
      }
    },

    // 更新所有面积单位
    updateAllAreaUnits(sqMeters, inputUnit, inputValue) {
      // 更新公制单位
      const areaMetricUnits = this.data.areaMetricUnits.map(item => ({
        ...item,
        value: item.unit === inputUnit ? inputValue : this.convertFromSqMeters(sqMeters, item.unit)
      }));

      // 更新英制单位
      const areaImperialUnits = this.data.areaImperialUnits.map(item => ({
        ...item,
        value: item.unit === inputUnit ? inputValue : this.convertFromSqMetersToImperial(sqMeters, item.unit)
      }));

      // 更新市制单位
      const areaChineseUnits = this.data.areaChineseUnits.map(item => ({
        ...item,
        value: item.unit === inputUnit ? inputValue : this.convertFromSqMetersToChinese(sqMeters, item.unit)
      }));

      this.setData({
        areaMetricUnits,
        areaImperialUnits,
        areaChineseUnits
      });
    },

    // 从平方米转换到其他公制单位
    convertFromSqMeters(sqMeters, targetUnit) {
      let result;
      switch(targetUnit) {
        case 'sqkm':
          result = sqMeters / 1000000;
          break;
        case 'ha':
          result = sqMeters / 10000;
          break;
        case 'sqm':
          result = sqMeters;
          break;
        default:
          return '';
      }
      return this.formatNumber(result);
    },

    // 从平方米转换到英制单位
    convertFromSqMetersToImperial(sqMeters, targetUnit) {
      let result;
      switch(targetUnit) {
        case 'sqmile':
          result = sqMeters / 2589988.11;
          break;
        case 'sqft':
          result = sqMeters / 0.092903;
          break;
        case 'sqinch':
          result = sqMeters / 0.00064516;
          break;
        case 'acre':
          result = sqMeters / 4046.86;
          break;
        default:
          return '';
      }
      return this.formatNumber(result);
    },

    // 从平方米转换到市制单位
    convertFromSqMetersToChinese(sqMeters, targetUnit) {
      if (targetUnit === 'mu') {
        return this.formatNumber(sqMeters / 666.67);
      }
      return '';
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