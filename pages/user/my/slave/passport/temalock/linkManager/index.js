// pages/user/my/slave/passport/temalock/linkManager/index.js
var utils = require('../../../../../../../api/util.js');

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
    },
    temaLockDataId: {
      type: String,
      value: '',
    },
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
      var that = this;
      if (!that.data.managerUserId) {
        wx.showToast({
          title: '请输入管理者ID',
          icon: 'none'
        });
        return;
      }
      
      // 这里可以调用API进行绑定操作
      utils.getData({
        url: 'slave/temalock/bind/manager',
        params: {
          manager_user_id: that.data.managerUserId,
          temalock_id: that.data.temaLockDataId
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
            that.triggerEvent('bindManager');
          } else {
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