// pages/explore/tools/dict/index.js
var utils = require('../../../../api/util.js');

Page({
  data: {
		tabbarRealHeight: 0,
    showSupplementDrawer: false,
    showPassportDrawer: false,
    supplementStep: 1,
    orientationTypes: ['异性恋', '同性恋', '双性恋', '泛性恋', '无性恋'],
    roleTypes: ['S', 'M', '双向'],
    formData: {
      name: '',
			birthday: "2000-01-01",
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
    passportStep: 1,
    passportData: {
      is_locked: 1,
      touch_count: 0,
      status: '平常',
      status_text: '奴才性欲正常，处于平常期',
      daily_task_title: '骨外肌训练3分钟',
      daily_task_content: '骨外肌训练3分钟，保持肌肉紧张，放松，重复，动作标准',
      daily_task_completed: false,
      control_count: 0,
      water_intake: '2000',
      water_completed: true,
      other_tools: '',
      extra_task_title: '额外任务1',
      extra_task_content: '额外任务1内容额外任务1内容额外任务1内容额外任务1内容额外任务1内容额外任务1内容',
      extra_task_completed: false,
      violation: ''
    },
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
    toolsList: ['工具1', '工具2', '工具3'],

  },
  onLoad(options) {
		var that = this;
		that.setData({
			tabbarRealHeight: wx.getStorageSync('tabbarRealHeight')
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
        }else if(res.code === 404){
          that.showDrawer();
        }else{
          wx.showToast({
            title: res.message,
            icon: 'none'
          });
        }
      }
    });
  },


  showDrawer() {
    this.setData({
      showSupplementDrawer: true,
      supplementStep: 1
    });
  },

  closeSupplementDrawer() {
    var that = this;
    that.setData({
      showSupplementDrawer: false,
      formData: {
        name: '',			
        birthday: "2000-01-01",
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
      }
    });
    that.getData();
  },

  handleInput(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    this.setData({
      [`formData.${field}`]: value
    });
  },

  handleBirthdayChange(e) {
    this.setData({
      'formData.birthday': e.detail.value
    });
  },

  handleOrientationChange(e) {
    this.setData({
      'formData.sexual_orientation': this.data.orientationTypes[e.detail.value]
    });
  },

  handleRoleChange(e) {
    this.setData({
      'formData.role_recognition': this.data.roleTypes[e.detail.value]
    });
  },

  handleCircumcisedChange(e) {
    
    this.setData({
      'formData.dick_circumcised': e.detail.value? 1 : 0
    });
  },

  nextStep() {
    const currentStep = this.data.supplementStep;
    if (currentStep < 3) {
      this.setData({
        supplementStep: currentStep + 1
      });
    }
  },

  prevStep() {
    const currentStep = this.data.supplementStep;
    if (currentStep > 1) {
      this.setData({
        supplementStep: currentStep - 1
      });
    }
  },

  submitForm() {
    var that = this;
    if (that.data.formData.name == '') {
      wx.showToast({
        title: '请输入姓名',
        icon: 'none'
      });
      return;
    }
    utils.getData({
      url: 'slave/info/addOrUpdate',
      params: that.data.formData,
      success: (res) => {
        if (res.code === 200) {
          console.log(res);
          that.closeSupplementDrawer();
          that.getData();
        }else{
          wx.showToast({
            title: res.message,
            icon: 'none'
          });
        }
      }
    });
  },

  // ! -------------- 通行证 --------------
  showClosePassportDrawer(){
    var that = this;
    that.setData({
      showPassportDrawer: !that.data.showPassportDrawer,
      passportStep: 1
    });
  },
  // 上锁
  handleLockChange(e) {
    var that = this;
    that.setData({
      'passportData.is_locked': e.currentTarget.dataset.value
    });
    
  },

  // 触摸状态、次数
  changeTouchCountStatus(e){
    var that = this;
    if(that.data.passportData.touch_count == 0){
      that.setData({
        'passportData.touch_count': 1
      });
    }else{
      that.setData({
        'passportData.touch_count': 0
      });
    }
  },
  handleTouchInput(e) {
    var that = this;
    const value = e.detail.value == '' ? 0 : parseInt(e.detail.value);
    that.setData({
      'passportData.touch_count': value
    });
  },

  // 饮水
  handleWaterCountStatus(e){
    var that = this;
    if(that.data.passportData.control_count == 0){
      that.setData({
        'passportData.control_count': 1
      });
    }else{
      that.setData({
        'passportData.control_count': 0
      });
    }
  },
  handleWaterCountInput(e) {
    var that = this;
    const value = e.detail.value == '' ? 0 : parseInt(e.detail.value);
    that.setData({
      'passportData.control_count': value
    });
  },
  handleWaterStatus() {
    var that = this;
    that.setData({
      'passportData.water_completed': !that.data.passportData.water_completed
    });
  },

  // 汇报
  handleStatusChange(e) {
    var that = this;
    let index = e.currentTarget.dataset.index;
    that.setData({
      'passportData.status': that.data.sexStatus[index].name,
      'passportData.status_text': that.data.sexStatus[index].content
    });
  },

  // 任务
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

  // 其他工具
  handleToolsChange(e) {
    this.setData({
      'passportData.other_tools': this.data.toolsList[e.detail.value]
    });
  },


  // 其他违规
  handleViolationInput(e) {
    this.setData({
      'passportData.violation': e.detail.value
    });
  },

  toNextSteps() {
    var that = this;
    if(that.data.passportStep < 3 && that.data.passportStep >= 1){
      that.setData({
        passportStep: that.data.passportStep + 1
      });
      return;
    }
    console.log(that.data.passportData);

    that.calculationScore();
    // utils.getData({
    //   url: 'slave/passport/update',
    //   params: that.data.passportData,
    //   success: (res) => {
    //     if (res.code === 200) {
    //       that.closePassportDrawer();
    //     } else {
    //       wx.showToast({
    //         title: res.message,
    //         icon: 'none'
    //       });
    //     }
    //   }
    // });
  },
  calculationScore(){
    var that = this;
    let score = 0;
    if(that.data.passportData.is_locked == 1){
      score += 2;
    }

    if(that.data.passportData.touch_count == 0){
      score += 1;
    }else{
      score -= that.data.passportData.touch_count;
    }
    
    if(that.data.passportData.control_count ==  ){
      score += 10;
    }

    if(that.data.passportData.status == '燥热'){
      score += 1;
    }else if(that.data.passportData.status == '发情'){
      score += 2;
    }

    // if(that.data.passportData.control_count == 1){
    //   score += 10;
    // }
  },
  onReady() {},
  onShow() {},
  onHide() {},
  onUnload() {},
  onPullDownRefresh() {},
  onReachBottom() {},
  onShareAppMessage() {},
})