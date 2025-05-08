// pagesusertools/dict/index.js
var utils = require('../../../../../../../api/util.js');

Page({
  data: {
		tabbarRealHeight: 0,
    taskList: [],
    selectedType: '',
    selectedDifficulty: '',
    filterParams: {
      type: '',
      difficulty_level: ''
    },
    // 类型数据
    typeList: [
      { value: '', label: '全部' },
      { value: '奴化', label: '奴化' },
      { value: '暴露', label: '暴露' },
      { value: '排泄', label: '排泄' },
    ],
    // 添加任务时的类型数据
    addTypeList: [
      { value: '奴化', label: '奴化' },
      { value: '暴露', label: '暴露' },
      { value: '排泄', label: '排泄' },
    ],
    // 难度数据
    difficultyList: [
      { value: '', label: '全部' },
      { value: '1', label: '简单' },
      { value: '2', label: '普通' },
      { value: '3', label: '困难' },
      { value: '4', label: '极难' },
      { value: '5', label: '地狱' }
    ],
    showAddTaskDrawer: false,
    taskForm: {
      name: '',
      description: '',
      type: '',
      reward_punishment: '',
      difficulty_level: '1',
      public_display: 0
    },
    addOrEdit: 'add'
  },
  onLoad(options) {
		var that = this;
		that.setData({
			tabbarRealHeight: wx.getStorageSync('tabbarRealHeight')
		})
    this.getTaskList();
  },

  onReady() {},
  onShow() {},
  onHide() {},
  onUnload() {},
  onPullDownRefresh() {},
  onReachBottom() {},
  onShareAppMessage() {},

  // 选择类型
  selectType(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      selectedType: type,
      'filterParams.type': type
    });
    this.getTaskList();
  },

  // 选择难度
  selectDifficulty(e) {
    const difficulty = e.currentTarget.dataset.difficulty;
    this.setData({
      selectedDifficulty: difficulty,
      'filterParams.difficulty_level': difficulty
    });
    this.getTaskList();
  },

  // 获取任务列表
  getTaskList() {
    var that = this;
    utils.getData({
      url: 'slave/tasks/list',
      params: that.data.filterParams,
      success: (res) => {
        if (res.code === 200) {
          that.setData({
            taskList: res.data.list
          });
        } else {
          wx.showToast({
            title: res.message,
            icon: 'none'
          });
        }
      }
    });
  },

  // 打开添加任务弹窗
  addTask() {
    this.setData({
      showAddTaskDrawer: true,
      taskForm: {
        name: '',
        description: '',
        type: '',
        reward_punishment: '',
        difficulty_level: '1',
        public_display: 0
      },
      addOrEdit: 'add'
    });
  },
  editTask(e) {
    const item = e.currentTarget.dataset.item;
    this.setData({
      showAddTaskDrawer: true,
      taskForm: item,
      addOrEdit: 'edit'
    });
    console.log(item);
    
  },

  // 关闭添加任务弹窗
  closeAddTaskDrawer() {
    this.setData({
      showAddTaskDrawer: false
    });
  },

  // 处理输入框输入
  handleTaskInput(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    this.setData({
      [`taskForm.${field}`]: value
    });
  },

  // 处理类型选择
  handleTypeChange(e) {
    const index = e.detail.value;
    const selectedType = this.data.addTypeList[index];
    this.setData({
      'taskForm.type': selectedType.value
    });
  },

  // 处理赏罚类型选择
  handleRewardPunishmentChange() {
    const currentValue = this.data.taskForm.reward_punishment;
    this.setData({
      'taskForm.reward_punishment': currentValue === 'REWARD' ? 'PUNISHMENT' : 'REWARD'
    });
  },

  // 处理公开显示切换
  handlePublicDisplayChange() {
    const currentValue = this.data.taskForm.public_display;
    this.setData({
      'taskForm.public_display': currentValue === 1 ? 0 : 1
    });
  },

  // 处理难度级别加减
  handleDifficultyChange(e) {
    const { type } = e.currentTarget.dataset;
    const currentValue = parseInt(this.data.taskForm.difficulty_level);
    
    if (type === 'add' && currentValue < 5) {
      this.setData({
        'taskForm.difficulty_level': (currentValue + 1).toString()
      });
    } else if (type === 'reduce' && currentValue > 1) {
      this.setData({
        'taskForm.difficulty_level': (currentValue - 1).toString()
      });
    }
  },

  // 提交任务
  submitTask() {
    var that = this;
    let taskForm = that.data.taskForm;
    // 表单验证
    if (!taskForm.name || !taskForm.description || !taskForm.type || !taskForm.reward_punishment || !taskForm.difficulty_level) {
      wx.showToast({
        title: '表单填写不完整',
        icon: 'none'
      });
      return;
    }
    if (that.data.addOrEdit === 'add') {
      utils.getData({
        url: 'slave/tasks/add',
        params: taskForm,
        success: (res) => {
          if (res.code === 200) {
            wx.showToast({
              title: res.data.message,
              icon: 'success'
            });
            that.setData({
              showAddTaskDrawer: false,
            });
            that.getTaskList();
          } else {
            wx.showToast({
              title: res.message,
              icon: 'none'
            });
          }
        }
      });
    } else {
      utils.getData({
        url: 'slave/tasks/update',
        params: taskForm,
        success: (res) => {
          if (res.code === 200) {
            wx.showToast({
              title: res.data.message,
              icon: 'success'
            });
            that.setData({
              showAddTaskDrawer: false,
            });
            that.getTaskList();
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
  // 删除任务
  deleteTask(e) {
    var that = this;
    const item = e.currentTarget.dataset.item;
    if (item.user_id !== wx.getStorageSync('userId')) {
      wx.showToast({
        title: '无权删除此任务',
        icon: 'none'
      });
      return;
    }
    wx.showModal({
      title: '提示',
      content: '确定删除任务吗？',
      success: (res) => {
        if (res.confirm) {
          utils.getData({
            url: 'slave/tasks/delete',
            params: {
              id: item.id
            },
            success: (res) => {
              if (res.code === 200) {
                wx.showToast({
                  title: '删除成功',
                  icon: 'success'
                });
                that.getTaskList();
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
    
  }
})