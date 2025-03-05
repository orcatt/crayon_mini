// pages/explore/tools/dict/index.js
var utils = require('../../../../api/util.js');

Page({
  data: {
		tabbarRealHeight: 0,
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
  onLoad(options) {
		var that = this;
		that.setData({
			tabbarRealHeight: wx.getStorageSync('tabbarRealHeight')
		})
    that.getMemosData()

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
    
  },
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
  onReady() {},
  onShow() {},
  onHide() {},
  onUnload() {},
  onPullDownRefresh() {},
  onReachBottom() {},
  onShareAppMessage() {}
})