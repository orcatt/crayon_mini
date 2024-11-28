// pages/today/index.js
var utils = require('../../../api/util.js');

Component({
  properties: {

  },
  data: {
		tabbarRealHeight: 0,
		todoData: [],
		showMaskDrawer: false,
		formData: {
			title: '',
			date: '',
			time: '',
			alert: 1,
			description: '',
			category: ''
		}
  },
  methods: {
	
		getTodoData() {
			var that = this;
			// 获取今日日期
			var date = new Date().toISOString().split('T')[0];
			let postData = {
				page: 1,
				limit: 99,
				date: date
			}
			utils.getData({
        url: 'today/todo/list',
        params: postData,
				method: 'GET',
        success: function (res) {
          if (res.code == 200) {
						console.log(res.data);
						that.setData({
							todoData: res.data.list
						})
						
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
						// utils.getData({
						// 	url: 'today/todo/delete',
						// 	params: postData,
						// 	method: 'DELETE', 
						// 	success: (res) => {
						// 		if (res.code === 200) {
						// 			wx.showToast({
						// 				title: '删除成功',
						// 				icon: 'success'
						// 			});
						// 			that.getTodoData();
						// 		} else {
						// 			wx.showToast({
						// 				title: res.message,
						// 				icon: 'none'
						// 			});
						// 		}
						// 	}
						// });
					}
				}
			});
		},
		addTodo() {
			// 初始化表单数据
			const today = new Date();
			const dateStr = today.toISOString().split('T')[0];
			const timeStr = `${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`;
			
			this.setData({
				showMaskDrawer: true,
				formData: {
					title: '',
					date: dateStr,
					time: timeStr,
					alert: 1,
					description: '',
					category: ''
				}
			});
		},
		closeMaskDrawer() {
			this.setData({
				showMaskDrawer: false
			});
		},
		dateChange(e) {
			this.setData({
				'formData.date': e.detail.value
			});
		},
		timeChange(e) {
			this.setData({
				'formData.time': e.detail.value
			});
		},
		alertChange(e) {
			this.setData({
				'formData.alert': e.detail.value ? 1 : 0
			});
		},
		// 处理标题输入
		handleTitleInput(e) {
			this.setData({
				'formData.title': e.detail.value
			})
		},
	
		// 处理标签输入
		handleCategoryInput(e) {
			this.setData({
				'formData.category': e.detail.value
			})
		},
	
		// 处理描述输入
		handleDescriptionInput(e) {
			this.setData({
				'formData.description': e.detail.value
			})
		},
		submitForm() {
			var that = this;
			const { title, date, time, alert } = that.data.formData;
			
			// 验证必填字段
			console.log(that.data.formData);
			
			if (!title || !date || !time) {
				wx.showToast({
					title: '请填写必填项',
					icon: 'none'
				});
				return;
			}

			// TODO: 调用添加待办API
			utils.getData({
				url: 'today/todo/add',
				params: that.data.formData,
				success: (res) => {
					if (res.code === 200) {
						wx.showToast({
							title: '添加成功',
							icon: 'success'
						});
						that.closeDrawer();
						that.getTodoData(); // 刷新列表
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
				tabbarRealHeight: wx.getStorageSync('tabbarRealHeight')
			})
			that.getTodoData()
		}
	}

})