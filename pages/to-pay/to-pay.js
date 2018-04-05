// pages/to-pay/to-pay.js
var app = getApp();
Page({
  data: {
    idLogistics:0,   //是否需要物流信息
    hidden:false,
    orderType:'',  //订单类型，默认是购物车
    goodsJsonStr:''
  },
  onLoad: function (options) {
   this.setData({
     orderType:options.orderType
   })
   this.createOrder()
  },
  // 增加地址
  addAdress(){
    wx.navigateTo({
      url: '/pages/add-address/add-address',
    })
  },
  createOrder(e){
    // wx.showLoading()
    let loginToken = app.globalData.token  //用户登陆的token
    let remark = ''  //备注信息
    if(e){
      remark = e.target.value.remark
    }
    let postData ={
      loginToken:loginToken,
      goodsJsonStr: this.data.goodsJsonStr,
      remark:remark
    }

  }
})