// var webUrl = "http://192.168.8.117:8081/";
// var webUrl = "http://192.168.1.5:8081/";

var webUrl = "https://crayonapi.orcatt.one/";
// v=spf1 include:spf.efwd.registrar-servers.com ~all
//网络请求方法
function getData(model) {
  // wx.showLoading({
  //   title: '加载中',
  //   mask: true,
  // })
  wx.request({
    url: webUrl + model.url + (model.method === 'DELETE' && model.params ? '?' + objectToQueryString(model.params) : ''),
    data: model.method !== 'DELETE' ? model.params : {},
    header: {
      "Content-Type": "application/json",
      "Authorization": 'Bearer ' + wx.getStorageSync('token') || ''
    },
    method: model.method || 'POST',
    success: function (res) {
      // wx.hideLoading();
      model.success(res.data)
      if (wx.getStorageSync('token') && res.data.code == 401) {
        wx.clearStorageSync();
        wx.reLaunch({
          url: '/pages/login/index',
        })
      }
    },
    fail: function (res) {
      console.log(res)
      // wx.hideLoading();
      wx.showModal({
        title: res.Error,
        showCancel: false
      })
    }
  })
}

// 新增辅助函数，用于将对象转换为查询字符串
function objectToQueryString(obj) {
  return Object.keys(obj)
    .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]))
    .join('&');
}

// 节流
const throttle = (fn,delay)=>{
  let oldDate = Date.now();
  return function(){
      let args = arguments;
      let newDate = Date.now();
      let that = this;
      if(newDate-oldDate>delay){
          fn.apply(that,args);
          //倘若时间差大于延长时间 就更新一次旧时间
          oldDate = Date.now();
      }
  }
}
// 导出模块
module.exports = {
  getData: getData,
  throttle:throttle
}