// pages/today/index.js
var utils = require('../../../api/util.js');
import { calendar } from '../../../utils/calendar'

Component({
  properties: {

  },
  data: {
		tabbarRealHeight: 0,
		weekendActiveIndex: 1,
		weekendData: [{
			id: 1,
			title: '日',
			name: '周日',
			date: '2024-12-14',
		},{
			id: 2,
			title: '一',
			name: '周一',
			date: '2024-12-15',
		},{
			id: 3,
			title: '二',
			name: '周二',
			date: '2024-12-16',
		},{
			id: 4,
			title: '三',
			name: '周三',
			date: '2024-12-17',
		},{
			id: 5,
			title: '四',
			name: '周四',
			date: '2024-12-18',
		},{
			id: 6,
			title: '五',
			name: '周五',
			date: '2024-12-19',
		},{
			id: 7,
			title: '六',
			name: '周六',
			date: '2024-12-20',
		}],
		percent: 60, // 这里设置初始百分比值
		circleStyle: '', // 存放动态背景样式

		supplementStep: 1, // 1: 身高、出生年月 2: 体重、目标体重、目标类型、体重指数、基础代谢率 3: 完成
		supplementInfo: {
			date: "", // yyyy-mm-dd
			weight: "", // 体重
			target_weight: "", // 目标体重 
			target_type: "", // 目标类型 减重1 保持2 增肌3
			bmi: "", // 体重指数
			bmr: "" // 基础代谢率
		},

		showMaskDrawer: false,

		targetTypes: [{
			title: '减重',
			value: '1'
		}, {
			title: '保持',
			value: '2'
		}, {
			title: '增肌',
			value: '3'
		}],

		userInfo: {},
		formData: {
			height: "",
			birthday: "2000-01-01",
			age: "",
			date: "",
			weight: "",
			target_weight: "",
			target_type: "",
			target_typeTitle: "",
			bmi: "",
			bmr: ""
		},
  },
  methods: {
		updateCircle(percent) {
      // 计算 conic-gradient 样式
      const gradient = `conic-gradient(
        #18181B 0%, 
        #18181B ${percent}%, 
        #CDCDD0 ${percent}%, 
        #CDCDD0 100%
      )`;

      // 动态设置 circle-box 背景
      this.setData({
        circleBackground: gradient,
      });
    },
		
		handleWeekendChange(e) {
			var that = this;
			that.setData({
				weekendActiveIndex: e.currentTarget.dataset.id
			})
		},

		getWeightData() {
			var that = this;
			let postData = {
				start_date: "",
				end_date: "",
			}
			utils.getData({
        url: 'health/userWeight/list',
        params: postData,
        success: function (res) {
          if (res.code == 200) {
						console.log(res.data);
						if (res.data.length == 0) {
							that.addSupplementInfo()
							return;
						}
						
						
          }else{
            wx.showToast({
              title: res.message,
              icon: 'none',
            })
          }
        }
      })
		},
		addSupplementInfo() {
			var that = this;
			this.triggerEvent('toggleTabBar', { show: false }, {});
			if (!that.data.userInfo.height) {
				that.setData({
					showMaskDrawer: true,
					supplementStep: 1
				})
				return;

			}else if (that.data.userInfo.height) {
				let age = new Date().getFullYear() - that.data.userInfo.birthday.split('-')[0];
				that.setData({
					showMaskDrawer: true,
					supplementStep: 2,
					'formData.height': that.data.userInfo.height,
					'formData.birthday': that.data.userInfo.birthday,
					'formData.age': age,
				})
			}
		},
		handleHeightInput(e) {
			const height = e.detail.value;
			this.setData({
				'formData.height': height
			});
		},
		handleBirthdayChange(e) {
			const birthday = e.detail.value;
			this.setData({
				'formData.birthday': birthday
			});
		},
		nextStep() {
			var that = this;
			if (that.data.formData.height == "" || !/^\d+$/.test(that.data.formData.height)) {
				wx.showToast({
					title: '身高不能为空且是数字',
					icon: 'none'
				});
				return;
			}

			// 完善个人信息接口
			let postData = {
				height: that.data.formData.height,
				birthday: that.data.formData.birthday
			}
			utils.getData({
				url: 'auth/updateUserInfo',
				params: postData,
				success: function (res) {
					if (res.code == 200) {
						wx.setStorageSync('userInfo', res.data.userInfo);
						const age = new Date().getFullYear() - that.data.formData.birthday.split('-')[0];
						that.setData({
							'formData.age': age,
							supplementStep: 2
						})
					}
				}
			})

		},

		// 处理体重输入
		handleWeightInput(e) {
			var that = this;
			const weight = e.detail.value;
			that.setData({
				'formData.weight': weight
			});
			that.calculateBMI();
			that.calculateBMR();
		},

		// 处理目标体重输入
		handleTargetWeightInput(e) {
			this.setData({
				'formData.target_weight': e.detail.value
			});
		},

		// 处理目标类型选择
		handleTargetTypeChange(e) {
			const index = e.detail.value;
			this.setData({
				'formData.target_type': this.data.targetTypes[index].value,
				'formData.target_typeTitle': this.data.targetTypes[index].title
			});
		},

		// 计算BMI
		calculateBMI() {
			var that = this;
			const weight = parseFloat(that.data.formData.weight);
			const height = parseFloat(that.data.formData.height)/100;
			if (weight && height) {
				const bmi = (weight / (height * height)).toFixed(1);
				that.setData({
					'formData.bmi': bmi
				});
			}
		},

		// 计算基础代谢率
		calculateBMR() {
			var that = this;
			const weight = parseFloat(that.data.formData.weight);
			// 假设年龄25岁，性别男，实际应该从用户信息获取
			const age = that.data.formData.age;
			const gender = that.data.userInfo.gender;
		
			if (weight && age) {
				// BMR计算公式（仅供参考）
				// 男性：BMR = 66 + (13.7 × 体重) + (5 × 身高) - (6.8 × 年龄)
				// 女性：BMR = 655 + (9.6 × 体重) + (1.8 × 身高) - (4.7 × 年龄)
				const height = parseFloat(that.data.formData.height); 
				const bmr = gender === 1 
					? (66 + (13.7 * weight) + (5 * height) - (6.8 * age)).toFixed(0)
					: (655 + (9.6 * weight) + (1.8 * height) - (4.7 * age)).toFixed(0);
				that.setData({
					'formData.bmr': bmr
				});
			}
		},

		// 关闭抽屉
		closeMaskDrawer() {
			var that = this;
			wx.showModal({
				title: '再等等，即刻完成',
				content: '信息不完善将不能使用健康模块',
				success: function (res) {
					if (res.confirm) {
						that.triggerEvent('toggleTabBar', { show: true }, {});
						that.setData({
							showMaskDrawer: false
						});
						wx.redirectTo({
							url: '/pages/today/index'
						});
					}
				}
			});
		},

		// 提交表单
		submitForm() {
			const that = this;
			const { weight, target_weight, target_type } = that.data.formData;
			
			// 验证必填字段
			if (!weight || !target_weight || !target_type) {
				wx.showToast({
					title: '请填写必填项',
					icon: 'none'
				});
				return;
			}

			// 获取当前日期
			const currentDate = new Date().toISOString().split('T')[0];
			let postData = {
				date: currentDate,
				weight: that.data.formData.weight,
				target_weight: that.data.formData.target_weight,
				target_type: that.data.formData.target_type,
				bmi: that.data.formData.bmi,
				bmr: that.data.formData.bmr
			}

			utils.getData({
				url: 'health/userWeight/add',
				params: postData,
				success: (res) => {
					if (res.code === 200) {
						wx.showToast({
							title: '保存成功',
							icon: 'success'
						});
						that.triggerEvent('toggleTabBar', { show: true }, {});
						that.setData({
							showMaskDrawer: false
						});
						that.getWeightData(); // 刷新列表
					} else {
						wx.showToast({
							title: res.message,
							icon: 'none'
						});
					}
				}
			});
		},
  },
  lifetimes: {
		attached: function () {
			var that = this;
			that.setData({
				tabbarRealHeight: wx.getStorageSync('tabbarRealHeight'),
				userInfo: wx.getStorageSync('userInfo')
			})
			that.updateCircle(that.data.percent)
			that.getWeightData()
		}
	}

})