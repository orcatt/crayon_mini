// pages/explore/tools/dict/index.js
var utils = require('../../../../api/util.js');

Page({
  data: {
		tabbarRealHeight: 0,
    showSupplementDrawer: false,
    supplementStep: 1,
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
    orientationTypes: ['异性恋', '同性恋', '双性恋', '泛性恋', '无性恋'],
    roleTypes: ['S', 'M', '双向'],
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
    console.log(that.data.formData);

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
  onReady() {},
  onShow() {},
  onHide() {},
  onUnload() {},
  onPullDownRefresh() {},
  onReachBottom() {},
  onShareAppMessage() {},
})