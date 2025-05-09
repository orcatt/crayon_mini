// pages/user/my/slave/passport/task/index.js
var utils = require('../../../../../../api/util.js');

Component({
  properties: {
    showTaskDrawer: {
      type: Boolean,
      value: false,
      observer(newVal) {
        if (newVal) {
          this.setData({
            extractStatus: false
          });
          this.getTaskList();
        }
      }
    },
    taskUserType: {
      type: Number,
      value: 0
    }
  },

  data: {
    currentTask: {
      id: 0,
      user_id: 0,
      name: '',
      description: '',
      type: '',
      reward_punishment: '',
      difficulty_level: '',
      public_display: 0,
      sort_order: 0
    },
    isDrawing: false,
    extractStatus: false,
    drawInterval: null,
    taskList: [],
    waterAmount: 0,
    excretionCount: 0
  },
  methods: {
    closeTaskDrawer() {
      if (this.data.extractStatus) {
        wx.showToast({
          title: '任务确认后才能关闭',
          icon: 'none'
        });
        return;
      }
      this.setData({
        showTaskDrawer: false,
        isDrawing: false,
        extractStatus: false
      });
      this.triggerEvent('close');
    },

    getTaskList() {
      var that = this;
      let difficultyLevel = '';
      // 今日任务/额外任务难度等级为1,2
      if (that.data.taskUserType === 0 || that.data.taskUserType === 1) {
        difficultyLevel = '1,2';
      }
      // 月度任务难度等级为3,4,5
      else if (that.data.taskUserType === 2) {
        difficultyLevel = '3,4,5';
      }

      let postData = {
        type: '',
        difficulty_level: difficultyLevel
      }
      utils.getData({
        url: 'slave/tasks/list',
        params: postData,
        success: (res) => {
          if (res.code === 200) {
            if (that.data.taskUserType === 0 || that.data.taskUserType === 1) {
              that.setData({
                sampleTasks: res.data.list.filter(item => item.difficulty_level === '1' || item.difficulty_level === '2'),
              })
              console.log('今日任务/额外任务',that.data.sampleTasks);
            }else if (that.data.taskUserType === 2) {
              that.setData({
                sampleTasks: res.data.list.filter(item => item.difficulty_level !== '1' && item.difficulty_level !== '2'),
              })
              console.log('月度任务',that.data.sampleTasks);
            }
          }else{
            wx.showToast({
              title: res.message,
              icon: 'none'
            });
          }
        }
      });
    },

    // 生成随机饮水量（400的倍数，最多2400）
    generateWaterAmount() {
      const maxMultiplier = 6; // 2400/400 = 6
      const multiplier = Math.floor(Math.random() * maxMultiplier) + 1;
      return multiplier * 400;
    },

    // 生成随机排泄次数（0-5）
    generateExcretionCount() {
      return Math.floor(Math.random() * 6);
    },

    startTaskDraw() {
      var that = this;
      if (that.data.isDrawing) return;
      
      that.setData({
        isDrawing: true,
        extractStatus: true
      });

      let count = 0;
      const maxCount = 20; // 轮换次数
      const interval = 100; // 轮换间隔(ms)
      const finalTask = that.data.sampleTasks[Math.floor(Math.random() * that.data.sampleTasks.length)];

      that.data.drawInterval = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * that.data.sampleTasks.length);
        that.setData({
          currentTask: that.data.sampleTasks[randomIndex]
        });

        count++;
        if (count >= maxCount) {
          clearInterval(that.data.drawInterval);
          that.setData({
            isDrawing: false,
            currentTask: finalTask,
            waterAmount: that.data.taskUserType === 0 ? that.generateWaterAmount() : 0,
            excretionCount: that.data.taskUserType === 0 ? that.generateExcretionCount() : 0
          });
        }
      }, interval);
    },

    confirmTask() {
      var that = this;
      let postData = {}
      if (that.data.taskUserType === 0) {
        postData = {
          date: that.data.currentDate,
          is_locked: 1,
          kowtow: 1,
          excretion_count_allowed: that.data.excretionCount,
          excretion_count: 0,
          water_intake: that.data.waterAmount,
          water_completed: 0,
          daily_task_id: that.data.currentTask.id,
          daily_task_completed: 0,
        }
      }else if (that.data.taskUserType === 1) {
        postData = {
          date: that.data.currentDate,
          extra_task_id: that.data.currentTask.id,
          extra_task_completed: 0,
        }
      }
      utils.getData({
        url: 'slave/dailyRules/save',
        params: postData,
        success: (res) => {
          if (res.code === 200) {
            wx.showToast({
              title: '任务确认',
              icon: 'success'
            });
            that.triggerEvent('drawComplete', that.data.currentTask);
            that.setData({
              showTaskDrawer: false
            });
          }else{
            wx.showToast({
              title: res.message,
              icon: 'none'
            });
          }
        }
      });
      
    },

    toTaskList() {
      if (this.data.extractStatus) {
        wx.showToast({
          title: '任务确认后才能关闭',
          icon: 'none'
        });
        return;
      }
      wx.navigateTo({
        url: '/pages/user/my/slave/passport/task/list/index'
      });
    }
  },
  lifetimes: {
    // 页面加载时确定顶部导航高度
    attached: function () {
      var that = this;
      let today = new Date();
      let year = today.getFullYear();
      let month = String(today.getMonth() + 1).padStart(2, '0');
      let day = String(today.getDate()).padStart(2, '0');
      let currentDate = `${year}-${month}-${day}`;
      that.setData({
        tabbarRealHeight: wx.getStorageSync('tabbarRealHeight'),
        currentDate: currentDate
      })
    }
  }
})