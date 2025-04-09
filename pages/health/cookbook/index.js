// pages/health/cookbook/index.js
var utils = require('../../../api/util.js');

Component({
  properties: {

  },
  data: {
    tabbarRealHeight: 0,
    cookbookList: [],
    page: 1,
    limit: 20,
    showAddDrawer: false,
    step: 1,
    formData: {
      name: '',
      tags: '',
      rating: 3,
      is_pinned: 0,
      image_path: ''
    },
    currentTag: '',
    recipe_id: "",
    ingredients: [],
    unitList: [
      { value: '1', label: '克' },
      { value: '2', label: '毫升' },
      { value: '3', label: '个' },
      { value: '4', label: '勺' },
      { value: '5', label: '适量' }
    ],
    showStepsDrawer: false,
    stepPage: 1,
    steps: [],
    showDetailDrawer: false,
    recipeDetail: null,
    isEditStatus: false, // 是否是编辑状态
  },
  methods: {
    getCookbookList() {
      var that = this;
      const postData = {
        page: that.data.page,
        limit: that.data.limit
      };
      utils.getData({
        url: 'health/recipes/list',
        params: postData,
        success: (res) => {
          if (res.code === 200) {
            res.data.data.forEach(item => {
              item.tags = item.tags.split(',')
            });
            that.setData({
              cookbookList: res.data.data
            })
          } else {
            wx.showToast({
              title: res.message,
              icon: 'none'
            });
          }
        }
      });
    },

    // ? ---- 新增菜品 ----
    addRecipe() {
      var that = this;
      that.triggerEvent('toggleTabBar', { show: false }, {});
      that.setData({
        showAddDrawer: true,
        formData: {
          name: '',
          tags: '',
          rating: 3,
          is_pinned: 0
        }
      });
    },
    closeAddDrawer() {
      var that = this;
      // console.log(that.data.isEditStatus, that.data.formData);
      if (!that.data.isEditStatus && that.data.formData.image_path) {
        that.deleteImage();
      }
      that.triggerEvent('toggleTabBar', { show: true }, {});
      that.setData({
        showAddDrawer: false,
        isEditStatus: false,
        step: 1,
        formData: {
          name: '',
          tags: '',
          rating: 3,
          is_pinned: 0
        },
        ingredients: []
      });


    },
    handleNameInput(e) {
      this.setData({
        'formData.name': e.detail.value
      });
    },
    handleTagsInput(e) {
      this.setData({
        'formData.tags': e.detail.value
      });
    },
    handleRatingTap(e) {
      this.setData({
        'formData.rating': e.currentTarget.dataset.rating
      });
    },
    handleCurrentTagInput(e) {
      this.setData({
        currentTag: e.detail.value
      });
    },
    addTag(e) {
      const tag = this.data.currentTag.trim();
      if (tag) {
        const tags = this.data.formData.tags ? this.data.formData.tags : [];
        if (!tags.includes(tag)) {
          tags.push(tag);
          this.setData({
            'formData.tags': tags,
            currentTag: ''
          });
        }
      }
    },
    deleteTag(e) {
      var that = this;
      const index = e.currentTarget.dataset.index;
      that.data.formData.tags.forEach((item, idx) => {
        if (idx === index) {
          that.data.formData.tags.splice(idx, 1);
        }
      });
      that.setData({
        'formData.tags': that.data.formData.tags
      });
    },
    nextStepTo2() {
      var that = this;
      if (!that.data.formData.name.trim()) {
        wx.showToast({
          title: '请输入菜名',
          icon: 'none'
        });
        return;
      }

      if (that.data.formData.tags.length === 0) {
        wx.showToast({
          title: '请至少添加一个标签',
          icon: 'none'
        });
        return;
      }

      let formData = that.data.formData;
      formData.tags = formData.tags.join(',');

      const postData = {
        name: formData.name,
        tags: formData.tags,
        rating: formData.rating,
        is_pinned: formData.is_pinned,
        image_path: formData.image_path
      };

      if (that.data.isEditStatus) {
        postData.id = formData.id;
        utils.getData({
          url: 'health/recipes/update',
          params: postData,
          success: (res) => {
            if (res.code === 200) {
              let ingredients = [];
              that.data.recipeDetail.ingredients.forEach(item => {
                let obj = {
                  name: item.ingredient_name,
                  quantity: item.quantity,
                  unit: item.unit,
                  sort_order: item.ingredient_sort_order
                }
                ingredients.push(obj);
              });
              that.setData({
                step: 2,
                ingredients: ingredients
              })
              
              that.getCookbookList()
            }
          }
        });
      } else {
        utils.getData({
          url: 'health/recipes/add',
          params: postData,
          success: (res) => {
            if (res.code === 200) {
              that.setData({
                step: 2,
                recipe_id: res.data.data.id,
                recipeDetail: res.data.data
              })
              
              that.getCookbookList()
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

    // ? ---- 补充食材 ----
    addIngredient() {
      const ingredients = this.data.ingredients;
      ingredients.push({
        name: '',
        quantity: '',
        unit: '',
        sort_order: ingredients.length + 1
      });
      this.setData({ ingredients });
    },
    deleteIngredient(e) {
      const index = e.currentTarget.dataset.index;
      const ingredients = this.data.ingredients;
      ingredients.splice(index, 1);
      // 重新计算排序
      ingredients.forEach((item, idx) => {
        item.sort_order = idx + 1;
      });
      this.setData({ ingredients });
    },
    handleIngredientNameInput(e) {
      const { index } = e.currentTarget.dataset;
      const { value } = e.detail;
      const ingredients = this.data.ingredients;
      ingredients[index].name = value;
      this.setData({ ingredients });
    },
    handleIngredientQuantityInput(e) {
      const { index } = e.currentTarget.dataset;
      const { value } = e.detail;
      const ingredients = this.data.ingredients;
      ingredients[index].quantity = value;
      this.setData({ ingredients });
    },
    handleUnitChange(e) {
      const { index } = e.currentTarget.dataset;
      const { value } = e.detail;
      const ingredients = this.data.ingredients;
      ingredients[index].unit = Number(value) + 1;
      this.setData({ ingredients });
    },
    submitIngredients() {
      const that = this;
      const ingredients = that.data.ingredients;

      if (ingredients.length === 0) {
        wx.showToast({
          title: '请至少添加一个食材',
          icon: 'none'
        });
        return;
      }

      // 验证每个食材的完整性
      for (let i = 0; i < ingredients.length; i++) {
        const item = ingredients[i];
        if (!item.name.trim()) {
          wx.showToast({
            title: `第${i + 1}个食材名称不能为空`,
            icon: 'none'
          });
          return;
        }
        if (!item.quantity && item.unit !== '5') { // 如果不是"适量"，需要填写数量
          wx.showToast({
            title: `第${i + 1}个食材用量不能为空`,
            icon: 'none'
          });
          return;
        }
        if (!item.unit) {
          wx.showToast({
            title: `第${i + 1}个食材单位不能为空`,
            icon: 'none'
          });
          return;
        }
      }

      const postData = {
        recipe_id: that.data.recipeDetail.recipe_id,
        ingredients: ingredients
      };

      utils.getData({
        url: 'health/recipes/ingredients/replace',
        params: postData,
        method: 'POST',
        success: (res) => {
          if (res.code === 200) {
            if (that.data.isEditStatus) {
              let steps = [];
              that.data.recipeDetail.steps.forEach(item => {
                let obj = {
                  step_number: item.step_number,
                  content: item.content,
                  image_path: item.image_path
                }
                steps.push(obj);
              });
              that.setData({
                showAddDrawer: false,
                showStepsDrawer: true,
                steps: steps
              });
            } else {
              that.setData({
                showAddDrawer: false,
                showStepsDrawer: true
              });
            }
            that.getCookbookList()
          } else {
            wx.showToast({
              title: res.message,
              icon: 'none'
            });
          }
        }
      });
    },

    // ? ---- 补充步骤 ----
    closeStepsDrawer() {
      var that = this;
      that.triggerEvent('toggleTabBar', { show: true }, {});
      that.setData({
        showStepsDrawer: false,
        stepPage: 1,
        steps: [],
        isEditStatus: false,
        formData: {
          name: '',
          tags: '',
          rating: 3,
          is_pinned: 0
        }
      });
    },
    addStep() {
      const steps = this.data.steps;
      steps.push({
        step_number: steps.length + 1,
        content: '',
        image_path: ''
      });
      this.setData({ steps });
    },
    deleteStep(e) {
      const index = e.currentTarget.dataset.index;
      const steps = this.data.steps;
      steps.splice(index, 1);
      // 重新计算步骤编号
      steps.forEach((item, idx) => {
        item.step_number = idx + 1;
      });
      this.setData({ steps });
    },
    handleStepContentInput(e) {
      const { index } = e.currentTarget.dataset;
      const { value } = e.detail;
      const steps = this.data.steps;
      steps[index].content = value;
      this.setData({ steps });
    },
    submitSteps() {
      const that = this;
      const steps = that.data.steps;

      if (steps.length === 0) {
        wx.showToast({
          title: '请至少添加一个步骤',
          icon: 'none'
        });
        return;
      }

      // 验证每个步骤的完整性
      for (let i = 0; i < steps.length; i++) {
        if (!steps[i].content.trim()) {
          wx.showToast({
            title: `第${i + 1}步内容不能为空`,
            icon: 'none'
          });
          return;
        }
      }

      const postData = {
        recipe_id: that.data.recipeDetail.recipe_id,
        steps: steps
      };

      utils.getData({
        url: 'health/recipes/steps/replace',
        params: postData,
        method: 'POST',
        success: (res) => {
          if (res.code === 200) {
            wx.showToast({
              title: '添加成功',
              icon: 'success'
            });
            that.closeStepsDrawer();
            that.getCookbookList(); // 刷新列表
          } else {
            wx.showToast({
              title: res.message,
              icon: 'none'
            });
          }
        }
      });
    },

    // ? ---- 查看菜谱 ----
    viewRecipeDetail(e) {
      const recipeId = e.currentTarget.dataset.id;
      var that = this;
      that.triggerEvent('toggleTabBar', { show: false }, {});
      // recipeId去匹配cookbookList
      that.data.cookbookList.forEach(item => {
        if (item.recipe_id === recipeId) {
          that.setData({
            recipeDetail: item,
            showDetailDrawer: true
          })
        }
      })
    },
    closeDetailDrawer() {
      var that = this;
      that.triggerEvent('toggleTabBar', { show: true }, {});
      that.setData({
        showDetailDrawer: false,
        recipeDetail: null
      });
    },

    // ? ---- 编辑菜谱 ----
    editDetail() {
      var that = this;
      that.setData({
        isEditStatus: true,
        showAddDrawer: true,
        showDetailDrawer: false,
        step: 1,
        recipe_id: that.data.recipeDetail.recipe_id,
        formData: {
          id: that.data.recipeDetail.recipe_id,
          name: that.data.recipeDetail.recipe_name,
          tags: that.data.recipeDetail.tags,
          rating: that.data.recipeDetail.rating,
          is_pinned: that.data.recipeDetail.is_pinned,
          image_path: that.data.recipeDetail.image_path
        }
      });
    },
    deleteRecipe() {
      var that = this;
      wx.showModal({
        title: '提示',
        content: '确定删除该菜谱吗？',
        success: (res) => {
          if (res.confirm) {
            utils.getData({
              url: 'health/recipes/delete',
              params: {
                id: that.data.recipeDetail.recipe_id
              },
              success: (res) => {
                if (res.code === 200) {
                  that.closeDetailDrawer();
                  that.getCookbookList();
                } else {
                  wx.showToast({
                    title: res.message,
                    icon: 'none'
                  });
                }
              }
            });
          }
        }
      });
    },
    chooseImage() {
      var that = this;
      wx.showActionSheet({
        itemList: ['拍照', '从相册选择'],
        success: function (res) {
          if (!res.cancel) {
            const sourceType = res.tapIndex === 0 ? ['camera'] : ['album'];
            wx.chooseMedia({
              count: 1,
              mediaType: ['image'],
              sourceType: sourceType,
              success: (res) => {
                const tempFilePath = res.tempFiles[0].tempFilePath;
                that.uploadImage(tempFilePath);
              }
            });
          }
        }
      });
    },
    uploadImage(filePath) {
      var that = this;
      wx.showLoading({
        title: '上传中...',
      });

      wx.uploadFile({
        url: 'https://crayonapi.orcatt.one/upload/recipes/upload-image',
        filePath: filePath,
        name: 'image',
        header: {
          'Authorization': 'Bearer ' + wx.getStorageSync('token')
        },
        success: (res) => {
          let data = JSON.parse(res.data);
          if (data.code == 200) {
            that.setData({
              'formData.image_path': data.data.image_path
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
    deleteImage() {
      var that = this;
      let postData = {
        image_path: that.data.formData.image_path
      }
      utils.getData({
        url: 'upload/recipes/delete-image',
        params: postData,
        success: (res) => {
          if (res.code === 200) {
            that.setData({
              'formData.image_path': ''
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
  },
  lifetimes: {
    attached: function () {
      var that = this;
      that.setData({
        tabbarRealHeight: wx.getStorageSync('tabbarRealHeight'),
      })
      that.getCookbookList()
    }
  }
})