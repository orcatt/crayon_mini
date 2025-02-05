// pagesusertools/dict/index.js
var utils = require('../../../../api/util.js');

Page({
  data: {
		tabbarRealHeight: 0,
    activeIndex: 0,
    lettersIndex:[
      "A",
      "B",
      "C",
      "D",
      "E",
      "F",
      "G",
      "H",
      "J",
      "K",
      "L",
      "M",
      "N",
      "P",
      "Q",
      "R",
      "S",
      "T",
      "W",
      "X",
      "Y",
      "Z",
    ],
    drugList: [],
    searchValue: ''
  },
  onLoad(options) {
		var that = this;
		that.setData({
			tabbarRealHeight: wx.getStorageSync('tabbarRealHeight')
		})
    that.getDrugList('A','');
  },
  handleDrugType(e){
    var that = this;
    // 先设置缩小动画
    this.setData({
      activeIndex: -1
    });
    // 短暂延迟后设置新的选中状态，触发放大动画
    setTimeout(() => {
      this.setData({
        activeIndex: e.currentTarget.dataset.index
      });
      this.getDrugList(that.data.lettersIndex[e.currentTarget.dataset.index],'');
    }, 50);
  },
  handleDrugSearch(e){
    var that = this;
    that.setData({
      searchValue: e.detail.value,
      activeIndex: 0
    })
    that.getDrugList('', e.detail.value);
  },
  getDrugList(letter,name){
    var that = this;
    let postData = {
      letter: letter,
      name: name
    }
    utils.getData({
      url: 'explore/drug/search',
      params: postData,
      success: function (res) {
        if (res.code == 200) {
          res.data.forEach(item => {
            item.tags = item.tags.split(',');
          })
          that.setData({
            drugList: res.data
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