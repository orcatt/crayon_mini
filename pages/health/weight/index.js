var utils = require('../../../api/util.js');

Component({
	properties: {

	},
	data: {
		tabbarRealHeight: 0,
		userInfo: {},
		currentDate: '',
		weightDailyId: null,
		weightRecently: {},
		maxWeight: 0,
		minWeight: 0,
		weightList: [],
		
		showTooltip: false,
		tooltipX: 0,
		tooltipY: 0,
		tooltipDate: '',
		tooltipWeight: '',
		chartConfig: null,
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
		activityCoefficientTypes: [{
			title: '久不动',
			value: '1.20'
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
			weight: '',
			target_weight: '',
			target_type: '',
			target_typeTitle: '',
			date: '',
			bmi: '',
			bmr: '',
			tdee: "", // 总能量消耗
			activityCoefficient: "", // 活动系数
			activityCoefficientTitle: "",
			recommended_carbs: "", // 推荐碳水
			recommended_protein: "", // 推荐蛋白质
			recommended_fat: "", // 推荐脂肪
		}
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
							weightDailyId: res.data.id,
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

			utils.getData({
				url: 'health/userWeight/maxMin',
				params: postData,
				success: function (res) {
					if (res.code == 200) {
						that.setData({
							maxWeight: res.data.max_weight,
							minWeight: res.data.min_weight
						})
					} else {
						wx.showToast({
							title: res.message,
							icon: 'none',
						})
					}
				}
			})


		},
		getWeightList() {
			let that = this;
			// 转换成yyyy-mm-dd
			let startDate = new Date(new Date(that.data.currentDate).getTime() - 1000 * 60 * 60 * 24 * 30).toISOString().split('T')[0]
			let endDate = new Date(that.data.currentDate).toISOString().split('T')[0]
			let postData = {
				start_date: startDate,
				end_date: endDate,
			}

			utils.getData({
				url: 'health/userWeight/list',
				params: postData,
				success: function (res) {
					if (res.code == 200) {
						// 倒序
						let weightList = res.data.reverse()
						that.setData({
							weightList: weightList
						}, () => {
							that.drawWeightChart(); // 获取数据后绘制图表
						})

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
		},

		async drawWeightChart() {
			const that = this;
			const query = wx.createSelectorQuery().in(this);
			const canvas = await new Promise(resolve => {
				query.select('#weightChart')
					.fields({ node: true, size: true })
					.exec((res) => {
						resolve(res[0]);
					});
			});

			if (!canvas) return;

			const ctx = canvas.node.getContext('2d');
			const dpr = wx.getSystemInfoSync().pixelRatio;
			canvas.node.width = canvas.width * dpr;
			canvas.node.height = canvas.height * dpr;
			ctx.scale(dpr, dpr);

			const weightData = that.data.weightList.map(item => ({
				date: new Date(item.date),
				weight: parseFloat(item.weight)
			})).sort((a, b) => a.date - b.date);

			if (weightData.length === 0) return;

			const padding = {
				top: 20,
				right: 20,
				bottom: 30,
				left: 40
			};
			const width = canvas.width - padding.left - padding.right;
			const height = canvas.height - padding.top - padding.bottom;

			const minWeight = Math.min(...weightData.map(d => d.weight)) - 1;
			const maxWeight = Math.max(...weightData.map(d => d.weight)) + 1;

			const segmentCount = 30;
			const segmentWidth = width / segmentCount;

			const yScale = (y) => {
				const range = maxWeight - minWeight;
				return padding.top + height - ((y - minWeight) / range) * height;
			};

			const segments = Array(segmentCount).fill(null);
			weightData.forEach((data) => {
				const index = Math.floor((data.date - weightData[0].date) /
					(weightData[weightData.length - 1].date - weightData[0].date) * segmentCount);
				segments[index] = data;
			});

			// 绘制背景渐变
			const gradient = ctx.createLinearGradient(0, padding.top, 0, height + padding.top);
			gradient.addColorStop(0, 'rgba(205, 205, 208, 0.5)');
			gradient.addColorStop(1, 'rgba(205, 205, 208, 0.1)');

			ctx.beginPath();
			ctx.moveTo(padding.left, height + padding.top);
			segments.forEach((data, index) => {
				const x = padding.left + index * segmentWidth;
				if (data) {
					const y = yScale(data.weight);
					ctx.lineTo(x, y);
				}
			});
			ctx.lineTo(padding.left + width, height + padding.top);
			ctx.closePath();
			ctx.fillStyle = gradient;
			ctx.fill();

			// 绘制折线
			ctx.beginPath();
			segments.forEach((data, index) => {
				const x = padding.left + index * segmentWidth;
				if (data) {
					const y = yScale(data.weight);
					ctx.lineTo(x, y);
				}
			});
			ctx.strokeStyle = '#CDCDD0';
			ctx.lineWidth = 2;
			ctx.stroke();

			// 绘制数据点
			segments.forEach((data, index) => {
				if (data) {
					const x = padding.left + index * segmentWidth;
					const y = yScale(data.weight);
					ctx.beginPath();
					ctx.arc(x, y, 4, 0, Math.PI * 2);
					ctx.fillStyle = '#18181B';
					ctx.fill();
				}
			});

			// 绘制X轴
			ctx.strokeStyle = '#71717A';
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.moveTo(padding.left, height + padding.top);
			ctx.lineTo(padding.left + width, height + padding.top);
			ctx.stroke();

			// 绘制Y轴
			ctx.beginPath();
			ctx.moveTo(padding.left, padding.top);
			ctx.lineTo(padding.left, height + padding.top);
			ctx.stroke();

			// 绘制Y轴刻度
			ctx.fillStyle = '#71717A';
			ctx.font = '12px sans-serif';
			ctx.textAlign = 'right';
			const yTicks = 5;
			for (let i = 0; i <= yTicks; i++) {
				const y = minWeight + (maxWeight - minWeight) * (i / yTicks);
				ctx.fillText(y.toFixed(1), padding.left - 5, yScale(y) + 4);
			}

			// 绘制X轴日期
			ctx.textAlign = 'center';
			segments.forEach((data, index) => {
				if (data && index % 3 === 0) {
					const x = padding.left + index * segmentWidth;
					const date = data.date.getDate();
					ctx.fillText(date, x, height + padding.top + 20);
				}
			});

			that.setData({
				chartConfig: {
					padding,
					width,
					height,
					segmentWidth,
					segments,
					yScale
				}
			});
		},

		handleTouchStart(e) {
			this.findSegment(e.touches[0].x);
		},
		handleTouchMove(e) {
			this.findSegment(e.touches[0].x);
		},
		handleTouchEnd() {
			this.setData({
				showTooltip: false
			});
		},

		findSegment(touchX) {
			const that = this;
			const { chartConfig } = that.data;
			if (!chartConfig) return;

			const { padding, segmentWidth, segments, yScale } = chartConfig;
			const canvasX = touchX - padding.left;
			const segmentIndex = Math.floor(canvasX / segmentWidth);

			if (segmentIndex >= 0 && segmentIndex < segments.length && segments[segmentIndex]) {
				const data = segments[segmentIndex];
				const x = padding.left + segmentIndex * segmentWidth;
				const y = yScale(data.weight) - 25;

				that.setData({
					showTooltip: true,
					tooltipX: x,
					tooltipY: y,
					tooltipDate: data.date.toLocaleDateString('zh-CN', {
						month: 'numeric',
						day: 'numeric'
					}),
					tooltipWeight: data.weight.toFixed(1)
				});
			} else {
				that.setData({
					showTooltip: false
				});
			}
		},


		// 打开新增抽屉
		addWeight() {
			var that = this;
			that.triggerEvent('toggleTabBar', { show: false }, {});

			const now = new Date();
			const currentDate = now.toISOString().split('T')[0];

			that.setData({
				showMaskDrawer: true,
				formData: {
					weight: that.data.weightRecently.weight,
					target_weight: that.data.weightRecently.target_weight,
					target_type: that.data.weightRecently.target_type,
					target_typeTitle: that.data.targetTypes[that.data.weightRecently.target_type - 1].title,
					date: currentDate,
					bmi: that.data.weightRecently.bmi,
					bmr: that.data.weightRecently.bmr,
					tdee: that.data.weightRecently.tdee,
					activityCoefficient: that.data.weightRecently.activityCoefficient,
					activityCoefficientTitle: that.data.activityCoefficientTypes.find(item => item.value == that.data.weightRecently.activityCoefficient)?.title || '',
					recommended_carbs: that.data.weightRecently.recommended_carbs,
					recommended_protein: that.data.weightRecently.recommended_protein,
					recommended_fat: that.data.weightRecently.recommended_fat
				}
			});
			
		},

		// 关闭抽屉
		closeMaskDrawer() {
			var that = this;
			that.triggerEvent('toggleTabBar', { show: true }, {});
			that.setData({
				showMaskDrawer: false
			});
		},

		// 处理体重输入
		handleWeightInput(e) {
			this.setData({
				'formData.weight': e.detail.value
			});
			this.calculateBMI();
			this.calculateBMR();
		},

		handleTargetWeightInput(e) {
			this.setData({
				'formData.target_weight': e.detail.value
			});
		},

		handleTargetTypeChange(e) {
			const index = e.detail.value;
			this.setData({
				'formData.target_type': this.data.targetTypes[index].value,
				'formData.target_typeTitle': this.data.targetTypes[index].title
			});
		},

		// 计算BMI
		calculateBMI() {
			const weight = parseFloat(this.data.formData.weight);
			const height = parseFloat(this.data.userInfo.height)/100;
			if (weight && height) {
				const bmi = (weight / (height * height)).toFixed(1);
				this.setData({
					'formData.bmi': bmi
				});
			}
		},

		// 计算基础代谢率
		calculateBMR() {
			const weight = parseFloat(this.data.formData.weight);
			const height = parseFloat(this.data.userInfo.height);
			const age = this.data.userInfo.age;
			const gender = this.data.userInfo.gender;
			
			if (weight && height && age) {
				const bmr = gender === 1 
					? (66 + (13.7 * weight) + (5 * height) - (6.8 * age)).toFixed(0)
					: (655 + (9.6 * weight) + (1.8 * height) - (4.7 * age)).toFixed(0);
				this.setData({
					'formData.bmr': bmr
				});
			}
		},

		// 计算TDEE和推荐营养摄入
		calculateTDEE() {
			const bmr = parseFloat(this.data.formData.bmr);
			const activityCoefficient = parseFloat(this.data.formData.activityCoefficient);
			
			if (bmr && activityCoefficient) {
				const tdee = (bmr * activityCoefficient).toFixed(0);
				const target_type = this.data.formData.target_type;
				
				// 根据目标类型设置不同的营养比例
				let intake_ratio = {
					carbs: target_type == 1 ? 0.45 : target_type == 2 ? 0.50 : 0.55,
					protein: target_type == 1 ? 0.25 : target_type == 2 ? 0.20 : 0.30,
					fat: target_type == 1 ? 0.2 : target_type == 2 ? 0.25 : 0.2,
				};

				// 计算推荐营养摄入
				const recommended_carbs = ((tdee * intake_ratio.carbs) / 4).toFixed(0);
				const recommended_protein = ((tdee * intake_ratio.protein) / 4).toFixed(0);
				const recommended_fat = ((tdee * intake_ratio.fat) / 9).toFixed(0);

				this.setData({
					'formData.tdee': tdee,
					'formData.recommended_carbs': recommended_carbs,
					'formData.recommended_protein': recommended_protein,
					'formData.recommended_fat': recommended_fat
				});
			}
		},

		// 处理活动系数选择
		handleActivityTypeChange(e) {
			const index = e.detail.value;
			this.setData({
				'formData.activityCoefficient': this.data.activityCoefficientTypes[index].value,
				'formData.activityCoefficientTitle': this.data.activityCoefficientTypes[index].title
			});
		},

		// 提交表单
		submitForm() {
			const that = this;
			const { weight, target_weight, target_type, date, bmi, bmr, activityCoefficient } = that.data.formData;

			if (!weight || !target_weight || !target_type || !date || !activityCoefficient) {
				wx.showToast({
					title: '请填写必填项',
					icon: 'none'
				});
				return;
			}

			var tdee = (that.data.formData.bmr * that.data.formData.activityCoefficient).toFixed(0)
			var intake_ratio = {
				carbs: target_type == 1 ? 0.45 : target_type == 2 ? 0.50 : 0.55,
				protein: target_type == 1 ? 0.25 : target_type == 2 ? 0.20 : 0.30,
				fat: target_type == 1 ? 0.2 : target_type == 2 ? 0.25 : 0.2,
			}
			let recommended_carbs = (tdee * intake_ratio.carbs).toFixed(0)
			let recommended_protein = (tdee * intake_ratio.protein).toFixed(0)
			let recommended_fat = (tdee * intake_ratio.fat).toFixed(0)

			const postData = {
				id: that.data.weightDailyId,
				date: date,
				weight: weight,
				target_weight: target_weight,
				target_type: target_type,
				bmi: bmi,
				bmr: bmr,
				tdee: tdee,
				activityCoefficient: activityCoefficient,
				recommended_carbs: recommended_carbs,
				recommended_protein: recommended_protein,
				recommended_fat: recommended_fat
			};

			utils.getData({
				url: 'health/userWeight/update',
				params: postData,
				method: 'POST',
				success: (res) => {
					if (res.code === 200) {
						wx.showToast({
							title: '更新成功',
							icon: 'success'
						});
						that.closeMaskDrawer();
						that.getWeightData(that.data.currentDate);
						that.getWeightList();
					} else {
						wx.showToast({
							title: res.message,
							icon: 'none'
						});
					}
				}
			});
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
			that.getWeightList()
		}
	}

})