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

    temaLockData: {}, // 戴锁计划
    showTemaLockDrawer: false, // 戴锁计划弹窗
    showLinkManagerDrawer: false, // 管理者绑定弹窗
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
          that.getTemaLock();
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
  // 将秒数转换为天时分秒格式
  formatTimeRemaining(seconds) {
    const days = Math.floor(seconds / (24 * 3600));
    const hours = Math.floor((seconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    let timeStr = '';
    if (days > 0) timeStr += `${days} 天 `;
    if (hours > 0) timeStr += `${hours} 小时 `;
    if (minutes > 0) timeStr += `${minutes} 分钟 `;
    if (secs > 0 || timeStr === '') timeStr += `${secs} 秒`;
    
    return timeStr;
  },
  // 获得 yyyy-mm-dd hh:mm:ss 格式的时间
  getCurrentTime(){
    var that = this;
    let now = new Date();
    
    // 获取年月日时分秒
    let year = now.getFullYear();
    let month = String(now.getMonth() + 1).padStart(2, '0');
    let day = String(now.getDate()).padStart(2, '0');
    let hours = String(now.getHours()).padStart(2, '0');
    let minutes = String(now.getMinutes()).padStart(2, '0');
    let seconds = String(now.getSeconds()).padStart(2, '0');
    
    // 拼接成 yyyy-mm-dd hh:mm:ss 格式
    let currentTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    return currentTime;
  },
  getTemaLock(type){
    var that = this;
    let postData = {
      type: "wearer",
      date: that.data.currentDate
    }
    utils.getData({
      url: 'slave/temalock/list',
      params: postData,
      success: (res) => {
        if (res.code === 200) {
          let thisTemaLockObj = res.data.list[0]
          
          // 将日期字符串转换为时间戳（秒）
          let startTimestamp = new Date(thisTemaLockObj.start_date.replace(/-/g, '/')).getTime() / 1000
          let endTimestamp = new Date(thisTemaLockObj.update_end_date.replace(/-/g, '/')).getTime() / 1000
          let currentTimestamp = new Date().getTime() / 1000
          
          // 计算总时长和已过时间
          let total_duration = endTimestamp - startTimestamp
          let time_passed = currentTimestamp - startTimestamp
          
          // 计算实际剩余时间
          let time_remaining = endTimestamp - currentTimestamp
          
          // 计算进度值：(已过时间/总时长) * 100
          thisTemaLockObj.process = (time_passed / total_duration * 100).toFixed(2)
          thisTemaLockObj.time_remaining = that.formatTimeRemaining(time_remaining)
          console.log('thisTemaLockObj', thisTemaLockObj);
          if (type && type === 'unlock') {
            thisTemaLockObj.display_countdown_status = 'visible'
          }
          that.setData({
            temaLockData: thisTemaLockObj,
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
  seeTimeRemaining(){
    var that = this;
    let bet = that.data.temaLockData.display_countdown_max_bet * 5
    let currentTime = that.getCurrentTime();
    let randomBet = Math.floor(Math.random() * bet) + 1
    let isReward = Math.random() < 0.5 ? 'REWARD' : 'PUNISHMENT' // 随机决定奖惩（0为奖励，1为惩罚）
    
    
    console.log('随机赌注:', randomBet, '奖惩类型:' ,isReward, '时间:' ,currentTime);
    
    let postData = {
      temalock_id: that.data.temaLockData.id,
      title: '查看剩余时间：' + (isReward === 'REWARD' ? '奖励' : '惩罚'),
      occur_time: currentTime,
      minute: randomBet,
      reward_punishment: isReward,
      reason: '在' + currentTime + ' 查看剩余时间，' + '结束时间' + (isReward === 'REWARD' ? '减少 ' : '增加 ') + randomBet + ' 分钟'
    }
    utils.getData({
      url: 'slave/temalock/record/add',
      params: postData,
      success: (res) => {
        if (res.code === 200) {
          wx.showToast({
            title: '剩余时间' + (isReward === 'REWARD' ? '减少 ' : '增加 ') + randomBet + ' 分钟',
            icon: 'none'
          });
          that.getTemaLock('unlock');
        }else{
          wx.showToast({
            title: res.message,
            icon: 'none'
          });
        }
      }
    });
  },

  setManagerUser(){
    var that = this;
    that.setData({
      showLinkManagerDrawer: true,
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

  // ! -------------- 戴锁计划 -------------- start
  showTemaLockDrawer(){
    var that = this;
    that.setData({
      showTemaLockDrawer: !that.data.showTemaLockDrawer,
    });
  },

  handleTemaLockSubmit(e) {
    var that = this;
    // const temaLockData = e.detail;
    // console.log('戴锁计划数据：', temaLockData);
    that.setData({
      showTemaLockDrawer: false,
    });
    that.getTemaLock();
  },
  // ! -------------- 戴锁计划 -------------- end

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

  // 关闭管理者绑定弹窗
  showCloseLinkManagerDrawer() {
    this.setData({
      showLinkManagerDrawer: false
    });
  },

  // 处理管理者绑定
  handleBindManager(e) {
    var that = this;
    const { manager_user_id } = e.detail;
    
    // 这里可以调用API进行绑定操作
    utils.getData({
      url: 'slave/temalock/bind',
      params: {
        manager_user_id: manager_user_id
      },
      success: (res) => {
        if (res.code === 200) {
          wx.showToast({
            title: '绑定成功',
            icon: 'success'
          });
          that.setData({
            showLinkManagerDrawer: false
          });
          that.getTemaLock(); // 刷新戴锁计划数据
        } else {
          wx.showToast({
            title: res.message,
            icon: 'none'
          });
        }
      }
    });
  },
})