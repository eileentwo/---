// pages/to-pay/to-pay.js
var app = getApp();
Page({
  data: {
    isLogistics:0,   //是否需要物流信息
    curAddressData:false,
    orderType:'',  //订单类型，默认是购物车
    goodsJsonStr:'',
    goodsList:{},
    totalPrice:0

  },
  onLoad: function (options) {
    // console.log(options)  //orderType:"buyNow"
   this.setData({
     orderType:options.orderType,
     idLogistics:1
   })
  //  this.createOrder()
  },
  onShow(){
    let shopList ={}
    if ('buyNow' == this.data.orderType) {
      // 立即购买下单
      let buyNowInfoMem = wx.getStorageSync('buyNowInfo')
      if(buyNowInfoMem && buyNowInfoMem.shopList ){
        shopList = buyNowInfoMem.shopList
      }
    }else{
      //购物车下单
      let shopCarInfoMem = wx.getStorageSync('shopCarInfo')
      if(shopCarInfoMem && shopCarInfoMem.shopList){
        shopList = shopCarInfoMem.shopList.filter(entity =>{
          return entity.active;
        })
      }
    }
    this.setData({
      goodsList: shopList
    })
    this.total()  //计算总数
  },
  // 选择地址
  selectAdress(){
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

  },
  // 计算总数量及总价格
  total() {
    let goodsList = this.data.goodsList
    let totalPrice = 0
    let goodsJsonStr='['
    let isLogistics=0
    for(let i=0; i<goodsList.length;i++){
      if (goodsList[i].logistics){
        isLogistics =1;
      }
      totalPrice += goodsList[i].buyNum * goodsList[i].price;

      let goodsJsonStrTmp = '';
      if(i >0){
        goodsJsonStrTmp=',';
      }
      let inviter_id = 0;
      let inviter_id_storge = wx.getStorageSync('inviter_id_' + goodsList[i].goodsId);
      if (inviter_id_storge) {
        inviter_id = inviter_id_storge;
      }
      goodsJsonStrTmp += '{"goodsId:"' + goodsList[i].goodsId + '","buyNum":' + goodsList[i].buyNum + ',"propertyChildIds":"' + goodsList[i].propertyChildIds + '","logisticsType":0, "inviter_id":' + inviter_id + '}';
      goodsJsonStr += goodsJsonStrTmp;

    }
    goodsJsonStr += ']'
    // console.log(goodsJsonStr)
    this.setData({
      goodsJsonStr: goodsJsonStr,
      isLogistics: isLogistics,
      totalPrice: totalPrice
    })
  }

})