// pages/today/index.js
var utils = require('../../../api/util.js');

Component({
	properties: {

	},
	data: {
		tabbarRealHeight: 0,
		loginStatus: false,
		LoginModal: false,
		cardData: {},
		todoData: [],
	},
	methods: {
		goTodo() {
			// 触发父组件的事件，切换到待办标签
			this.triggerEvent('switchTab', { id: 1 });
		},

		getCardData() {
			var that = this;
			// 获取今日日期
			var date = new Date().toISOString().split('T')[0];
			let postData = {
				date: date
			}
			utils.getData({
				url: 'today/getAlmanac',
				params: postData,
				method: 'GET',
				success: function (res) {
					if (res.code == 200) {
						let listData = res.data;
						listData.lunardate = listData.lunardate.split('-')
						
						listData.lunardateMonth = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'][listData.lunardate[1]-1] + '月'
						listData.lunardateDay = listData.lunardate[2]
						// 根据年月日取星期几
						var date = new Date(listData.lunardate[0], listData.lunardate[1], listData.lunardate[2]);
						listData.lunardateWeek = date.getDay();
						listData.lunardateWeek = '星期' + ['日', '一', '二', '三', '四', '五', '六'][listData.lunardateWeek]

						listData.lunar_festival = listData.lunar_festival ? listData.lunar_festival : listData.jieqi ? listData.jieqi : '无'

						listData.fitness = listData.fitness.split('.')
						listData.taboo = listData.taboo.split('.')
						listData.shenwei = listData.shenwei.replace(/：/g, '').split(' ')
						// 去除shenwei最后的空项
						listData.shenwei = listData.shenwei.filter(item => item !== '')

						listData.pengzu = listData.pengzu.split(' ')
						that.setData({
							cardData: listData
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
		
	},
	lifetimes: {
		attached: function () {
			var that = this;
			that.setData({
				tabbarRealHeight: wx.getStorageSync('tabbarRealHeight')
			})
			that.getCardData()
		}
	}
})