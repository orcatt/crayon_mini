// pagesusertools/dict/index.js
Page({
  data: {
		tabbarRealHeight: 0,
    isFlipping: false,
    rotateY: 0,
    result: '', // 'positive' 或 'reverse'
    stats: {
      positive: 0, // 正面次数
      reverse: 0,  // 反面次数
      total: 0     // 总次数
    },
    images: {
      positive: 'https://crayonapi.orcatt.one/static/images/pic/positive.png',
      reverse: 'https://crayonapi.orcatt.one/static/images/pic/reverse.png'
    }
  },
  onLoad(options) {
		var that = this;
		that.setData({
			tabbarRealHeight: wx.getStorageSync('tabbarRealHeight')
		})

  },

  onReady() {},
  onShow() {},
  onHide() {},
  onUnload() {},
  onPullDownRefresh() {},
  onReachBottom() {},
  onShareAppMessage() {},

  // 开始翻转
  startFlip() {
    if (this.data.isFlipping) return;
    
    this.setData({ isFlipping: true });
    
    // 随机翻转次数（3-5次）
    const flips = Math.floor(Math.random() * 3) + 3;
    // 随机结果
    const result = Math.random() < 0.5 ? 'positive' : 'reverse';
    // 计算最终旋转角度
    const finalRotation = flips * 360 + (result === 'reverse' ? 180 : 0);
    
    // 更新统计数据
    const stats = this.data.stats;
    stats[result]++;
    stats.total++;
    
    this.setData({
      rotateY: finalRotation,
      result: result,
      stats: stats
    });
    
    // 动画结束后重置状态
    setTimeout(() => {
      this.setData({ isFlipping: false });
    }, 1000);
  },

  // 重置统计
  resetStats() {
    this.setData({
      stats: {
        positive: 0,
        reverse: 0,
        total: 0
      },
      result: '',
      rotateY: 0
    });
  }
})