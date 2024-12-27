// pages/today/index.js
var utils = require('../../../api/util.js');

Component({
  properties: {

  },
  data: {
		tabbarRealHeight: 0,
		weekendActiveIndex: '',
		weekendData: [{
			title: '日',
			name: '周日',
			date: '',
		},{
			title: '一',
			name: '周一',
			date: '',
		},{
			title: '二',
			name: '周二',
			date: '',
		},{
			title: '三',
			name: '周三',
			date: '',
		},{
			title: '四',
			name: '周四',
			date: '',
		},{
			title: '五',
			name: '周五',
			date: '',
		},{
			title: '六',
			name: '周六',
			date: '',
		}],
		currentDate: '', // 当前日期

		circleStyle: '', // 存放动态背景样式

		showSupplementDrawer: false, // 是否显示完善信息弹窗
		supplementStep: 1, // 1: 身高、出生年月 2: 体重、目标体重、目标类型、体重指数、基础代谢率 3: 完成
		userInfo: {},
		weightRecently: {},

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
		activityCoefficientTypes: [{
			title: '久不动',
			value: '1.2'
		}, {
			title: '每周运动1-3次',
			value: '1.375'
		}, {
			title: '每周运动3-5次',
			value: '1.55'
		}, {
			title: '每周运动5-7次',
			value: '1.725'
		}],
		formData: {
			height: "",
			birthday: "2000-01-01",
			age: "",
			date: "",
			weight: "",
			target_weight: "",
			target_type: "",
			target_typeTitle: "",
			bmi: "", // BMI指数
			bmr: "", // 基础代谢率
			tdee: "", // 总能量消耗
			activityCoefficient: "", // 活动系数
			activityCoefficientTitle: "",
			recommended_carbs: "", // 推荐碳水
			recommended_protein: "", // 推荐蛋白质
			recommended_fat: "", // 推荐脂肪
		},



		intakeDailyData: {}, // 某日摄入数据
		intake_id: '', // 某日摄入id
		eatingList: [], // 某日摄入食物列表

		// 食物类型
		foodType: [{
			id: 0,
			name: '搜索结果'
		},{
			id: 1,
			name: '谷薯芋、杂豆、主食' 	
		},{
			id: 2,
			name: '蛋类、肉类及制品'
		},{
			id: 3,
			name: '奶类及制品'
		},{
			id: 4,
			name: '蔬和菌藻'
		},{
			id: 5,
			name: '坚果、大豆及制品'
		},{
			id: 6,
			name: '饮料'
		},{
			id: 7,
			name: '食用油、油脂及制品'
		},{
			id: 8,
			name: '调味品'
		},{
			id: 9,
			name: '零食、点心、冷饮'
		},{
			id: 10,
			name: '其它'
		}],
		foodList: [],
		currentType: 1, // 当前选中的食物类型
		searchValue: '', // 搜索关键词
		page: 1, // 当前页码
		notData: false, // 是否没有数据

		showSelectFoodsDrawer: false,
		showFoodDetailDrawer: false,
		selectedFood: null,
		modifyEatingFoodStatus: false, // 是否是修改食物
		mealTimes: [{
			title: '早餐',
			value: '1'
		}, {
			title: '午餐',
			value: '2'
		}, {
			title: '晚餐',
			value: '3'
		}, {
			title: '加餐',
			value: '4'
		}],
		// 提交食物表单
		foodDetailForm: {
			// 用户输入/选择
			eating_type: "",
			eating_typeTitle: '',
			foods_weight: "",
			// 直取
			user_intake_id: "",
			food_id: "",
			food_name: "",
			food_category: "",
			image_path: "",
			// 计算
			calories: 0,
			carbohydrate: 0,
			fat: 0,
			protein: 0,
			cellulose: 0
		}
  },
  methods: {
		handleBackDate() {
			var that = this;
			let currentDate = new Date(that.data.currentDate);
			// 向前移动7天
			currentDate.setDate(currentDate.getDate() - 7);
			
			// 更新当前日期
			that.setData({
				currentDate: currentDate.toISOString().split('T')[0]
			});

			// 重新获取周数据
			that.getWeekendData();
			that.getWeightData(that.data.currentDate)
		},
		handleNextDate() {
			var that = this;
			// 获取当前日期
			let currentDate = new Date(that.data.currentDate);
			let today = new Date();
			
			// 如果当前日期已经是今天，则不执行
			if (currentDate.toISOString().split('T')[0] === today.toISOString().split('T')[0]) {
				wx.showToast({
					title: '未来太远，再等等看',
					icon: 'none'
				});
				return;
			}
			
			// 如果当前日期加7天超过今天,则设置为今天
			let nextDate = new Date(currentDate);
			nextDate.setDate(nextDate.getDate() + 7);
			
			if (nextDate > today) {
				that.setData({
					currentDate: today.toISOString().split('T')[0]
				});
			} else {
				// 向后移动7天
				currentDate.setDate(currentDate.getDate() + 7);
				that.setData({
					currentDate: currentDate.toISOString().split('T')[0]
				});
			}

			// 重新获取周数据
			that.getWeekendData();
			that.getWeightData(that.data.currentDate);
		},
		// 获取近一周的日期，并对应进weekendData
		getWeekendData() {
			var that = this;
			
			// 获取当前日期
			let today = new Date(that.data.currentDate);
			let currentDay = today.getDay(); // 获取当前是星期几 (0-6)
			
			// 计算本周日的日期（向前偏移到最近的周日）
			let sunday = new Date(today);
			sunday.setDate(today.getDate() - currentDay);
			
			// 更新 weekendData
			let updatedWeekendData = that.data.weekendData.map((item, index) => {
				let date = new Date(sunday);
				date.setDate(sunday.getDate() + index);
				return {
					...item,
					date: date.toISOString().split('T')[0]
				};
			});

			// 设置当前日期对应的 title 作为 activeIndex
			that.setData({
				weekendActiveIndex: that.data.weekendData[currentDay].title,
				weekendData: updatedWeekendData
			});
			
		},
		handleWeekendChange(e) {
			var that = this;
			that.setData({
				weekendActiveIndex: e.currentTarget.dataset.title,
				currentDate: e.currentTarget.dataset.date
			})
			that.getWeightData(e.currentTarget.dataset.date)
		},

		// 获取体重数据
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

						let weightRecently = res.data
						weightRecently.recommended_carbs = parseInt(weightRecently.recommended_carbs).toFixed(0)
						weightRecently.recommended_protein = parseInt(weightRecently.recommended_protein).toFixed(0)
						weightRecently.recommended_fat = parseInt(weightRecently.recommended_fat).toFixed(0)
						weightRecently.tdee = parseInt(weightRecently.tdee).toFixed(0)

						that.setData({
							weightRecently: weightRecently,
							'userInfo.age': age
						})
						wx.setStorageSync('userInfo', that.data.userInfo)
						that.getIntakeDailyData(date)

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
		getIntakeDailyData(date) {
			var that = this;
			let postData = {
				date: date
			}
			utils.getData({
				url: 'health/userIntake/daily',
				params: postData,
				success: function (res) {
          if (res.code == 200) {
						let availableCalories = that.data.weightRecently.tdee - res.data.calories
						res.data.availableCalories = availableCalories < 0 ? 0 : availableCalories
						res.data.percent = (res.data.calories / that.data.weightRecently.tdee * 100).toFixed(0)
						
						// 处理carbohydrate、protein、fat
						res.data.calories = parseInt(res.data.calories).toFixed(0)
						res.data.carbohydrate = parseInt(res.data.carbohydrate).toFixed(0)
						res.data.carbohydrate_percent = (res.data.carbohydrate / that.data.weightRecently.recommended_carbs * 100).toFixed(0)
						res.data.protein = parseInt(res.data.protein).toFixed(0)
						res.data.protein_percent = (res.data.protein / that.data.weightRecently.recommended_protein * 100).toFixed(0)
						res.data.fat = parseInt(res.data.fat).toFixed(0)
						res.data.fat_percent = (res.data.fat / that.data.weightRecently.recommended_fat * 100).toFixed(0)

						that.setData({
							intakeDailyData: res.data,
							intake_id: res.data.id
						})

						that.updateCircle(that.data.intakeDailyData.percent)
						that.getEatingList()
						
					}else{
						wx.showToast({
							title: res.message,
							icon: 'none',
						})
					}
				}
			})
		},
		updateCircle(percent) {
			var that = this;
      // 计算 conic-gradient 样式
      const gradient = `conic-gradient(
        #18181B 0%, 
        #18181B ${percent}%, 
        #CDCDD0 ${percent}%, 
        #CDCDD0 100%
      )`;

      // 动态设置 circle-box 背景
      that.setData({
        circleBackground: gradient,
      });
    },
		getEatingList() {
			var that = this;
			let postData = {
				user_intake_id: that.data.intake_id
			}
			utils.getData({
				url: 'health/userIntakeFoods/list',
				params: postData,
				success: function (res) {
					if (res.code == 200) {
						
						// eating_type 1:早餐 2:午餐 3:晚餐 4:加餐
						let eatingList = [{
							eating_type: 1,
							eating_typeTitle: '早餐',
							calories: 0,
							suggested: (that.data.weightRecently.tdee * 0.2).toFixed(0) + '-' + (that.data.weightRecently.tdee * 0.25).toFixed(0),
							list: []
						},{
							eating_type: 2,
							eating_typeTitle: '午餐',
							calories: 0,
							suggested: (that.data.weightRecently.tdee * 0.35).toFixed(0) + '-' + (that.data.weightRecently.tdee * 0.4).toFixed(0),
							list: []
						},{
							eating_type: 3,
							eating_typeTitle: '晚餐',
							calories: 0,
							suggested: (that.data.weightRecently.tdee * 0.3).toFixed(0) + '-' + (that.data.weightRecently.tdee * 0.35).toFixed(0),
							list: []
						},{
							eating_type: 4,
							eating_typeTitle: '加餐',
							calories: 0,
							suggested: '0',
							list: []
						}]

						// 处理每个食物项并分配到对应的餐次
						res.data.forEach(item => {
							// 处理数值格式
							item.calories = parseInt(item.calories).toFixed(0)
							item.foods_weight = parseInt(item.foods_weight).toFixed(0)
							item.carbohydrate = parseInt(item.carbohydrate).toFixed(0)
							item.protein = parseInt(item.protein).toFixed(0)
							item.fat = parseInt(item.fat).toFixed(0)
							item.cellulose = parseInt(item.cellulose).toFixed(0)

							// 找到对应的餐次并添加到列表中
							const mealIndex = eatingList.findIndex(meal => meal.eating_type == item.eating_type)
							if (mealIndex !== -1) {
								eatingList[mealIndex].list.push(item)
								eatingList[mealIndex].calories += parseInt(item.calories)
							}
						})

						// 格式化每个餐次的总卡路里
						eatingList.forEach(meal => {
							meal.calories = meal.calories.toFixed(0)
						})

						that.setData({
							eatingList: eatingList
						})
						
					}
				}
			})
		},

		// 添加补充身体信息
		addSupplementInfo() {
			var that = this;
			this.triggerEvent('toggleTabBar', { show: false }, {});
			if (!that.data.userInfo.height) {
				that.setData({
					showSupplementDrawer: true,
					supplementStep: 1
				})
				return;

			} else if (that.data.userInfo.height) {
				let age = new Date().getFullYear() - that.data.userInfo.birthday.split('-')[0];
				that.setData({
					showSupplementDrawer: true,
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

		// 处理活动系数选择
		handleActivityTypeChange(e) {
			const index = e.detail.value;
			this.setData({
				'formData.activityCoefficient': this.data.activityCoefficientTypes[index].value,
				'formData.activityCoefficientTitle': this.data.activityCoefficientTypes[index].title,
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
		closeSupplementDrawer() {
			var that = this;
			wx.showModal({
				title: '再等等，即刻完成',
				content: '信息不完善将不能使用健康模块',
				success: function (res) {
					if (res.confirm) {
						that.triggerEvent('toggleTabBar', { show: true }, {});
						that.setData({
							showSupplementDrawer: false,
						});
						wx.redirectTo({
							url: '/pages/today/index'
						});
					}
				}
			});
		},

		// 提交身体信息表单
		submitForm() {
			const that = this;
			const { weight, target_weight, target_type, activityCoefficient } = that.data.formData;
			
			// 验证必填字段
			if (!weight || !target_weight || !target_type || !activityCoefficient) {
				wx.showToast({
					title: '请填写必填项',
					icon: 'none'
				});
				return;
			}

			var tdee = that.data.formData.bmr * that.data.formData.activityCoefficient
			var intake_ratio = {
				carbs: target_type == 1 ? 0.45 : target_type == 2 ? 0.50 : 0.55,
				protein: target_type == 1 ? 0.25 : target_type == 2 ? 0.20 : 0.30,
				fat: target_type == 1 ? 0.2 : target_type == 2 ? 0.25 : 0.2,
			}
			let recommended_carbs = (tdee * intake_ratio.carbs).toFixed(0)
			let recommended_protein = (tdee * intake_ratio.protein).toFixed(0)
			let recommended_fat = (tdee * intake_ratio.fat).toFixed(0)

			// 获取当前日期
			let postData = {
				date: that.data.currentDate,
				weight: that.data.formData.weight,
				target_weight: that.data.formData.target_weight,
				target_type: that.data.formData.target_type,
				bmi: that.data.formData.bmi,
				bmr: that.data.formData.bmr,
				activityCoefficient: that.data.formData.activityCoefficient,
				tdee: tdee,
				recommended_carbs: recommended_carbs,
				recommended_protein: recommended_protein,
				recommended_fat: recommended_fat,
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
							showSupplementDrawer: false,
						});
						that.getWeightData(that.data.currentDate); // 刷新列表
					} else {
						wx.showToast({
							title: res.message,
							icon: 'none'
						});
					}
				}
			});
		},


		// 添加食物
		addFoods() {
			var that = this;
			that.triggerEvent('toggleTabBar', { show: false }, {});
			that.setData({
				showSelectFoodsDrawer: true
			})
			that.getFoodList()
		},

		closeSelectFoodsDrawer() {
			var that = this;
			that.triggerEvent('toggleTabBar', { show: true }, {});
			that.setData({
				showSelectFoodsDrawer: false,
				searchValue: '',
				page: 1,
				notData: false,
				foodList: [],
				currentType: 1,
				modifyEatingFoodStatus: false,
			})
		},

		// 处理搜索输入
		handleSearchInput(e) {
			var that = this;
			const value = e.detail.value;
			that.setData({
				searchValue: value,
				page: 1,
				notData: false,
				foodList: [],
				currentType: 0
			});
			
			that.getFoodList();
		},

		// 处理分类选择
		handleTypeSelect(e) {
			var that = this;
			const { id } = e.currentTarget.dataset;
			if(id == 0) return;
			that.setData({
				searchValue: '',
				currentType: id,
				page: 1,
				notData: false,
				foodList: []
			});
			that.getFoodList();
		},

		// 获取食物列表
		getFoodList() {
			const that = this;
			const postData = {};
			
			if (that.data.searchValue) {
				postData.name = that.data.searchValue;
			} else if (that.data.currentType !== 0) {
				postData.category = that.data.foodType[that.data.currentType].name;
				postData.page = that.data.page;
				postData.limit = 10;
			}

			utils.getData({
				url: 'health/food/list',
				params: postData,
				success: function (res) {
					if (res.code == 200) {
						if(res.data.list.length == 0) {
							that.setData({
								notData: true
							});
							return;
						}
						res.data.list.forEach(lis => {
							lis.nutrition.forEach(item => {
								item.amount_per_100g = parseInt(item.amount_per_100g).toFixed(0)
							})
						})
						
						that.setData({
							foodList: [...that.data.foodList, ...res.data.list]
						});
					}
				}
			});
		},

		// 加载更多
		loadMore() {
			if (this.data.searchValue) return; // 搜索时不加载更多
			if (this.data.notData) return; // 没有数据时不加载更多
			this.setData({
				page: this.data.page + 1
			});
			this.getFoodList();
		},

		// 选择食物
		handleFoodSelect(e) {
			var that = this;
			let food = e.currentTarget.dataset.item;
			// 初始化表单数据
			that.setData({
				selectedFood: food,
				showFoodDetailDrawer: true,
				modifyEatingFoodStatus: false,
				foodDetailForm: {
					user_intake_id: that.data.intake_id,
					food_id: food.id,
				}
			});
			
		},

		// 关闭食物详情弹窗
		closeFoodDetailDrawer() {
			var that = this;
			if(that.data.modifyEatingFoodStatus) {
				that.triggerEvent('toggleTabBar', { show: true }, {});
				that.setData({
					modifyEatingFoodStatus: false,
				})
			}
			this.setData({
				showFoodDetailDrawer: false,
				selectedFood: null,
				foodDetailForm: {}
			});
		},

		// 处理用餐时间选择
		handleMealTimeChange(e) {
			var that = this;
			const index = e.detail.value;
			that.setData({
				'foodDetailForm.eating_type': that.data.mealTimes[index].value,
				'foodDetailForm.eating_typeTitle': that.data.mealTimes[index].title
			});
			
		},

		// 处理食用重量输入
		handleWeightDetailInput(e) {
			var that = this;
			const weight = e.detail.value == '' ? 0 : parseInt(e.detail.value);
			
			// 计算实际热量
			let calories = that.data.selectedFood.nutrition.find(item => item.nutrient_type == 1).amount_per_100g * weight / 100
			let carbohydrate = that.data.selectedFood.nutrition.find(item => item.nutrient_type == 2).amount_per_100g * weight / 100
			let protein = that.data.selectedFood.nutrition.find(item => item.nutrient_type == 3).amount_per_100g * weight / 100
			let fat = that.data.selectedFood.nutrition.find(item => item.nutrient_type == 4).amount_per_100g * weight / 100
			let cellulose = that.data.selectedFood.nutrition.find(item => item.nutrient_type == 5).amount_per_100g * weight / 100
			that.setData({
				'foodDetailForm.foods_weight': weight.toFixed(0),
				'foodDetailForm.calories': calories.toFixed(0),
				'foodDetailForm.carbohydrate': carbohydrate.toFixed(0),
				'foodDetailForm.protein': protein.toFixed(0),
				'foodDetailForm.fat': fat.toFixed(0),
				'foodDetailForm.cellulose': cellulose.toFixed(0)
			});
		},

		// ? ---修改 --- 
		handleModify(e) {
			var that = this;
			let item = e.currentTarget.dataset.food;
			that.triggerEvent('toggleTabBar', { show: false }, {});
			
			that.setData({
				selectedFood: item.food_info,
				foodDetailForm: {
					id: item.id,
					user_intake_id: item.user_intake_id,
					food_id: item.food_id,
					eating_type: item.eating_type,
					eating_typeTitle: that.data.mealTimes.find(lis => lis.value == item.eating_type).title,
					foods_weight: item.foods_weight,
					calories: item.calories,
					carbohydrate: item.carbohydrate,
					protein: item.protein,
					fat: item.fat,
					cellulose: item.cellulose
				},
				modifyEatingFoodStatus: true,
				showFoodDetailDrawer: true,
			});
		},
		handleDelete(e) {
			var that = this;
			let id = e.currentTarget.dataset.id;
			let postData = {
				id: id,
				user_intake_id: that.data.intake_id,
			}
			utils.getData({
				url: 'health/userIntakeFoods/delete',
				params: postData,
				success: (res) => {
					if(res.code == 200) {
						wx.showToast({
							title: '删除成功',
							icon: 'success'
						});
						that.getIntakeDailyData(that.data.intakeDailyData.date);

					}
				}
			});
		},
		openCloseMovable(e) {
			var that = this;
			let mealIndex = e.currentTarget.dataset.mealindex; // 餐次索引
			let foodIndex = e.currentTarget.dataset.foodindex; // 食物索引
			
			// 深拷贝 eatingList
			let eatingList = JSON.parse(JSON.stringify(that.data.eatingList));
			
			// 为食物项添加 x 属性（如果不存在）
			if (!eatingList[mealIndex].list[foodIndex].hasOwnProperty('x')) {
				eatingList[mealIndex].list[foodIndex].x = 0;
			}

			// 关闭其他所有项的滑动状态
			eatingList.forEach((meal, i) => {
				meal.list.forEach((food, j) => {
					if (i !== mealIndex || j !== foodIndex) {
						food.x = 0;
					}
				});
			});

			// 切换当前项的滑动状态
			eatingList[mealIndex].list[foodIndex].x = 
				eatingList[mealIndex].list[foodIndex].x === -180 ? 0 : -180;

			that.setData({
				eatingList: eatingList
			});
		},
		closeMovable() {
			var that = this;
			let eatingList = JSON.parse(JSON.stringify(that.data.eatingList));
			
			// 关闭所有项的滑动状态
			eatingList.forEach(meal => {
				meal.list.forEach(food => {
					food.x = 0;
				});
			});

			that.setData({
				eatingList: eatingList
			});
		},
		// 提交食物详情
		submitFoodDetail() {
			const that = this;
			const { eating_type, foods_weight } = that.data.foodDetailForm;
			
			// 验证必填字段
			if (!eating_type || !foods_weight) {
				wx.showToast({
					title: '请填写必填项',
					icon: 'none'
				});
				return;
			}
			

			let postData = {
				eating_type: "",
				user_intake_id: "",
				food_id: "",
				calories: "",
				carbohydrate: "",
				fat: "",
				protein: "",
				cellulose: "",
			};
			if(that.data.modifyEatingFoodStatus) {
				postData.id = that.data.foodDetailForm.id
			}
			Object.keys(that.data.foodDetailForm).forEach(key => {
				postData[key] = that.data.foodDetailForm[key];
			});
			

			utils.getData({
				url: that.data.modifyEatingFoodStatus ? 'health/userIntakeFoods/update' : 'health/userIntakeFoods/add',
				params: postData,
				success: (res) => {
					if (res.code === 200) {
						wx.showToast({
							title: that.data.modifyEatingFoodStatus ? '修改成功' : '添加成功',
							icon: 'success'
						});
						that.closeFoodDetailDrawer();
						that.closeSelectFoodsDrawer();
						that.getIntakeDailyData(that.data.intakeDailyData.date);
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
				userInfo: wx.getStorageSync('userInfo'),
				currentDate: new Date().toISOString().split('T')[0]
			})
			that.getWeekendData()
			that.getWeightData(that.data.currentDate)
		}
	}

})