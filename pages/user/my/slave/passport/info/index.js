// pages/user/my/slave/passport/info/index.js
var utils = require('../../../../../../api/util.js');

Component({
  properties: {
    showSupplementDrawer: {
      type: Boolean,
      value: false,
      observer: function(newVal) {
        var that = this;
        if (newVal) {
          that.setData({
            tempFormData: that.properties.formData
          });
        }
      }
    },
    formData: {
      type: Object,
      value: {
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
    }
  },
  data: {
    supplementStep: 1,
    orientationTypes: ['异性恋', '同性恋', '双性恋', '泛性恋', '无性恋'],
    roleTypes: ['S', 'M', '双向'],
    tempFormData: {}
  },
  methods: {
    handleInput(e) {
      var that = this;
      const field = e.currentTarget.dataset.field;
      const value = e.detail.value;
      that.setData({
        [`tempFormData.${field}`]: value
      });
    },

    handleBirthdayChange(e) {
      var that = this;
      that.setData({
        'tempFormData.birthday': e.detail.value
      });
    },

    handleOrientationChange(e) {
      var that = this;
      that.setData({
        'tempFormData.sexual_orientation': that.data.orientationTypes[e.detail.value]
      });
    },

    handleRoleChange(e) {
      var that = this;
      that.setData({
        'tempFormData.role_recognition': that.data.roleTypes[e.detail.value]
      });
    },

    handleCircumcisedChange(e) {
      var that = this;
      that.setData({
        'tempFormData.dick_circumcised': e.detail.value ? 1 : 0
      });
    },

    nextStep() {
      var that = this;
      const currentStep = that.data.supplementStep;
      if (currentStep < 3) {
        that.setData({
          supplementStep: currentStep + 1
        });
      }
    },

    prevStep() {
      var that = this;
      const currentStep = that.data.supplementStep;
      if (currentStep > 1) {
        that.setData({
          supplementStep: currentStep - 1
        });
      }
    },

    closeSupplementDrawer() {
      var that = this;
      that.setData({
        showSupplementDrawer: false,
        supplementStep: 1
      });
      that.triggerEvent('close');
    },

    submitForm() {
      var that = this;
      if (that.data.tempFormData.name == '') {
        wx.showToast({
          title: '请输入姓名',
          icon: 'none'
        });
        return;
      }
      utils.getData({
        url: 'slave/info/addOrUpdate',
        params: that.data.tempFormData,
        success: (res) => {
          if (res.code === 200) {
            console.log(res);
            that.setData({
              showSupplementDrawer: false,
              supplementStep: 1
            });
            that.triggerEvent('submit');
          }else{
            wx.showToast({
              title: res.message,
              icon: 'none'
            });
          }
        }
      });
    }
  }
})