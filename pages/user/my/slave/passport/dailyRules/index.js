// pages/user/my/slave/passport/dailyRules/index.js
var utils = require('../../../../../../api/util.js');

Component({
  properties: {
    showPassportDrawer: {
      type: Boolean,
      value: false
    },
    passportData: {
      type: Object,
      value: {}
    },
    isHasDailyRules: {
      type: Boolean,
      value: false
    }
  },
  data: {
    passportStep: 1,
    sexStatus: [{
      name: '平常',
      content: '奴才性欲正常，处于平常期'
    },{
      name: '燥热',
      content: '奴才性欲燥热寻求发泄，处于燥热期'
    },{
      name: '发情',
      content: '奴才性欲旺盛无处发泄，处于发情期'
    }],
    toolsList: ['工具1', '工具2', '工具3']
  },
  methods: {
    showClosePassportDrawer() {
      this.setData({
        showPassportDrawer: false,
        passportStep: 1
      });
      this.triggerEvent('close');
    },

    handleLockChange(e) {
      var that = this;
      const value = parseInt(e.currentTarget.dataset.value)
      that.setData({
        'passportData.is_locked': value
      })
    },

    changeTouchCountStatus() {
      var that = this;
      const touchCount = that.data.passportData.touch_count;
      that.setData({
        'passportData.touch_count': touchCount === 0 ? 1 : 0
      });
    },

    handleTouchInput(e) {
      var that = this;
      const value = e.detail.value === '' ? 0 : parseInt(e.detail.value);
      that.setData({
        'passportData.touch_count': value
      });
    },

    handleWaterCountStatus() {
      var that = this;
      const excretionCount = that.data.passportData.excretion_count;
      that.setData({
        'passportData.excretion_count': excretionCount === 0 ? 1 : 0
      });
    },

    handleWaterCountInput(e) {
      var that = this;
      const value = e.detail.value === '' ? 0 : parseInt(e.detail.value);
      that.setData({
        'passportData.excretion_count': value
      });
    },

    handleWaterStatus() {
      var that = this;
      that.setData({
        'passportData.water_completed': !that.data.passportData.water_completed
      });
    },

    handleStatusChange(e) {
      var that = this;
      const index = e.currentTarget.dataset.index
      const sexStatus = that.data.sexStatus[index];
      that.setData({
        'passportData.libido_status': sexStatus.name,
        'passportData.status_text': sexStatus.content
      });
    },

    handleDailyTaskChange() {
      var that = this;
      that.setData({
        'passportData.daily_task_completed': !that.data.passportData.daily_task_completed
      });
    },

    handleExtraTaskChange() {
      var that = this;
      that.setData({
        'passportData.extra_task_completed': !that.data.passportData.extra_task_completed
      });
    },

    handleToolsChange(e) {
      var that = this;
      that.setData({
        'passportData.other_tools': that.data.toolsList[e.detail.value]
      });
    },

    handleViolationInput(e) {
      var that = this;
      that.setData({
        'passportData.violation': e.detail.value
      });
    },

    toNextSteps() {
      var that = this;
      if (that.data.passportStep < 3 && that.data.passportStep >= 1) {
        that.setData({
          passportStep: that.data.passportStep + 1
        });
        return;
      }

      that.calculationScore();
    },

    calculationScore() {
      var that = this;
      let score = 0;
      const passportData = that.data.passportData;

      // 上锁+2
      if (passportData.is_locked === 1) {
        score += 2;
      }

      // 遵守触摸+1，否则-触摸次数
      if (passportData.touch_count === 0) {
        score += 1;
      } else {
        score -= passportData.touch_count;
      }

      // 排泄控制+1，否则-排泄次数
      if (passportData.excretion_count === 0) {
        score += 1;
      } else {
        score -= passportData.excretion_count;
      }

      // 汇报平常 0，燥热 1，发情 2
      if (passportData.libido_status === '燥热') {
        score += 1;
      } else if (passportData.libido_status === '发情') {
        score += 2;
      }

      // 每日任务完成+3，否则 0
      if (passportData.daily_task_completed) {
        score += 3;
      }

      // 额外任务完成+2，否则 -2
      if (passportData.extra_task_completed) {
        score += 2;
      } else {
        score -= 1;
      }

      // 其他工具+1
      if (passportData.other_tools) {
        score += 1;
      }

      // 其他违规-1
      if (passportData.violation) {
        score -= 1;
      }

      if (score < 0) {
        score = 0;
      }
      console.log(that.data.passportData);
      
      // utils.getData({
      //   url: 'slave/dailyRules/save',
      //   params: that.data.tempFormData,
      //   success: (res) => {
      //     if (res.code === 200) {
      //       console.log(res);
      //       that.setData({
      //         showSupplementDrawer: false,
      //         supplementStep: 1
      //       });
      //       that.triggerEvent('submit');
      //     }else{
      //       wx.showToast({
      //         title: res.message,
      //         icon: 'none'
      //       });
      //     }
      //   }
      // });
      // 触发提交事件
      that.triggerEvent('submit', { 
        passportData: that.data.passportData,
        passportStep: 1,
        score: score
      });
    }
  }
})