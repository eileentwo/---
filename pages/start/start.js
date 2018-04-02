// pages/start/start.js
Page({
  data: {
    userInfo: {}
  },
  onLoad: function (options) {
    wx.getUserInfo({
      success: (res) => {
        // console.log(res.userInfo)
        this.setData({
          userInfo: res.userInfo
        })
      }
    })
  },
  goToIndex(){
    // switchTab 跳转到 tabBar 页面，并关闭其他所有非 tabBar 页面
    wx.switchTab({
      url: '/page/index/index',  //需要跳转的 tabBar 页面的路径（需在 app.json 的 tabBar 字段定义的页面），路径后不能带参数
    })
  }
})