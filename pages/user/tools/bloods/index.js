// pages/user/tools/dict/index.js
const bloodParent = require('../../../../utils/bloodParent.js');

Page({
  data: {
		tabbarRealHeight: 0,
    bloodTypes: ['A型', 'B型', 'O型', 'AB型'],
    parentA: null,
    parentB: null,
    resultPossible: [],
    resultImpossible: [],
    showResult: false
  },
  onLoad(options) {
		var that = this;
		that.setData({
			tabbarRealHeight: wx.getStorageSync('tabbarRealHeight'),
      bloodParent: bloodParent.default
		})
    console.log(that.data.bloodParent);
    

  },

  onReady() {},
  onShow() {},
  onHide() {},
  onUnload() {},
  onPullDownRefresh() {},
  onReachBottom() {},
  onShareAppMessage() {},

  // 选择亲属A血型
  onParentAChange(e) {
    const index = e.detail.value;
    this.setData({
      parentA: this.data.bloodTypes[index]
    });
    this.calculateBloodTypes();
  },

  // 选择亲属B血型
  onParentBChange(e) {
    const index = e.detail.value;
    this.setData({
      parentB: this.data.bloodTypes[index]
    });
    this.calculateBloodTypes();
  },

  // 清空选择
  clearSelection() {
    this.setData({
      parentA: null,
      parentB: null,
      showResult: false,
      resultPossible: [],
      resultImpossible: []
    });
  },

  // 计算可能的血型
  calculateBloodTypes() {
    const { parentA, parentB } = this.data;
    
    if (!parentA || !parentB) return;

    // 所有血型
    const allBloodTypes = ['A型', 'B型', 'O型', 'AB型'];
    
    // 获取可能的血型
    let possibleTypes = this.getPossibleBloodTypes(parentA, parentB);
    
    // 计算不可能的血型
    let impossibleTypes = allBloodTypes.filter(type => !possibleTypes.includes(type));

    this.setData({
      resultPossible: possibleTypes,
      resultImpossible: impossibleTypes,
      showResult: true
    });
  },

  // 根据父母血型获取可能的子女血型
  getPossibleBloodTypes(typeA, typeB) {
    const bloodRules = {
      'A型': {
        'A型': ['A型', 'O型'],
        'B型': ['AB型', 'A型', 'B型', 'O型'],
        'O型': ['A型', 'O型'],
        'AB型': ['A型', 'B型', 'AB型']
      },
      'B型': {
        'A型': ['AB型', 'A型', 'B型', 'O型'],
        'B型': ['B型', 'O型'],
        'O型': ['B型', 'O型'],
        'AB型': ['A型', 'B型', 'AB型']
      },
      'O型': {
        'A型': ['A型', 'O型'],
        'B型': ['B型', 'O型'],
        'O型': ['O型'],
        'AB型': ['A型', 'B型']
      },
      'AB型': {
        'A型': ['A型', 'B型', 'AB型'],
        'B型': ['A型', 'B型', 'AB型'],
        'O型': ['A型', 'B型'],
        'AB型': ['A型', 'B型', 'AB型']
      }
    };

    return bloodRules[typeA][typeB] || [];
  }
})