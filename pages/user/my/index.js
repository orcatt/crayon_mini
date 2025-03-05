var utils = require('../../../api/util.js');

Component({
  properties: {

  },
  data: {
		tabbarRealHeight: 0,
		userInfo: {},
		menuList: [
			{
				icon: '/static/image/memo.png',
				title: '认证',
				desc: '认证信息',
				url: '/pages/user/tools/memo/index'
			},
			{
				icon: '/static/image/settings.png',
				title: '设置',
				desc: '偏好设置',
				url: '/pages/user/settings/index'
			}
		],
		newAvatarUrl: ''
  },
  methods: {
		navigateTo(e) {
			const url = e.currentTarget.dataset.url;
			wx.navigateTo({
				url: url
			});
		},
		chooseImage() {
      var that = this;
			
      wx.showActionSheet({
        itemList: ['拍照', '从相册选择'],
        success: function(res) {
          if (!res.cancel) {
            const sourceType = res.tapIndex === 0 ? ['camera'] : ['album'];
            wx.chooseMedia({
              count: 1,
              mediaType: ['image'],
              sourceType: sourceType,
              success: (res) => {
                const tempFilePath = res.tempFiles[0].tempFilePath;
                that.uploadAvatar(tempFilePath);
              }
            });
          }
        }
      });
    },
		uploadAvatar(filePath){
			var that = this;
      wx.showLoading({
        title: '上传中...',
      });
      wx.uploadFile({
        url: 'https://crayonapi.orcatt.one/upload/auth/uploadAvatar',
        filePath: filePath,
        name: 'image',
        header: {
          'Authorization': 'Bearer ' + wx.getStorageSync('token')
        },
        success: (res) => {
          console.log(res);
          let data = JSON.parse(res.data);
          if (data.code == 200) {
						if(that.data.userInfo.avatar_url){
							that.deleteImage();
						}
						that.setData({
							newAvatarUrl: data.data.image_path
						});
						that.updateUserInfo();
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
		
		deleteImage() {
      var that = this;
      let postData = {
        image_path: that.data.userInfo.avatar_url
      }
      utils.getData({
        url: 'upload/auth/deleteAvatar',
        params: postData,
        success: (res) => {
          if (res.code === 200) {
          }else{
            wx.showToast({
              title: res.message,
              icon: 'none'
            });
          }
        }
      });
    },
		updateUserInfo(){
			var that = this;
			let postData = {
				avatar_url: that.data.newAvatarUrl
			}
			utils.getData({
				url: 'auth/updateUserInfo',
				params: postData,
				success: function (res) {
					if (res.code == 200) {
						wx.setStorageSync('userInfo', res.data);
						that.setData({
							userInfo: res.data,
							newAvatarUrl: ''
						})
					}
				}
			})
		},
  },
  lifetimes: {
		attached: function () {
			var that = this;
			that.setData({
				tabbarRealHeight: wx.getStorageSync('tabbarRealHeight'),
				userInfo: wx.getStorageSync('userInfo')
			})
			console.log('userinfo',that.data.userInfo );


			
			
		}
	}

})