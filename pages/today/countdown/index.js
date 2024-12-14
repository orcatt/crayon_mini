// pages/today/index.js
var utils = require('../../../api/util.js');
import { calendar } from '../../../utils/calendar'

Component({
  properties: {

  },
  data: {
		tabbarRealHeight: 0,
		countdownData: [],
		showMaskDrawer: false,
		frequency: [{
			title: '每天',
			value: 'daily'
		}, {
			title: '每周',
			value: 'weekly'
		},{
			title: '每月',
			value: 'monthly'
		},{
			title: '每年',
			value: 'yearly'
		}],
		formData: {
			title: '',
			calendar_type: "", // 历法类型：公历gregorian / 农历lunar
			gregorian_date: "", // 公历日期
			lunar_date: "", // 农历日期
			is_pinned: false, // 是否置顶
			is_reminder: true, // 是否提醒
			reminder_frequency: "daily", // 提醒频率 daily / weekly / monthly / yearly
			reminder_frequencyTitle: '', // 提醒频率标题，不传值
			is_repeating: false, // 是否重复
			repeat_frequency: "daily", // 重复频率 daily / weekly / monthly / yearly
			repeat_frequencyTitle: '' // 重复频率标题，不传值
		},
		lunarPickerStatus: false,
		countdownModifyStatus: false
  },
  methods: {
		
		getCountdownData() {
			var that = this;
			var today = new Date().toISOString().split('T')[0];
			
			utils.getData({
        url: 'today/countdown/list',
        params: '',
				method: 'GET',
        success: function (res) {
          if (res.code == 200) {
						console.log(res.data);
						let countdownData = res.data.map(item => {
							// 计算日期差值
							const diffTime = Math.floor((new Date(item.gregorian_date) - new Date(today)) / (1000 * 60 * 60 * 24));
							
							let timeInfo = {
								diffDays: Math.abs(diffTime),
								type: diffTime > 0 ? 'distance' : diffTime < 0 ? 'pass' : 'today',
								des: diffTime > 0 ? '还有' : diffTime < 0 ? '已经' : '就是今天'
							};
							
							return {
								...item,
								timeInfo
							};
						});
						
						that.setData({
							countdownData
						})
						console.log(that.data.countdownData);
						
          }else{
            wx.showToast({
              title: res.message,
              icon: 'none',
            })
          }
        }
      })
		},
		
		// 处理滑动变化
		// handleCdMovableChange(e) {
		// 	var that = this;
		// 	if (e.detail.source === 'touch') {
		// 		const moveX = e.detail.x;
		// 		const index = e.currentTarget.dataset.index;
		// 		let countdownData = [...that.data.countdownData];

		// 		// 重置其他项的位置
		// 		countdownData.forEach((item, idx) => {
		// 			if (idx !== index) {
		// 				item.x = 0;
		// 			}
		// 		});

		// 		// 自动展开逻辑
		// 		if (moveX < -30) {  // 左滑超过一半，自动展开到-90
		// 			countdownData[index].x = -180;
		// 		} else if (moveX > 30) {  // 右滑超过一半，自动展开到90
		// 			countdownData[index].x = 180;
		// 		} else {
		// 			countdownData[index].x = moveX;
		// 		}

		// 		that.setData({
		// 			countdownData: countdownData
		// 		});
		// 	}
		// },
		openCloseCdMovable(e){
			var that = this;
			let index = e.currentTarget.dataset.index;
			let countdownData = [...that.data.countdownData];
			if (countdownData[index].x == -180) {
				countdownData.forEach(item => {
					item.x = 0;
				});
			}else{
				countdownData.forEach((item, idx) => {
					item.x = idx === index ? -180 : 0;
				});
			}
			that.setData({
				countdownData: countdownData
			});
		},
		closeCdMovable(e) {
			var that = this;
			let countdownData = [...that.data.countdownData];
			countdownData.forEach((item, idx) => {
				item.x = 0
			});
			that.setData({
				countdownData: countdownData
			});
		},
		handleCdModify(e) {
			const that = this;
			// 触发事件隐藏 TabBar
			this.triggerEvent('toggleTabBar', { show: false }, {});
			const index = e.currentTarget.dataset.index;
			const item = that.data.countdownData[index];
			
			const reminder_frequencyTitle = that.data.frequency.find(lis => lis.value === item.reminder_frequency).title;
			const repeat_frequencyTitle = that.data.frequency.find(lis => lis.value === item.repeat_frequency).title;
			// 打开编辑页面并填充数据
			that.setData({
				showMaskDrawer: true,
				countdownModifyStatus: true,
				formData: {
					id: item.id,
					title: item.title,
					calendar_type: item.calendar_type,
					gregorian_date: item.gregorian_date,
					lunar_date: item.lunar_date,
					is_pinned: item.is_pinned,
					is_reminder: item.is_reminder,
					reminder_frequency: item.reminder_frequency,
					reminder_frequencyTitle: reminder_frequencyTitle,
					is_repeating: item.is_repeating,
					repeat_frequency: item.repeat_frequency,
					repeat_frequencyTitle: repeat_frequencyTitle
				}
			});
		},
		// 处理删除
		handleCdDelete(e) {
			const that = this;
			const id = e.currentTarget.dataset.id;
			let postData = {
				countdownId: id,
			}
			wx.showModal({
				title: '提示',
				content: '要删除这条待办吗？',
				success(res) {
					if (res.confirm) {
						utils.getData({
							url: 'today/countdown/delete',
							params: postData,
							method: 'DELETE', 
							success: (res) => {
								if (res.code === 200) {
									wx.showToast({
										title: '删除成功',
										icon: 'success'
									});
									if (that.data.countdownModifyStatus) {
										that.closeCdMaskDrawer();
									}
									that.getCountdownData();
								} else {
									wx.showToast({
										title: res.message,
										icon: 'none'
									});
								}
							}
						});
					}
				}
			});
		},
		addCountdown() {
			this.triggerEvent('toggleTabBar', { show: false }, {});
			var that = this;
			that.closeCdMovable();
			
			// 初始化表单数据
			that.setData({
				showMaskDrawer: true,
				countdownModifyStatus: false,
				formData: {
					title: '',
							calendar_type: 'gregorian', // 默认公历
							gregorian_date: '', 
							lunar_date: '',
							is_pinned: false,
							is_reminder: false,
							reminder_frequency: 'daily',
							reminder_frequencyTitle: '',
							is_repeating: false,
							repeat_frequency: 'daily',
							repeat_frequencyTitle: ''
				}
			});
		},
		closeCdMaskDrawer() {
			// 触发事件显示 TabBar
			this.triggerEvent('toggleTabBar', { show: true }, {});
			
			this.setData({
				showMaskDrawer: false,
				countdownModifyStatus: false
			});
		},
		// 处理标题输入
		handleTitleInput(e) {
			this.setData({
				'formData.title': e.detail.value
			})
		},
		// 处理日期类型切换
		handleCalendarTypeChange(e) {
			const type = e.detail.value ? 'gregorian' : 'lunar';
			this.setData({
				'formData.calendar_type': type
			});
		},
		// 处理公历日期选择
		handleGregorianDateChange(e) {
			var that = this;
			const gregorianDate = e.detail.value;
			const [year, month, day] = gregorianDate.split('-').map(Number);
			// 使用calendar库将公历转换为农历
			const lunarDate = calendar.solar2lunar(year, month, day);
			that.setData({
				'formData.gregorian_date': gregorianDate,
				'formData.lunar_date': `${lunarDate.lYear} ${lunarDate.gzYear} ${lunarDate.IMonthCn} ${lunarDate.IDayCn}`
			});
			console.log('农历:', that.data.formData);

		},
		// 显示农历选择器
		showLunarPicker() {
			this.setData({
				lunarPickerStatus: true
			});
		},
		handleLunarDateChange(e) {
			var that = this;
			const { lunar, solar } = e.detail;
			that.setData({
				'formData.lunar_date': lunar,
				'formData.gregorian_date': solar  // 如果需要保存公历日期
			});
		},
		// 处理置顶切换
		handlePinnedChange(e) {
			this.setData({
				'formData.is_pinned': e.detail.value
			});
		},
		// 处理提醒切换
		handleReminderChange(e) {
			this.setData({
				'formData.is_reminder': e.detail.value
			});
		},
		// 处理提醒频率选择
		handleReminderFrequencyChange(e) {
			var that = this;
			that.setData({
				'formData.reminder_frequencyTitle': that.data.frequency[e.detail.value].title,
				'formData.reminder_frequency': that.data.frequency[e.detail.value].value
			});
		},
		// 处理重复切换
		handleRepeatingChange(e) {
			this.setData({
				'formData.is_repeating': e.detail.value
			});
		},
		// 处理重复频率选择
		handleRepeatFrequencyChange(e) {
			var that = this;
			that.setData({
				'formData.repeat_frequencyTitle': that.data.frequency[e.detail.value].title,
				'formData.repeat_frequency': that.data.frequency[e.detail.value].value
			});
		},
		submitForm() {
			const that = this;
			const { title, calendar_type, gregorian_date, lunar_date } = that.data.formData;
			
			// 验证必填字段
			if (!title && !gregorian_date && !lunar_date) {
				wx.showToast({
					title: '请填写必填项',
					icon: 'none'
				});
				return;
			}

			// 判断是新增还是修改
			const url = that.data.countdownModifyStatus ? 'today/countdown/update' : 'today/countdown/add';
			let submitFormData = that.data.formData;
			delete submitFormData.repeat_frequencyTitle;
			delete submitFormData.reminder_frequencyTitle;
			utils.getData({
				url: url,
				params: submitFormData,
				success: (res) => {
					if (res.code === 200) {
						wx.showToast({
							title: that.data.countdownModifyStatus ? '修改成功' : '添加成功',
							icon: 'success'
						});
						that.closeCdMaskDrawer();
						that.getCountdownData(); // 刷新列表
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
				tabbarRealHeight: wx.getStorageSync('tabbarRealHeight')
			})
			that.getCountdownData()
		}
	}

})