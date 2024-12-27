var utils = require('../../../api/util.js');

Component({
  properties: {

  },
  data: {
		tabbarRealHeight: 0,
		userInfo: {},
		currentDate: '',
		weightRecently: {}

  },
  methods: {
		getWeightData(date) {
			var that = this;
			let postData = {
				date: date,
			}
			utils.getData({
        url: 'health/userWeight/daily',
        params: postData,
        success: function (res) {
          if (res.code == 200) {
						var age = new Date().getFullYear() - that.data.userInfo.birthday.split('-')[0]
						var height = parseInt(that.data.userInfo.height).toFixed(0)

						let weightRecently = res.data
						weightRecently.weight = parseInt(weightRecently.weight).toFixed(0)
						weightRecently.bmr = parseInt(weightRecently.bmr).toFixed(0)
						weightRecently.tdee = parseInt(weightRecently.tdee).toFixed(0)
						weightRecently.bmiPosition = that.getBmiPosition(weightRecently.bmi)
						that.setData({
							weightRecently: weightRecently,
							'userInfo.age': age,
							'userInfo.height': height
						})
						console.log(that.data.weightRecently, that.data.userInfo);
						wx.setStorageSync('userInfo', that.data.userInfo)

          } else if (res.code == 403) {
						that.addSupplementInfo()
					} else {
            wx.showToast({
              title: res.message,
              icon: 'none',
            })
          }
        }
      })
		},
		getBmiPosition(bmi) {
			// BMI范围是18.5-30.0,总宽度按100%计算
			const min = 18.5;
			const max = 30.0;
			const range = max - min;
			
			// 限制bmi值在有效范围内
			const limitedBmi = Math.max(min, Math.min(max, bmi));
			
			// 计算百分比位置
			const position = ((limitedBmi - min) / range) * 100;
			
			return position.toFixed(1);
		}
	},
	lifetimes: {
		attached: function () {
			var that = this;
			that.setData({
				tabbarRealHeight: wx.getStorageSync('tabbarRealHeight'),
				userInfo: wx.getStorageSync('userInfo'),
				currentDate: new Date().toISOString().split('T')[0]
			})
			that.getWeightData(that.data.currentDate)
		}
	}

})