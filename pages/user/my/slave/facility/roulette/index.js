var utils = require('../../../../../../api/util.js');


Component({
  properties: {
    showRoulette: {
      type: Boolean,
      value: false,
      observer(newVal) {
        if(newVal){
          this.getRouletteData();
        }
      }
    },
    rouletteData: {
      type: Array,
      value: []
    }
  },
  data: {
    tabbarRealHeight: 0,
    datas: [], // 数据 
    prizeId: '',  // 抽中结果id，通过属性方式传入组件
  },
  methods: {
		// 次数不足回调
		onNotEnoughHandle(e) {
			wx.showToast({
				icon: 'none',
				title: e.detail
			})
		},

		// 抽奖回调
		onLuckDrawHandle() {
			this.setData({
				prizeId: this.data.datas[Math.floor(Math.random() * 10 % this.data.datas.length)].id
			});
		},

		// 动画旋转完成回调
		onLuckDrawFinishHandle() {
			const datas = this.data.datas;
			const data = datas.find((item) => {
				return item.id === this.data.prizeId;
			});
			wx.showToast({
				icon: 'none',
				title: `恭喜你抽中 ${data.title}`
			})
			this.setData({
				prizeId: ''
			});
		},
    getRouletteData(){
      var that = this;
      // 在当前投注的10倍之内随机生成一个数字
      for(let i = 0; i < 10; i++){
        const randomNum = Math.floor(Math.random() * (10 * 10));
        // 随机取是否延长/缩短时间
        const reward_punishment = Math.random() > 0.5 ? 'REWARD' : 'PUNISHMENT';
        
        console.log('随机数字：', randomNum);
        let rouletteDataObj = {
          id: randomNum.toString(),
          // reward_punishment: reward_punishment,
          title: reward_punishment === 'REWARD' ? '时间缩短' + randomNum + '分钟' : '时间延长' + randomNum + '分钟',
          imgUrl: reward_punishment === 'REWARD' ? '/static/image/complete.png' : '/static/image/incomplete.png'
        }
        that.setData({
          datas: [...that.data.datas, rouletteDataObj]
        })
      }
      console.log('随机数字：', that.data.datas);
    },
  },
  lifetimes: {
		attached: function () {
			var that = this;
			that.setData({
				tabbarRealHeight: wx.getStorageSync('tabbarRealHeight')
			})
		}
	}

})