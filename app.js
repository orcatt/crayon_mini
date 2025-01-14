// app.js
App({
  onLaunch() {
		var that = this;
    that.getFonts('DouyinSansBold.otf')
		// 破除iOS静音模式下无声音
		wx.setInnerAudioOption({
      obeyMuteSwitch: false,
      success: function (res) {
        console.log("开启静音模式下播放音乐的功能");
      },
      fail: function (err) {
        console.log("静音设置失败");
      },
		});
	},
	getFonts(name){ //导入外部字体
    let url = "https://crayonapi.orcatt.one/static/fonts/" //自己服务器的域名(或IP)
    let source = 'url(' + url + name + ')'
    // console.log(source, name.substring(0, name.length - 4))
    wx.loadFontFace({
      family: name.substring(0, name.length - 4), //名称去掉后缀
      source: source,
      global: true,
      success(res) {
        console.log("load " + name.substring(0, name.length - 4) + " success")
        //   console.log(res)
      },
      fail(res) {
        console.log("load " + name.substring(0, name.length - 4) + " failed")
        console.log(res) //出错则打印信息
      }
    })
  },
  globalData: {
    userInfo: null
  }
})
