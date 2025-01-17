var utils = require('../../../../../api/util.js');

Component({
	properties: {
	},
	data: {
		codes: ['', '', '', '', '', ''],
		focusIndex: -1,
		locationResult: null
	},
	methods: {
		// 输入处理
		onInput(e) {
			const index = e.currentTarget.dataset.index;
			const value = e.detail.value;
			
			// 更新当前输入
			let codes = [...this.data.codes];
			codes[index] = value;
			
			if (value) {
				// 有输入值时，自动跳转到下一个输入框
				const nextIndex = index + 1;
				this.setData({
					codes,
					focusIndex: nextIndex < 6 ? nextIndex : 5
				});

				// 如果输入完成，则查询
				if (codes.join('').length === 6) {
					this.queryLocation(codes.join(''));
				}
			} else {
				// 删除值时，只更新codes，不改变焦点
				this.setData({ codes });
			}
		},

		// 获取焦点
		onFocus(e) {
			const index = e.currentTarget.dataset.index;
			this.setData({
				focusIndex: index
			});
		},

		// 点击输入框
		onTap(e) {
			const index = e.currentTarget.dataset.index;
			this.setData({
				focusIndex: index
			});
		},

		// 清空所有输入
		clearAll() {
			this.setData({
				codes: ['', '', '', '', '', ''],
				focusIndex: -1,
				locationResult: null
			});
		},

		// 查询位置信息
		queryLocation(idcard) {
			let postData = {
				code: idcard,
			}
			utils.getData({
				url: 'explore/location/idcard',
				params: postData,
				success: (res) => {
					if (res.code == 200) {
						this.setData({
							locationResult: res.data[0]
						});
					} else {
						wx.showToast({
							title: res.message,
							icon: 'none'
						});
					}
				}
			});
		}
	},
	lifetimes: {
		attached: function () {
		}
	}
});