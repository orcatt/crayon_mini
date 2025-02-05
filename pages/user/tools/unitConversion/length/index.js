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
      { label: '千米', unit: 'km', value: '' },
      { label: '米', unit: 'm', value: '' },
      { label: '厘米', unit: 'cm', value: '' },
      { label: '毫米', unit: 'mm', value: '' }
    ],
    imperialUnits: [
      { label: '英里', unit: 'mile', value: '' },
      { label: '英尺', unit: 'ft', value: '' },
      { label: '英寸', unit: 'inch', value: '' }
    ],
    chineseUnits: [
      { label: '里', unit: 'li', value: '' },
      { label: '丈', unit: 'zhang', value: '' },
      { label: '尺', unit: 'chi', value: '' },
      { label: '寸', unit: 'cun', value: '' }
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
      
      // 转换为米作为基准单位
      let meters;
      switch(unit) {
        case 'km':
          meters = parseFloat(value) * 1000;
          break;
        case 'm':
          meters = parseFloat(value);
          break;
        case 'cm':
          meters = parseFloat(value) / 100;
          break;
        case 'mm':
          meters = parseFloat(value) / 1000;
          break;
      }

      if (!isNaN(meters)) {
        // 更新所有单位的值
        const metricUnits = this.data.metricUnits.map(item => ({
          ...item,
          value: item.unit === unit ? value : this.convertFromMeters(meters, item.unit)
        }));

        // 更新英制单位
        const inches = meters * 39.3701;
        const imperialUnits = this.data.imperialUnits.map(item => ({
          ...item,
          value: this.convertFromInches(inches, item.unit)
        }));

        // 更新市制单位
        const chineseUnits = this.data.chineseUnits.map(item => ({
          ...item,
          value: this.convertFromMetersToChineseUnits(meters, item.unit)
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
      
      // 转换为英寸作为基准单位
      let inches;
      switch(unit) {
        case 'mile':
          inches = parseFloat(value) * 63360;
          break;
        case 'ft':
          inches = parseFloat(value) * 12;
          break;
        case 'inch':
          inches = parseFloat(value);
          break;
      }

      if (!isNaN(inches)) {
        // 更新所有英制单位的值
        const imperialUnits = this.data.imperialUnits.map(item => ({
          ...item,
          value: item.unit === unit ? value : this.convertFromInches(inches, item.unit)
        }));

        // 更新公制单位
        const meters = inches * 0.0254;
        const metricUnits = this.data.metricUnits.map(item => ({
          ...item,
          value: this.convertFromMeters(meters, item.unit)
        }));

        // 更新市制单位
        const chineseUnits = this.data.chineseUnits.map(item => ({
          ...item,
          value: this.convertFromMetersToChineseUnits(meters, item.unit)
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
      
      // 转换为米作为基准单位
      let meters;
      switch(unit) {
        case 'li':
          meters = parseFloat(value) * 500;
          break;
        case 'zhang':
          meters = parseFloat(value) * 3.33;
          break;
        case 'chi':
          meters = parseFloat(value) * 0.333;
          break;
        case 'cun':
          meters = parseFloat(value) * 0.0333;
          break;
      }

      if (!isNaN(meters)) {
        // 更新所有市制单位的值
        const chineseUnits = this.data.chineseUnits.map(item => ({
          ...item,
          value: item.unit === unit ? value : this.convertFromMetersToChineseUnits(meters, item.unit)
        }));

        // 更新公制单位
        const metricUnits = this.data.metricUnits.map(item => ({
          ...item,
          value: this.convertFromMeters(meters, item.unit)
        }));

        // 更新英制单位
        const inches = meters * 39.3701;
        const imperialUnits = this.data.imperialUnits.map(item => ({
          ...item,
          value: this.convertFromInches(inches, item.unit)
        }));

        this.setData({ 
          chineseUnits,
          metricUnits,
          imperialUnits
        });
      }
    },

    // 从米转换到其他公制单位
    convertFromMeters(meters, targetUnit) {
      let result;
      switch(targetUnit) {
        case 'km':
          result = meters / 1000;
          break;
        case 'm':
          result = meters;
          break;
        case 'cm':
          result = meters * 100;
          break;
        case 'mm':
          result = meters * 1000;
          break;
        default:
          return '';
      }
      return this.formatNumber(result);
    },

    // 从英寸转换到其他英制单位
    convertFromInches(inches, targetUnit) {
      let result;
      switch(targetUnit) {
        case 'mile':
          result = inches / 63360;
          break;
        case 'ft':
          result = inches / 12;
          break;
        case 'inch':
          result = inches;
          break;
        default:
          return '';
      }
      return this.formatNumber(result);
    },

    // 从米转换到市制单位
    convertFromMetersToChineseUnits(meters, targetUnit) {
      let result;
      switch(targetUnit) {
        case 'li':
          result = meters / 500;
          break;
        case 'zhang':
          result = meters / 3.33;
          break;
        case 'chi':
          result = meters / 0.333;
          break;
        case 'cun':
          result = meters / 0.0333;
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