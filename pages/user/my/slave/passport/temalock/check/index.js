var utils = require('../../../../../../../api/util.js');

Component({
  properties: {
    showTemaLockCheckDrawer: {
      type: Boolean,
      value: false,
      observer: function(newVal) {
        if (newVal) {
          var that = this;
          that.generateCheckNumber();
          const currentTime = that.getCurrentTime();
          console.log(that.properties.temalockCheckStatus.nextCheckTime);
          
          let timeResult = that.calculateTimeDiff(that.properties.temalockCheckStatus.nextCheckTime);
          
          that.setData({
            checkPicUrl: '',
            publicCheck: '1',
            checkResult: timeResult.compareStatus == 'after' ? 'ontime' : 'late',
            checkActualTime: currentTime,
            checkOriginalTime: that.properties.temalockCheckStatus.nextCheckTime
          });
        }
      }
    },
    temalockId: {
      type: String,
      value: ''
    },
    temalockCheckStatus: {
      type: Object,
      value: {}
    }
  },

  data: {
    checkNumber: '',
    checkPicUrl: '',
    publicCheck: '1',
    checkActualTime: '',
    checkOriginalTime: '',
    checkResult: 'ontime',
  },

  lifetimes: {
    attached() {
    }
  },


  methods: {
    // 选择图片
    chooseImage() {
      wx.showActionSheet({
        itemList: ['拍照', '从相册选择'],
        success: (res) => {
          if (!res.cancel) {
            const sourceType = res.tapIndex === 0 ? ['camera'] : ['album'];
            wx.chooseMedia({
              count: 1,
              mediaType: ['image'],
              sourceType: sourceType,
              success: (res) => {
                if (res.tempFiles[0].size > 1024 * 1024 * 2) {
                  wx.showToast({
                    title: '图片文件太大了',
                    icon: 'none'
                  });
                  return;
                }
                const tempFilePath = res.tempFiles[0].tempFilePath;
                this.uploadImage(tempFilePath);
              }
            });
          }
        }
      });
    },
    uploadImage(filePath){
			var that = this;
      wx.showLoading({
        title: '上传中...',
      });
      
      // 添加图片压缩
      wx.compressImage({
        src: filePath,
        quality: 80,  // 压缩质量0-100，数值越小压缩率越高
        success: (compressRes) => {
          wx.uploadFile({
            url: 'https://crayonapi.orcatt.one/upload/check/upload-image',
            filePath: compressRes.tempFilePath,  // 使用压缩后的图片路径
            name: 'image',
            header: {
              'Authorization': 'Bearer ' + wx.getStorageSync('token')
            },
            success: (res) => {
              let listData = JSON.parse(res.data);
              if (listData.code == 200) {
                that.setData({
                  checkPicUrl: listData.data.image_path
                });
                wx.showToast({
                  title: '上传成功',
                  icon: 'success'
                });
              } else {
                wx.showToast({
                  title: res.message || '上传失败',
                  icon: 'none'
                });
              }
            },
            fail: () => {
              wx.showToast({
                title: '上传失败',
                icon: 'none'
              });
            },
            complete: () => {
              wx.hideLoading();
            }
          });
        },
        fail: (err) => {
          console.error('压缩失败：', err);
          wx.showToast({
            title: '图片压缩失败',
            icon: 'none'
          });
          wx.hideLoading();
        }
      });
		},
    deleteImage() {
      var that = this;
      let postData = {
        image_path: that.data.checkPicUrl
      }
      utils.getData({
        url: 'upload/check/delete-image',
        params: postData,
        success: (res) => {
          if (res.code === 200) {
            that.setData({
              checkPicUrl: ''
            });
          } else {
            wx.showToast({
              title: res.message,
              icon: 'none'
            });
          }
        }
      });
    },
    // 处理公开验证开关
    handlePublicCheckChange(e) {
      const value = e.currentTarget.dataset.value;
      this.setData({
        publicCheck: value
      });
    },

    // 关闭弹窗
    closeDrawer() {
      this.triggerEvent('close');
    },

    // 提交验证
    handleSubmit() {
      var that = this;
      const { checkNumber, checkPicUrl, publicCheck, checkActualTime, checkOriginalTime, checkResult } = that.data;
      
      if (!checkPicUrl) {
        wx.showToast({
          title: '请上传验证图片',
          icon: 'none'
        });
        return;
      }

      let postData = {
        check_actual_time: checkActualTime,
        check_number: checkNumber,
        check_original_time: checkOriginalTime,
        check_pic_url: checkPicUrl,
        check_result: checkResult,
        public_check: publicCheck,
        temalock_id: that.properties.temalockId
      }
      console.log('postData', postData);

      utils.getData({
        url: 'slave/temalock/check/update',
        params: postData,
        success: (res) => {
          if (res.code === 200) {
            wx.showToast({
              title: '验证成功',
              icon: 'success'
            });
            that.setData({
              showLinkManagerDrawer: false
            });
            
            that.triggerEvent('submit');
          } else {
            wx.showToast({
              title: res.message,
              icon: 'none'
            });
          }
        }
      });

    },

    // 生成4位随机验证码
    generateCheckNumber() {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = '';
      for (let i = 0; i < 4; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      this.setData({
        checkNumber: result
      });
    },

    // 获取当前时间
    getCurrentTime() {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    },
    
    // 计算时间差
    calculateTimeDiff(targetTimeStr) {
      // 使用Date对象直接计算时间差
      let targetDate = new Date(targetTimeStr.replace(/-/g, '/'));
      let currentDate = new Date();
      
      // 计算时间差（毫秒）
      let timeDiff = targetDate.getTime() - currentDate.getTime();
      
      // 转换为秒
      timeDiff = timeDiff / 1000;
      
      // 判断时间状态（目标时间在当前时间之前还是之后）
      let compareStatus = timeDiff > 0 ? 'after' : 'before';
      
      return {
        timeDiff: Math.abs(timeDiff),
        compareStatus: compareStatus,
        // formattedTime: this.formatTimeRemaining(Math.abs(timeDiff))
      };
    },
  }
});