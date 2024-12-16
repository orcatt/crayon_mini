// pages/login/index.js
var utils = require('../../api/util.js');

Page({
  data: {
    text1: '',
    text2: '',
    line1Show: false,
    line2Show: false,
    fullText1: '日有小满,岁有小安',
    fullText2: '四时微澜,万物皆欢',
    isAccountLogin: false,
    isBindPhone: false,
    phone: '',
    password: '',
    openid: '',
  },
  onLoad(options) {
    var that = this;
    that.setData({
      tabbarMargin: wx.getMenuButtonBoundingClientRect().top,
      tabbarHeight: wx.getMenuButtonBoundingClientRect().height,
      tabbarRealHeight: wx.getMenuButtonBoundingClientRect().top + wx.getMenuButtonBoundingClientRect().height + 12
    })
    wx.setStorageSync('tabbarRealHeight', that.data.tabbarRealHeight)
    this.typeWriter(1);
		
  },
  changeLogin() {
    this.setData({ 
      isAccountLogin: !this.data.isAccountLogin,
      phone: '',
      password: '',
    });
  },
  phoneChange(e) {
    this.setData({ phone: e.detail.value });
  },
  passwordChange(e) {
    this.setData({ password: e.detail.value });
  },
  wxLogin() {
    var that = this;
    wx.login({
      success: res => {
        console.log(res);
        let postData = {
          code: res.code,
        }
        utils.getData({
          url: 'auth/wechat-login',
          params: postData,
          success: function (res) {
            console.log(res);
            if (res.code == 200) {
              wx.setStorageSync('userInfo', res.data.userInfo);
              wx.setStorageSync('userId', res.data.userInfo.id);
              wx.setStorageSync('token', res.data.token);
              wx.reLaunch({
                url: '/pages/today/index',
              })
            }else if(res.code == 401){
              wx.showToast({
                title: '请您先绑定手机号',
                icon: 'none',
              })
              that.setData({
                isBindPhone: true,
                isAccountLogin: true,
                openid: res.data.openid,
              })
            }else{
              wx.showToast({
                title: res.message,
                icon: 'none',
              })
            }
          }
        })
      }
    })
  },
  accountLogin() {
    var that = this;
    console.log('accountLogin');
    if (!that.data.isBindPhone) {
      // 正常登录
      let postData = {
        phone: that.data.phone,
        password: that.data.password,
      }
      utils.getData({
        url: 'auth/login',
        params: postData,
        success: function (res) {
          if (res.code == 200) {
            wx.setStorageSync('userInfo', res.data.userInfo);
            wx.setStorageSync('userId', res.data.userInfo.id);
            wx.setStorageSync('token', res.data.token);
            wx.reLaunch({
              url: '/pages/index/index',
            })
          }else{
            wx.showToast({
              title: res.message,
              icon: 'none',
            })
          }
        }
      })
    }else{
      // 绑定手机号登录
      let postData = {
        openid: that.data.openid,
        phone: that.data.phone,
        password: that.data.password,
      }
      utils.getData({
        url: 'auth/register',
        params: postData,
        success: function (res) {
          if (res.code == 200) {
            // console.log(res.data);
            that.wxLogin()
          }
        }
      })
    }
  },
  typeWriter(lineNum) {
    const that = this;
    const fullText = lineNum === 1 ? this.data.fullText1 : this.data.fullText2;
    const speed = 300; // 调慢打字速度到300毫秒
    let i = 0;

    // 先显示容器
    if (lineNum === 1) {
      this.setData({ line1Show: true });
    } else {
      this.setData({ line2Show: true });
    }

    function typing() {
      if (i < fullText.length) {
        that.setData({
          [`text${lineNum}`]: fullText.substring(0, i + 1)
        });
        i++;
        setTimeout(typing, speed);
      } else if (lineNum === 1) {
        // 第一行完成后，延长等待时间到1秒再开始第二行
        setTimeout(() => {
          that.typeWriter(2);
        }, 1000);
      }
    }

    typing();
  },
  onReady() {

  },
  onShow() {
  },
  onHide() {

  },
  onUnload() {

  },
  onPullDownRefresh() {

  },
  onReachBottom() {

  },
  onShareAppMessage() {

  }
})