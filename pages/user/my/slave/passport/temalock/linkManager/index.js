// pages/user/my/slave/passport/temalock/linkManager/index.js
Component({

  properties: {
    showLinkManagerDrawer: {
      type: Boolean,
      value: false,
      observer: function(newVal) {
        var that = this;
        if (newVal) {
          that.setData({
            managerUserId: '',
          });
        }
      }
    }
  },
  data: {
    managerUserId: '',
    linkText: '此处是测试地址'
  },

  methods: {
    // 关闭抽屉
    showCloseLinkManagerDrawer() {
      this.triggerEvent('close');
    },

    // 处理管理者ID输入
    handleManagerUserIdInput(e) {
      this.setData({
        managerUserId: e.detail.value
      });
    },

    // 复制链接
    copyLink() {
      wx.setClipboardData({
        data: this.data.linkText,
        success: () => {
          wx.showToast({
            title: '链接已复制',
            icon: 'success'
          });
        }
      });
    },

    // 处理绑定管理者
    handleBindManager() {
      if (!this.data.managerUserId) {
        wx.showToast({
          title: '请输入管理者ID',
          icon: 'none'
        });
        return;
      }

      // 触发绑定事件，将管理者ID传递给父组件
      this.triggerEvent('bind', {
        manager_user_id: this.data.managerUserId
      });
    }
  }
})