// pages/user/my/slave/passport/temalock/index.js
var utils = require('../../../../../../api/util.js');

Component({
  properties: {
    showTemaLockDrawer: {
      type: Boolean,
      value: false,
      observer: function(newVal) {
        var that = this;
        if (newVal) {
          // 清空formData数据
          let temFormData = {
            wearer_user_name: '',
            wearer_user_id: null,
            manager_user_name: '',
            manager_user_id: null,
            create_user_name: '',
            create_user_id: null,
            share_template: 0,
            description: '',
            start_date: '',
            frequency: '',
            default_end_date: '',
            share_link_status: 0,
            share_link_bet: null,
            display_countdown_status: 'hidden',
            display_countdown_max_bet: null,
            public_everyone_status: 0,
            public_everyone_bet: null,
            min_game_times: 0,
            max_game_times: 0,
            game_bet: null,
            regular_cleaning_status: 0,
            regular_cleaning_frequency: null,
            end_condition: 0,
            end_status: 0
          }
          that.setData({
            temaLockStep: 1,
            formData: temFormData
          });
        }
      }
    }
  },

  data: {
    temaLockStep: 1,
    formData: {
      wearer_user_name: '',
      wearer_user_id: '',
      manager_user_name: '',
      manager_user_id: '',
      create_user_name: '',
      create_user_id: '',
      share_template: 0,
      description: '',
      start_date: '',
      frequency: '',
      default_end_date: '',
      share_link_status: 0,
      share_link_bet: null,
      display_countdown_status: 'hidden',
      display_countdown_max_bet: null,
      public_everyone_status: 0,
      public_everyone_bet: null,
      min_game_times: 0,
      max_game_times: 0,
      game_bet: null,
      regular_cleaning_status: 0,
      regular_cleaning_frequency: null,
      end_condition: 0,
      end_status: 0
    },
    startDateArray: [],
    startDateIndex: [],
    endDateArray: [],
    endDateIndex: [],
    countdownStatusList: [
      { name: '不显示', value: 'hidden' },
      { name: '显示', value: 'visible' },
      { name: '随机', value: 'visible_with_random' }
    ]
  },

  lifetimes: {
    attached() {
      this.initDatePicker();
    }
  },

  methods: {
    // 初始化日期选择器
    initDatePicker() {
      const now = new Date();
      const years = [];
      const months = [];
      const days = [];
      const hours = [];
      const minutes = [];

      // 生成年份（当前年份到后5年）
      for (let i = now.getFullYear(); i <= now.getFullYear() + 5; i++) {
        years.push(i + '年');
      }

      // 生成月份
      for (let i = 1; i <= 12; i++) {
        months.push(i + '月');
      }

      // 生成日期
      for (let i = 1; i <= 31; i++) {
        days.push(i + '日');
      }

      // 生成小时
      for (let i = 0; i < 24; i++) {
        hours.push(i + '时');
      }

      // 生成分钟
      for (let i = 0; i < 60; i++) {
        minutes.push(i + '分');
      }

      this.setData({
        startDateArray: [years, months, days, hours, minutes],
        endDateArray: [years, months, days, hours, minutes],
        startDateIndex: [0, now.getMonth(), now.getDate() - 1, now.getHours(), now.getMinutes()],
        endDateIndex: [0, now.getMonth(), now.getDate() - 1, now.getHours(), now.getMinutes()]
      });
    },

    // 关闭抽屉
    showCloseTemaLockDrawer() {
      this.triggerEvent('close');
    },

    // 下一步
    nextStep() {
      if (this.data.temaLockStep === 3) {
        this.submitForm();
        return;
      }
      this.setData({
        temaLockStep: this.data.temaLockStep + 1
      });
    },
    prevStep() {
      var that = this;
      const currentStep = that.data.temaLockStep;
      if (currentStep > 1) {
        that.setData({
          temaLockStep: currentStep - 1
        });
      }
    },

    // 提交表单
    submitForm() {
      var that = this;
      const formData = this.data.formData;
      let userInfo = wx.getStorageSync('userInfo');
      // 验证必填字段
      if (!formData.start_date || !formData.default_end_date || !formData.frequency || !formData.description) {
        wx.showToast({
          title: '请填写完整信息',
          icon: 'none'
        });
        return;
      }
      
      if (!formData.min_game_times || !formData.max_game_times || !formData.game_bet || formData.min_game_times === 0 || formData.max_game_times === 0 || formData.game_bet === 0) {
        wx.showToast({
          title: '游戏设定部分信息缺失',
          icon: 'none'
        });
        return;
      }

      if (formData.regular_cleaning_status === 1 && !formData.regular_cleaning_frequency) {
        wx.showToast({
          title: '清洗设置信息缺失',
          icon: 'none'
        });
        return;
      }
      if (formData.display_countdown_status === 'visible_with_random' && !formData.display_countdown_max_bet) {
        wx.showToast({
          title: '倒计时设置信息缺失',
          icon: 'none'
        });
        return;
      }
      if (formData.share_link_status === 1 && !formData.share_link_bet) {
        wx.showToast({
          title: '分享设置信息缺失',
          icon: 'none'
        });
        return;
      }
      if(formData.public_everyone_status === 1 && !formData.public_everyone_bet){
        wx.showToast({
          title: '示众设置信息缺失',
          icon: 'none'
        });
        return;
      }

      formData.wearer_user_name = userInfo.nickname;
      formData.wearer_user_id = userInfo.id;
      formData.create_user_name = userInfo.nickname;
      formData.create_user_id = userInfo.id;
      


      let postData = {
        wearer_user_name: formData.wearer_user_name,
        wearer_user_id: formData.wearer_user_id,
        manager_user_name: formData.manager_user_name,
        manager_user_id: formData.manager_user_id,
        create_user_name: formData.create_user_name,
        create_user_id: formData.create_user_id,

        start_date: formData.start_date,
        default_end_date: formData.default_end_date,
        frequency: formData.frequency,
        share_template: formData.share_template,
        description: formData.description,
        
        min_game_times: formData.min_game_times,
        max_game_times: formData.max_game_times,
        game_bet: formData.game_bet,
        regular_cleaning_status: formData.regular_cleaning_status,
        regular_cleaning_frequency: formData.regular_cleaning_frequency,

        display_countdown_status: formData.display_countdown_status,
        display_countdown_max_bet: formData.display_countdown_max_bet,
        share_link_status: formData.share_link_status,
        share_link_bet: formData.share_link_bet,

        public_everyone_status: formData.public_everyone_status,
        public_everyone_bet: formData.public_everyone_bet,
       
 
        end_condition: formData.end_condition,
        end_status: 0
      }

      console.log('提交 postData', postData);

      utils.getData({
        url: 'slave/temalock/add',
        params: postData,
        success: (res) => {
          if (res.code === 200) {
            that.triggerEvent('submit', formData);

          }else{
            wx.showToast({
              title: res.message,
              icon: 'none'
            });
          }
        }
      });
    },


    // ? -------------- 数据处理 -------------- start
    // 处理开始时间选择
    handleStartDateChange(e) {
      const { value } = e.detail;
      const dateArray = this.data.startDateArray;
      const year = dateArray[0][value[0]].replace('年', '');
      const month = dateArray[1][value[1]].replace('月', '');
      const day = dateArray[2][value[2]].replace('日', '');
      const hour = dateArray[3][value[3]].replace('时', '');
      const minute = dateArray[4][value[4]].replace('分', '');
      
      const date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')} ${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:00`;
      
      this.setData({
        'formData.start_date': date,
        startDateIndex: value
      });
    },

    // 处理结束时间选择
    handleEndDateChange(e) {
      const { value } = e.detail;
      const dateArray = this.data.endDateArray;
      const year = dateArray[0][value[0]].replace('年', '');
      const month = dateArray[1][value[1]].replace('月', '');
      const day = dateArray[2][value[2]].replace('日', '');
      const hour = dateArray[3][value[3]].replace('时', '');
      const minute = dateArray[4][value[4]].replace('分', '');
      
      const date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')} ${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:00`;
      
      this.setData({
        'formData.default_end_date': date,
        endDateIndex: value
      });
    },

    // 处理验证频率输入
    handleFrequencyInput(e) {
      this.setData({
        'formData.frequency': e.detail.value
      });
    },

    // 处理模板共享切换
    handleShareTemplateChange(e) {
      const value = parseInt(e.currentTarget.dataset.value);
      this.setData({
        'formData.share_template': value
      });
    },

    // 处理描述输入
    handleDescriptionInput(e) {
      this.setData({
        'formData.description': e.detail.value
      });
    },

    // 处理最少游戏次数输入
    handleMinGameTimesInput(e) {
      this.setData({
        'formData.min_game_times': e.detail.value
      });
    },

    // 处理最多游戏次数输入
    handleMaxGameTimesInput(e) {
      this.setData({
        'formData.max_game_times': e.detail.value
      });
    },

    // 处理游戏赌注输入
    handleGameBetInput(e) {
      this.setData({
        'formData.game_bet': e.detail.value
      });
    },

    // 处理清洗状态切换
    handleCleaningStatusChange(e) {
      const value = parseInt(e.currentTarget.dataset.value);
      this.setData({
        'formData.regular_cleaning_status': value
      });
    },

    // 处理清洗频率输入
    handleCleaningFrequencyInput(e) {
      this.setData({
        'formData.regular_cleaning_frequency': e.detail.value
      });
    },

    // 处理倒计时状态切换
    handleCountdownStatusChange(e) {
      const value = e.currentTarget.dataset.value;
      this.setData({
        'formData.display_countdown_status': value
      });
    },

    // 处理倒计时赌注输入
    handleCountdownBetInput(e) {
      this.setData({
        'formData.display_countdown_max_bet': e.detail.value
      });
    },

    // 处理友情链接状态切换
    handleShareLinkStatusChange(e) {
      const value = parseInt(e.currentTarget.dataset.value);
      this.setData({
        'formData.share_link_status': value,
        'formData.share_link_bet': value === 0 ? null : this.data.formData.share_link_bet
      });
    },

    // 处理友情链接赌注输入
    handleShareLinkBetInput(e) {
      this.setData({
        'formData.share_link_bet': e.detail.value
      });
    },

    // 处理示众状态切换
    handlePublicStatusChange(e) {
      const value = parseInt(e.currentTarget.dataset.value);
      this.setData({
        'formData.public_everyone_status': value
      });
    },

    // 处理示众赌注输入
    handlePublicBetInput(e) {
      this.setData({
        'formData.public_everyone_bet': e.detail.value
      });
    },

    // 处理结束条件切换
    handleEndConditionChange(e) {
      const value = parseInt(e.currentTarget.dataset.value);
      this.setData({
        'formData.end_condition': value
      });
    }
  }
})