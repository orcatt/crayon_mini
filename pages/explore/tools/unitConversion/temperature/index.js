var utils = require('../../../../../api/util.js');

Component({
  properties: {
    tabbarRealHeight: {
      type: Number,
      value: 0
    }
  },
  data: {
    tempUnits: [
      { label: '摄氏度', unit: 'celsius', value: '', min: -20, max: 100 },
      { label: '华氏度', unit: 'fahrenheit', value: '', min: -4, max: 212 }
    ],
    // 温度计高度相关参数
    thermometerHeight: 400, // 温度计总高度(rpx)
    mercuryHeights: [0, 0], // 两个温度计的水银柱高度
    mercuryColors: ['#ff4d4f', '#ff4d4f'], // 水银柱颜色
    scaleMarks: {  // 新增刻度标记配置
      celsius: [100, 80, 60, 40, 20, 0, -20],  // 摄氏度刻度点
      fahrenheit: [212, 170, 130, 90, 50, 10, -4]  // 华氏度刻度点
    }
  },
  methods: {
    // 清空温度单位
    clearTemp() {
      const tempUnits = this.data.tempUnits.map(item => ({
        ...item,
        value: ''
      }));
      this.setData({ 
        tempUnits,
        mercuryHeights: [0, 0]
      });
    },

    // 温度单位输入处理
    onTempInput(e) {
      const value = e.detail.value;
      const unit = e.currentTarget.dataset.unit;
      const index = e.currentTarget.dataset.index;
      
      if (value === '') {
        this.clearTemp();
        return;
      }

      const temp = parseFloat(value);
      if (!isNaN(temp)) {
        let celsius, fahrenheit;
        
        if (unit === 'celsius') {
          celsius = temp;
          fahrenheit = this.celsiusToFahrenheit(temp);
        } else {
          fahrenheit = temp;
          celsius = this.fahrenheitToCelsius(temp);
        }

        // 更新温度值
        const tempUnits = [...this.data.tempUnits];
        tempUnits[0].value = this.formatNumber(celsius);
        tempUnits[1].value = this.formatNumber(fahrenheit);

        // 计算温度计水银柱高度
        const mercuryHeights = this.calculateMercuryHeights(celsius, fahrenheit);

        this.setData({ 
          tempUnits,
          mercuryHeights
        });
      }
    },

    // 摄氏度转华氏度
    celsiusToFahrenheit(celsius) {
      return celsius * 9/5 + 32;
    },

    // 华氏度转摄氏度
    fahrenheitToCelsius(fahrenheit) {
      return (fahrenheit - 32) * 5/9;
    },

    // 计算温度计水银柱高度
    calculateMercuryHeights(celsius, fahrenheit) {
      const { tempUnits, thermometerHeight } = this.data;
      
      // 分别计算两个温度计的比例
      const celsiusRange = tempUnits[0].max - tempUnits[0].min;
      const fahrenheitRange = tempUnits[1].max - tempUnits[1].min;
      
      // 计算相对高度（考虑不同的温度范围）
      const celsiusHeight = ((celsius - tempUnits[0].min) / celsiusRange) * thermometerHeight;
      const fahrenheitHeight = ((fahrenheit - tempUnits[1].min) / fahrenheitRange) * thermometerHeight;

      return [
        Math.max(0, Math.min(thermometerHeight, celsiusHeight)),
        Math.max(0, Math.min(thermometerHeight, fahrenheitHeight))
      ];
    },

    // 格式化数字，保留一位小数
    formatNumber(num) {
      if (isNaN(num)) return '';
      return Number(num.toFixed(1)).toString();
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