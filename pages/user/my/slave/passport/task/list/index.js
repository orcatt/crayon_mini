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
      { value: '控制', label: '控制' },
      { value: '训练', label: '训练' }
    ],
    // 难度数据
    difficultyList: [
      { value: '', label: '全部' },
      { value: '1', label: '简单' },
      { value: '2', label: '普通' },
      { value: '3', label: '困难' },
      { value: '4', label: '极难' },
      { value: '5', label: '地狱' }
    ]
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
  }
})