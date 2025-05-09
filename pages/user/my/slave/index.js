// pages/explore/tools/dict/index.js
var utils = require('../../../../api/util.js');

Page({
  data: {
		tabbarRealHeight: 0,
    currentDate: '',
    showContentBottom: false,

    showSupplementDrawer: false, // 完善信息
    transferData: {}, // 传递数据
    formData: {
      number: '',
      name: '',
      age: '',
      height: '',
      weight: '',
      shoe_size: '',
      sexual_orientation: '',
      role_recognition: '',
      experience_years: '',
      submissive_count: '',
      dick_unerected_size: '',
      dick_erected_size: '',
      dick_coarse: '',
      dick_circumcised: 0,
      anal_diameter: '',
      longest_abstinence: '',
      max_ejaculation_frequency: '',
      avg_masturbation_frequency: '',
      avg_masturbation_duration: '',
      semen_volume: ''
    },
    
    showPassportDrawer: false, // 通行证
    isHasDailyRules: false, // 是否存在通行证
    passportData: {
      kowtow: 1,
      is_locked: 1,
      touch_count: 0,
      libido_status: '平常',
      status_text: '奴才性欲正常，处于平常期',

      excretion_count: 0,
      excretion_count_allowed: 0,
      water_intake: '2000',
      water_completed: true,
      other_tools: '',
      daily_task_title: '',
      daily_task_content: '',
      daily_task_completed: false,
      extra_task_title: '',
      extra_task_content: '',
      extra_task_completed: false,
      violation: '',
      score: 0
    },

    showTaskDrawer: false, // 任务抽取弹窗
    taskUserType: 0, // 抽取任务类型 0: 今日任务 1: 额外任务 2: 月度任务

  },
  onLoad(options) {
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
    that.getData();

  },
  getData(){
    var that = this;
    utils.getData({
      url: 'slave/info/list',
      params: {},
      success: (res) => {
        if (res.code === 200) {
          console.log(res);
          // 根据yyyy-mm-dd计算年龄
          var birthday = res.data.birthday;
          var age = new Date().getFullYear() - new Date(birthday).getFullYear();
          res.data.age = age;
          that.setData({
            formData: res.data,
          })
          that.getDailyRules();
        }else if(res.code === 404){
          that.showCloseSupplementDrawer();
        }else{
          wx.showToast({
            title: res.message,
            icon: 'none'
          });
        }
      }
    });
  },
  getDailyRules(){
    var that = this;
    let postData = {
      date: that.data.currentDate
    }
    utils.getData({
      url: 'slave/dailyRules/day',
      params: postData,
      success: (res) => {
        if (res.code === 200) {
          that.setData({
            passportData: res.data,
            isHasDailyRules: true,
          })
        }else if(res.code === 404){
          that.setData({
            isHasDailyRules: false,
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
  showContentBottom(){
    var that = this;
    that.setData({
      showContentBottom: !that.data.showContentBottom
    });
  },



  // ! -------------- 完善信息 -------------- start

  showCloseSupplementDrawer() {
    var that = this;
    that.setData({
      showSupplementDrawer: !that.data.showSupplementDrawer,
      formData: that.data.formData
    });
  },

  submitForm() {
    var that = this;
    that.setData({
      showSupplementDrawer: false
    });
    that.getData();
  },
  // ! -------------- 完善信息 -------------- end



  // ! -------------- 通行证 -------------- start
  showClosePassportDrawer(){
    var that = this;
    if(that.data.isHasDailyRules){
      if (that.data.passportData.score) {
        wx.showToast({
          title: '今日已提交',
          icon: 'none'
        })
        return;
      }
      that.setData({
        showPassportDrawer: !that.data.showPassportDrawer,
        passportData: that.data.passportData,
        isHasDailyRules: that.data.isHasDailyRules
      });
      console.log('通行证数据：', that.data.passportData);
      
    }else{
      wx.showToast({
        title: '先抽取任务',
        icon: 'none'
      });
      that.showTaskDrawer();
    }
  },

  // 处理通行证提交
  handlePassportSubmit(e) {
    var that = this;
    // const { passportData, score } = e.detail;
    // console.log('通行证数据：', passportData);
    // console.log('得分：', score);
    that.setData({
      showPassportDrawer: false,
    });
    that.getDailyRules();
  },
  // ! -------------- 通行证 -------------- end

  // ! -------------- 任务 -------------- start
  showTaskDrawer() {
    var that = this;
    if(!that.data.isHasDailyRules){
      that.setData({
        showTaskDrawer: true,
        taskUserType: 0
      });
    }else{
      if (that.data.passportData.extra_task_id) {
        wx.showToast({
          title: '今日已达上限',
          icon: 'none'
        })
        return;
      }
      wx.showModal({
        title: '提示',
        content: '您已经抽取今日任务，是否抽取额外任务？',
        confirmText: '继续抽取',
        cancelText: '返回',
        success: (res) => {
          if (res.confirm) {
            that.setData({
              showTaskDrawer: true,
              taskUserType: 1
            });
          }
        }
      });
    }
  },
  closeTaskDrawer() {
    this.setData({
      showTaskDrawer: false
    });
  },
  handleTaskDrawComplete(e) {
    var that = this;
    const task = e.detail;
    that.getDailyRules();

    this.setData({
      showTaskDrawer: false
    });
  },
  // ! -------------- 任务 -------------- end



  // ! -------------- 游戏 -------------- start

  toGame(){
    wx.navigateTo({
      url: '/pages/user/my/slave/facility/index',
    })
  },
  // ! -------------- 游戏 -------------- end
  
  toEvent(){
    wx.navigateTo({
      url: '/pages/user/my/slave/event/index',
    })
  },
  onReady() {},
  onShow() {},
  onHide() {},
  onUnload() {},
  onPullDownRefresh() {},
  onReachBottom() {},
  onShareAppMessage() {},
})