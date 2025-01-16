var utils = require('../../../api/util.js');

Component({
  properties: {

  },
  data: {
		tabbarRealHeight: 0,
		toolsList: [
			{
				id: 1,
				title: "解析",
				desc: "视频下载",
				url: "/pages/explore/tools/video/index",
				icon: "/static/image/tools/7.png"
			},{
				id: 2,
				title: "字典",
				desc: "查字解词",
				url: "/pages/explore/tools/dict/index",
				icon: "/static/image/tools/2.png"
			},{
				id: 3,
				title: "间隔",
				desc: "日期时间",
				url: "/pages/explore/tools/dateInterval/index",
				icon: "/static/image/tools/4.png"
			},{
				id: 5,
				title: "属地",
				desc: "邮编区号",
				url: "/pages/explore/tools/postCode/index",
				icon: "/static/image/tools/1.png"
			},{
				id: 7,
				title: "车牌",
				desc: "哪来儿的",
				url: "/pages/explore/tools/carCode/index",
				icon: "/static/image/tools/6.png"
			},{
				id: 8,
				title: "身份证",
				desc: "哪儿人",
				url: "/pages/explore/tools/idCard/index",
				icon: "/static/image/tools/8.png"
			},{
				id: 9,
				title: "原研药",
				desc: "信息查询",
				url: "/pages/explore/tools/drug/index",
				icon: "/static/image/tools/10.png"
			}
		]
  },
  methods: {
		goToPage(e) {	
			wx.navigateTo({
				url: e.currentTarget.dataset.url
			})
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
  },
  lifetimes: {
		attached: function () {
			var that = this;
			that.setData({
				tabbarRealHeight: wx.getStorageSync('tabbarRealHeight')
			})
			that.getFonts('XIHEIPINYIN.ttf')
		}
	}

})