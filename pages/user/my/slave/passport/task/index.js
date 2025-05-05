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
      let postData = {
        type: ''
      }
      utils.getData({
        url: 'slave/tasks/list',
        params: postData,
        success: (res) => {
          if (res.code === 200) {
            that.setData({
              sampleTasks: res.data.list,
            })
          }else{
            wx.showToast({
              title: res.message,
              icon: 'none'
            });
          }
        }
      });
    },

    startTaskDraw() {
      if (this.data.isDrawing) return;
      
      this.setData({
        isDrawing: true,
        extractStatus: true
      });

      let count = 0;
      const maxCount = 20; // 轮换次数
      const interval = 100; // 轮换间隔(ms)
      const finalTask = this.data.sampleTasks[Math.floor(Math.random() * this.data.sampleTasks.length)];

      this.data.drawInterval = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * this.data.sampleTasks.length);
        this.setData({
          currentTask: this.data.sampleTasks[randomIndex]
        });

        count++;
        if (count >= maxCount) {
          clearInterval(this.data.drawInterval);
          this.setData({
            isDrawing: false,
            currentTask: finalTask
          });
        }
      }, interval);
    },

    confirmTask() {
      var that = this;
      let postData = {
        type: ''
      }
      utils.getData({
        url: 'slave/tasks/list',
        params: postData,
        success: (res) => {
          if (res.code === 200) {
            that.setData({
              sampleTasks: res.data.list,
            })
          }else{
            wx.showToast({
              title: res.message,
              icon: 'none'
            });
          }
        }
      });
      this.triggerEvent('drawComplete', this.data.currentTask);
      this.setData({
        showTaskDrawer: false
      });
    },

    toTaskList() {
      wx.navigateTo({
        url: '/pages/user/my/slave/passport/task/list/index'
      });
    }
  }
})