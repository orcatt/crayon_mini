var utils = require('../../../api/util.js');

Component({
  properties: {

  },
  data: {
		tabbarRealHeight: 0,
		toolsList: [
			{
				id: 1,
				title: "转换",
				desc: "单位换算",
				url: "/pages/user/tools/unitConversion/index",
				icon: "/static/image/tools/3.png"
			},{
				id: 2,
				title: "间隔",
				desc: "日期时间",
				url: "/pages/user/tools/dateInterval/index",
				icon: "/static/image/tools/4.png"
			},{
				id: 3,
				title: "属地",
				desc: "邮编区号",
				url: "/pages/user/tools/location/index",
				icon: "/static/image/tools/1.png"
			},{
				id: 4,
				title: "原研药",
				desc: "信息查询",
				url: "/pages/user/tools/drug/index",
				icon: "/static/image/tools/10.png"
			},{
				id: 7,
				title: "硬币",
				desc: "交给天意",
				url: "/pages/user/tools/coin/index",
				icon: "/static/image/tools/5.png"
			},{
				id: 9,
				title: "生肖",
				desc: "属相查询",
				url: "/pages/user/tools/zodiac/index",
				icon: "/static/image/tools/11.png"
			},{
				id: 10,
				title: "字典",
				desc: "查字解词",
				url: "/pages/user/tools/dict/index",
				icon: "/static/image/tools/2.png"
			},{
				id: 11,
				title: "血型",
				desc: "遗传计算",
				url: "/pages/user/tools/bloods/index",
				icon: "/static/image/tools/9.png"
			},{
				id: 12,
				title: "备忘录",
				desc: "记录生活",
				url: "/pages/user/tools/memo/index",
				icon: "/static/image/tools/14.png"
			},{
				id: 13,
				title: "代办",
				desc: "代办事项",
				url: "/pages/user/tools/todo/index",
				icon: "/static/image/tools/15.png"
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