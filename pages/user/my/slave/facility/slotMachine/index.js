var utils = require('../../../../../../api/util.js');

Component({
  properties: {
    // 闪动次数
    flashCount: {
      type: Number,
      value: 9
    },
    // 每次闪动的间隔时间（毫秒）
    flashInterval: {
      type: Number,
      value: 100
    }
  },
  data: {
		tabbarRealHeight: 0,
		reels: [
			{ color: '#FFC53F', id: 'color1' },
			{ color: '#FFED97', id: 'color2' },
			{ color: '#02BDFD', id: 'color3' }
		],
		currentColors: [
			{ color: '#FFC53F', id: 'current1' },
			{ color: '#FFED97', id: 'current2' },
			{ color: '#02BDFD', id: 'current3' }
		],
		isSpinning: false,
		showResult: false,
		resultText: '',
		animationData: [],
		currentFlashCount: 0
  },
  methods: {
		startSpin() {
			if (this.data.isSpinning) return;
			
			this.setData({
				isSpinning: true,
				showResult: false,
				currentFlashCount: 0
			});

			// 随机生成三个位置
			const positions = [
				Math.floor(Math.random() * 3),
				Math.floor(Math.random() * 3),
				Math.floor(Math.random() * 3)
			];

			// 开始闪动
			this.startFlashing(positions);
		},

		startFlashing(positions) {
			const { flashCount, flashInterval } = this.properties;
			const { currentFlashCount } = this.data;

			if (currentFlashCount >= flashCount) {
				// 闪动结束，显示最终结果
				this.showFinalResult(positions);
				return;
			}

			// 为每个滚轮创建动画
			const animations = positions.map((pos, index) => {
				const animation = wx.createAnimation({
					duration: flashInterval,
					timingFunction: 'linear',
					delay: 0
				});

				// 创建渐隐渐现动画
				animation.opacity(0.8).step({
					duration: flashInterval / 2,
					timingFunction: 'ease-out'
				});
				
				animation.opacity(1).step({
					duration: flashInterval / 2,
					timingFunction: 'ease-in'
				});

				return animation.export();
			});

			// 更新颜色（在闪动过程中随机切换颜色）
			const newColors = positions.map((pos, index) => ({
				color: this.data.reels[Math.floor(Math.random() * 3)].color,
				id: `current${index + 1}`
			}));
			
			this.setData({
				animationData: animations,
				currentColors: newColors,
				currentFlashCount: currentFlashCount + 1
			});

			// 继续下一次闪动
			setTimeout(() => {
				this.startFlashing(positions);
			}, flashInterval);
		},

		showFinalResult(positions) {
			// 更新为最终颜色
			const newColors = positions.map((pos, index) => ({
				color: this.data.reels[pos].color,
				id: `current${index + 1}`
			}));

			this.setData({
				currentColors: newColors,
				isSpinning: false
			});

			this.checkResult(positions);
		},

		checkResult(positions) {
			const colors = positions.map(pos => this.data.reels[pos].color);
			let resultText = '';

			// 检查结果
			if (colors[0] === colors[1] && colors[1] === colors[2]) {
				resultText = '恭喜！三个颜色相同！';
			} else if (colors[0] === colors[1] || colors[1] === colors[2] || colors[0] === colors[2]) {
				resultText = '不错！有两个颜色相同！';
			} else {
				resultText = '三个颜色都不同！';
			}

			this.setData({
				isSpinning: false,
				showResult: true,
				resultText
			});
		}
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