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
		},

		memosData: [],
		showMemosMaskDrawer: false,
		memosFormData: {
			title: '',
			date: '',
			time: '',
			content: ''
		},
		formats: {},
		editorCtx: null,
		memosModifyStatus: false
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
		getMemosData() {
			var that = this;
			let postData = {
				page: 1,
				limit: 999
			}
			utils.getData({
				url: 'today/memos/list',
				params: postData,
				method: 'GET',
				success: (res) => {
					if (res.code == 200) {
						// 去除res.data.content中的html标签
						res.data.forEach(item => {
							item.description = item.content.replace(/<[^>]*>|&nbsp;/g, '');
						});
						that.setData({
							memosData: res.data
						})
						console.log(res.data);
						
					}else{
						wx.showToast({
							title: res.message,
							icon: 'none'
						});
					}
				}
			})
		},
		

		// 处理滑动变化
		// handleTodoMovableChange(e) {
		// 	var that = this;
		// 	if (e.detail.source === 'touch') {
		// 		const moveX = e.detail.x;
		// 		const index = e.currentTarget.dataset.index;
		// 		let todoData = [...that.data.todoData];

		// 		// 重置其他项的位置
		// 		todoData.forEach((item, idx) => {
		// 			if (idx !== index) {
		// 				item.x = 0;
		// 			}
		// 		});

		// 		// 自动展开逻辑
		// 		if (moveX < -30) {  // 左滑超过一半，自动展开到-90
		// 			todoData[index].x = -180;
		// 		} else if (moveX > 30) {  // 右滑超过一半，自动展开到90
		// 			todoData[index].x = 180;
		// 		} else {
		// 			todoData[index].x = moveX;
		// 		}

		// 		that.setData({
		// 			todoData: todoData
		// 		});
		// 	}
		// },
		openCloseTodoMovable(e){
			var that = this;
			let index = e.currentTarget.dataset.index;
			let todoData = [...that.data.todoData];
			if (todoData[index].x == -180) {
				todoData.forEach(item => {
					item.x = 0;
				});
			}else{
				todoData.forEach((item, idx) => {
					item.x = idx === index ? -180 : 0;
				});
			}
			that.setData({
				todoData: todoData
			});
		},
		closeTodoMovable(e) {
			var that = this;	
			let todoData = [...that.data.todoData];
			todoData.forEach((item, idx) => {
				item.x = 0
			});
			that.setData({
				todoData: todoData
			});
		},
		// 完成待办
		handleTodoDone(e) {
			const that = this;
			if(e.currentTarget.dataset.done == 1){
				that.closeTodoMovable()
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
						wx.showToast({
							title: '完成',
							icon: 'success'
						});
						setTimeout(() => {
							that.getTodoData();
						}, 1000);
					} else {
						wx.showToast({
							title: res.message,
							icon: 'none'
						});
					}
				}
			});
		},
		// 删除待办
		handleTodoDelete(e) {
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
		// 准备添加待办
		prepareAddTodo() {
			var that = this;
			that.closeTodoMovable()
			// 触发事件隐藏 TabBar
			this.triggerEvent('toggleTabBar', { show: false }, {});
			const today = new Date();
			const dateStr = today.toISOString().split('T')[0];
			const timeStr = `${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`;
		
			that.setData({
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
		// 关闭待办添加
		closeTodoMaskDrawer() {
			// 触发事件显示 TabBar
			this.triggerEvent('toggleTabBar', { show: true }, {});
			
			this.setData({
				showMaskDrawer: false
			});
		},


		handleTitleInput(e) {
			this.setData({
				'formData.title': e.detail.value
			})
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
		handleCategoryInput(e) {
			this.setData({
				'formData.category': e.detail.value
			})
		},
		handleDescriptionInput(e) {
			this.setData({
				'formData.description': e.detail.value
			})
		},


		submitTodoForm() {
			var that = this;
			const { title, date, time, alert } = that.data.formData;
			
			// 验证必填字段
			if (!title || !date || !time) {
				wx.showToast({
					title: '请填写必填项',
					icon: 'none'
				});
				return;
			}
			utils.getData({
				url: 'today/todo/add',
				params: that.data.formData,
				success: (res) => {
					if (res.code === 200) {
						wx.showToast({
							title: '添加成功',
							icon: 'success'
						});
						setTimeout(() => {
							that.closeTodoMaskDrawer();
							that.getTodoData(); // 刷新列表
						}, 1000);
					} else {
						wx.showToast({
							title: res.message,
							icon: 'none'
						});
					}
				}
			});
		},




		// !------- 备忘模块 -------

		// handleMemosMovableChange(e) {
		// 	var that = this;
		// 	if (e.detail.source === 'touch') {
		// 		const moveX = e.detail.x;
		// 		const index = e.currentTarget.dataset.index;
		// 		let memosData = [...that.data.memosData];
	
		// 		// 重置其他项的位置
		// 		memosData.forEach((item, idx) => {
		// 			if (idx !== index) {
		// 				item.x = 0;
		// 			}
		// 		});
	
		// 		// 自动展开逻辑
		// 		if (moveX < -30) {  // 左滑超过一半，自动展开到-90
		// 			memosData[index].x = -180;
		// 		} else if (moveX > 30) {  // 右滑超过一半，自动展开到90
		// 			memosData[index].x = 180;
		// 		} else {
		// 			memosData[index].x = moveX;
		// 		}
	
		// 		that.setData({
		// 			memosData: memosData
		// 		});
		// 	}
		// },
		openCloseMemosMovable(e){
			var that = this;
			let index = e.currentTarget.dataset.index;
			let memosData = [...that.data.memosData];
			if (memosData[index].x == -180) {
				memosData.forEach(item => {
					item.x = 0;
				});
			}else{
				memosData.forEach((item, idx) => {
					item.x = idx === index ? -180 : 0;
				});
			}
			that.setData({
				memosData: memosData
			});
		},
		closeMemosMovable(e) {
			var that = this;	
			let memosData = [...that.data.memosData];
			memosData.forEach((item, idx) => {
				item.x = 0
			});
			that.setData({
				memosData: memosData
			});
		},
		handleMemosModify(e) {
			const that = this;
			// 触发事件隐藏 TabBar
			this.triggerEvent('toggleTabBar', { show: false }, {});
			const index = e.currentTarget.dataset.index;
			
			// 打开备忘编辑页面
			that.setData({
				showMemosMaskDrawer: true,
				memosModifyStatus: true,
				memosFormData: that.data.memosData[index],
			}, () => {
				// 等待editor初始化完成后设置内容
				if (that.data.editorCtx) {
					that.data.editorCtx.setContents({
						html: that.data.memosFormData.content,
						success: (res) => {
							console.log('设置内容成功');
						},
						fail: (res) => {
							console.log('设置内容失败', res);
						}
					});
				}
			});
		},
		handleMemosDelete(e) {
			const that = this;
			const id = e.currentTarget.dataset.id;
			let postData = {
				memoId: id,
			}
			wx.showModal({
				title: '提示',
				content: '要删除这条备忘吗？',
				success(res) {
					if (res.confirm) {
						utils.getData({
							url: 'today/memos/delete',
							params: postData,
							method: 'DELETE',
							success: (res) => {
								if (res.code === 200) {
									wx.showToast({
										title: '删除成功',
										icon: 'success'
									});
									that.getMemosData();
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
	
		// 准备添加备忘
		prepareAddMemos() {
			var that = this;
			that.closeMemosMovable()
			// 触发事件隐藏 TabBar
			this.triggerEvent('toggleTabBar', { show: false }, {});

			const today = new Date();
			const dateStr = today.toISOString().split('T')[0];
			const timeStr = `${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`;
			
			that.setData({
				showMemosMaskDrawer: true,
				memosModifyStatus: false,
				memosFormData: {
					title: '',
					date: dateStr,
					time: timeStr,
					content: ''
				}
			});
		},
		closeMemosMaskDrawer() {
			// 触发事件显示 TabBar
			this.triggerEvent('toggleTabBar', { show: true }, {});
			
			this.setData({
				showMemosMaskDrawer: false,
				memosModifyStatus: false
			});
		},


		handleMemosTitleInput(e) {
			this.setData({
				'memosFormData.title': e.detail.value
			});
		},
		memosDateChange(e) {
			this.setData({
				'memosFormData.date': e.detail.value
			});
		},
		memosTimeChange(e) {
			this.setData({
				'memosFormData.time': e.detail.value
			});
		},
		handleMemosContentInput(e) {
			this.setData({
				'memosFormData.content': e.detail.html
			});
		},
		
		// 编辑器初始化
		onEditorReady() {
			const that = this;
			wx.createSelectorQuery().in(this).select('#editor').context(function(res) {
				that.setData({
					editorCtx: res.context
				});
			}).exec();
		},
		// 格式化文本操作
		format(e) {
			var that = this;
			let { name, value } = e.target.dataset;
			if (!name) return;
			that.data.editorCtx.format(name, value);
		},
		// 通过 Context 方法改变编辑器内样式时触发，返回选区已设置的样式
		onStatusChange(e) {
			const formats = e.detail;
			this.setData({
				formats
			});
		},

		// 提交备忘表单
		submitMemosForm() {
			const that = this;
			if (!that.data.memosModifyStatus) {
				// 添加
				const { title, date, time, content } = that.data.memosFormData;
			
				if (!title || !date || !time || !content) {
					wx.showToast({
						title: '请填写必填项',
						icon: 'none'
					});
					return;
				}

				utils.getData({
					url: 'today/memos/add',
					params: that.data.memosFormData,
					success: (res) => {
						if (res.code === 200) {
							wx.showToast({
								title: '添加成功',
								icon: 'success'
							});
							setTimeout(() => {
								that.closeMemosMaskDrawer();
								that.getMemosData();
							}, 1000);
						} else {
							wx.showToast({
								title: res.message,
								icon: 'none'
							});
						}
					}
				});
			}else{
				// 修改
				const { title, date, time, content, id } = that.data.memosFormData;
				if (!title || !date || !time || !content) {
					wx.showToast({
						title: '请填写必填项',
						icon: 'none'
					});
					return;
				}
				let postData = {
					memoId: id,
					title,
					date,
					time,
					content
				}
				utils.getData({
					url: 'today/memos/update',
					params: postData,
					success: (res) => {
						if (res.code === 200) {
							wx.showToast({
								title: '修改成功',
								icon: 'success'
							});
							setTimeout(() => {
								that.closeMemosMaskDrawer();
								that.getMemosData();
							}, 1000);
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
  },
  lifetimes: {
		attached: function () {
			var that = this;
			that.setData({
				tabbarRealHeight: wx.getStorageSync('tabbarRealHeight')
			})
			that.getTodoData()
			that.getMemosData()
		}
	}

})