// pages/explore/tools/dict/index.js
var utils = require('../../../../../api/util.js');

Page({
  data: {
		tabbarRealHeight: 0,
    fontsData: []
  },
  onLoad(options) {
		var that = this;
		that.setData({
			tabbarRealHeight: wx.getStorageSync('tabbarRealHeight')
		})

    if (options.type == 'pinyin') {
      that.getPinyin(options.pinyin);
    } else if (options.type == 'bushou') {
      that.getBushou(options.bushou);
    } else if (options.type == 'bihua') {
      that.getBihua(options.bihua);
    } else if (options.type == 'bhbs') {
      that.getBhbs(options.bihua, options.bushou);
    }

  },
  getPinyin(pinyin){
    var that = this;
    let postData = {
      pinyin: pinyin
    }
    utils.getData({
      url: 'explore/dictionary/pinyinSearch',
      params: postData,
      success: function (res) {
        if (res.code == 200) {
          // console.log(res);
          that.setData({
            fontsData: res.data
          })
        } else {
          wx.showToast({
            title: res.message,
            icon: 'none',
          })
        }
      }
    })
  },
  getBushou(bushou){
    var that = this;
    let postData = {
      radicals: bushou
    }
    utils.getData({
      url: 'explore/dictionary/bhbsSearch',
      params: postData,
      success: function (res) {
        if (res.code == 200) {
          // console.log(res);
          that.setData({
            fontsData: res.data
          })
        } else {
          wx.showToast({
            title: res.message,
            icon: 'none',
          })
        }
      }
    })
  },
  getBihua(bihua){
    var that = this;
    let postData = {
      strokes: bihua
    }
    utils.getData({
      url: 'explore/dictionary/bhbsSearch',
      params: postData,
      success: function (res) {
        if (res.code == 200) {
          that.setData({
            fontsData: res.data
          })
        } else {
          wx.showToast({
            title: res.message,
            icon: 'none',
          })
        }
      }
    })
  },
  getBhbs(bihua, bushou){
    var that = this;
    let postData = {
      strokes: bihua,
      radicals: bushou
    }
    utils.getData({
      url: 'explore/dictionary/bhbsSearch',
      params: postData,
      success: function (res) {
        if (res.code == 200) {
          // console.log(res);
          that.setData({
            fontsData: res.data
          })
        } else {
          wx.showToast({
            title: res.message,
            icon: 'none',
          })
        }
      }
    })
  }, 
  onReady() {},
  onShow() {},
  onHide() {},
  onUnload() {},
  onPullDownRefresh() {},
  onReachBottom() {},
  onShareAppMessage() {}
})