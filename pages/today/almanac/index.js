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
						console.log(res.data);
						let listData = res.data;
						listData.lunardate = listData.lunardate.split('-')
						listData.lunardateMonth = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'][listData.lunardate[1]] + '月'
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
						console.log(that.data.cardData);

					} else {
						wx.showToast({
							title: res.message,
							icon: 'none',
						})
					}
				}
			})
		},
		getTodoData() {
			var that = this;
			// 获取今日日期
			var date = new Date().toISOString().split('T')[0];
			let postData = {
				page: 1,
				limit: 5,
				date: date
			}
			utils.getData({
				url: 'today/todo/list',
				params: postData,
				method: 'GET',
				success: function (res) {
					if (res.code == 200) {
						// 为每个项目添加x属性
						const list = res.data.list.map(item => ({
							...item,
							x: 0
						}));
						that.setData({
							todoData: list
						});
					} else {
						wx.showToast({
							title: res.message,
							icon: 'none',
						});
					}
				}
			});
		},
		
		// 处理滑动变化
		handleMovableChange(e) {
			var that = this;
			if (e.detail.source === 'touch') {
				const moveX = e.detail.x;
				const index = e.currentTarget.dataset.index;
				let todoData = [...that.data.todoData];

				// 重置其他项的位置
				todoData.forEach((item, idx) => {
					if (idx !== index) {
						item.x = 0;
					}
				});

				// 自动展开逻辑
				if (moveX < -30) {  // 左滑超过一半，自动展开到-90
					todoData[index].x = -180;
				} else if (moveX > 30) {  // 右滑超过一半，自动展开到90
					todoData[index].x = 180;
				} else {
					todoData[index].x = moveX;
				}

				that.setData({
					todoData: todoData
				});
			}
		},
		closeDrawer(e) {
			var that = this;	
			let todoData = [...that.data.todoData];
			todoData.forEach((item, idx) => {
				item.x = 0
			});
			that.setData({
				todoData: todoData
			});
		},
		handleDone(e) {
			const that = this;
			if(e.currentTarget.dataset.done == 1){
				that.closeDrawer()
				return;
			}

			let postData = {
				todoId: e.currentTarget.dataset.id,
				done: 1
			}
			utils.getData({
				url: 'today/todo/update',
				params: postData,
				success: (res) => {
					if (res.code === 200) {
						that.getTodoData();
					} else {
						wx.showToast({
							title: res.message,
							icon: 'none'
						});
					}
				}
			});
		},
		// 处理删除
		handleDelete(e) {
			const that = this;
			const id = e.currentTarget.dataset.id;
			let postData = {
				todoId: id,
			}
			wx.showModal({
				title: '提示',
				content: '要删除这条待办吗？',
				success(res) {
					if (res.confirm) {
						utils.getData({
							url: 'today/todo/delete',
							params: postData,
							method: 'DELETE', 
							success: (res) => {
								if (res.code === 200) {
									wx.showToast({
										title: '删除成功',
										icon: 'success'
									});
									that.getTodoData();
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

	},
	lifetimes: {
		attached: function () {
			var that = this;
			that.setData({
				tabbarRealHeight: wx.getStorageSync('tabbarRealHeight')
			})
			that.getCardData()
			that.getTodoData()
		}
	}

})