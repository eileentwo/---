//user.js
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
  }
})
