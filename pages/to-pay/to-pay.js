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
    let shopList = {}
    if (this.data.orderType == 'buyNow') {
      // 立即购买下单
      let buyNowInfoMem = wx.getStorageSync('buyNowInfo')
      if(buyNowInfoMem && buyNowInfoMem.shopList ){
        shopList = buyNowInfoMem.shopList
      }
    }else{
      //购物车下单
      let shopCarInfoMem = wx.getStorageSync('shopCarInfo')
      if(shopCarInfoMem && shopCarInfoMem.length>0){
        shopList = shopCarInfoMem.filter(entity =>{
          return entity.active;
        })
      }
    }
    this.setData({
      goodsList: shopList
    })
    this.total()  //计算总数
  },
  initShippingAddress: function () {
    var that = this;
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/user/shipping-address/default',
      data: {
        token: app.globalData.token
      },
      success: (res) => {
        if (res.data.code == 0) {
          that.setData({
            curAddressData: res.data.data
          });
        } else {
          that.setData({
            curAddressData: null
          });
        }
        that.processYunfei();
      }
    })
  },
  // 选择地址
  selectAdress(){
    wx.navigateTo({
      url: '/pages/add-address/add-address',
    })
  },
  createOrder(e){
    // console.log(e)
    wx.showLoading();
    var that = this;
    var loginToken = app.globalData.token // 用户登录 token
    var remark = ""; // 备注信息
    if (e) {
      remark = e.detail.value.remark; // 备注信息
    }

    var postData = {
      token: loginToken,
      goodsJsonStr: that.data.goodsJsonStr,
      remark: remark
    };
    if (that.data.isNeedLogistics > 0) {
      if (!that.data.curAddressData) {
        wx.hideLoading();
        wx.showModal({
          title: '错误',
          content: '请先设置您的收货地址！',
          showCancel: false
        })
        return;
      }
      postData.provinceId = that.data.curAddressData.provinceId;
      postData.cityId = that.data.curAddressData.cityId;
      if (that.data.curAddressData.districtId) {
        postData.districtId = that.data.curAddressData.districtId;
      }
      postData.address = that.data.curAddressData.address;
      postData.linkMan = that.data.curAddressData.linkMan;
      postData.mobile = that.data.curAddressData.mobile;
      postData.code = that.data.curAddressData.code;
    }
    if (that.data.curCoupon) {
      postData.couponId = that.data.curCoupon.id;
    }
    if (!e) {
      postData.calculate = "true";
    }


    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/order/create',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: postData, // 设置请求的 参数
      success: (res) => {
        wx.hideLoading();
        if (res.data.code != 0) {
          wx.showModal({
            title: '错误',
            content: res.data.msg,
            showCancel: false
          })
          return;
        }

        if (e && "buyNow" != that.data.orderType) {
          // 清空购物车数据
          wx.removeStorageSync('shopCarInfo');
        }
        if (!e) {
          that.setData({
            isNeedLogistics: res.data.data.isNeedLogistics,
            allGoodsPrice: res.data.data.amountTotle,
            allGoodsAndYunPrice: res.data.data.amountLogistics + res.data.data.amountTotle,
            yunPrice: res.data.data.amountLogistics
          });
          that.getMyCoupons();
          return;
        }
        // 配置模板消息推送
        var postJsonString = {};
        postJsonString.keyword1 = { value: res.data.data.dateAdd, color: '#173177' }
        postJsonString.keyword2 = { value: res.data.data.amountReal + '元', color: '#173177' }
        postJsonString.keyword3 = { value: res.data.data.orderNumber, color: '#173177' }
        postJsonString.keyword4 = { value: '订单已关闭', color: '#173177' }
        postJsonString.keyword5 = { value: '您可以重新下单，请在30分钟内完成支付', color: '#173177' }
        app.sendTempleMsg(res.data.data.id, -1,
          'mGVFc31MYNMoR9Z-A9yeVVYLIVGphUVcK2-S2UdZHmg', e.detail.formId,
          'pages/index/index', JSON.stringify(postJsonString));
        postJsonString = {};
        postJsonString.keyword1 = { value: '您的订单已发货，请注意查收', color: '#173177' }
        postJsonString.keyword2 = { value: res.data.data.orderNumber, color: '#173177' }
        postJsonString.keyword3 = { value: res.data.data.dateAdd, color: '#173177' }
        app.sendTempleMsg(res.data.data.id, 2,
          'Arm2aS1rsklRuJSrfz-QVoyUzLVmU2vEMn_HgMxuegw', e.detail.formId,
          'pages/order-details/index?id=' + res.data.data.id, JSON.stringify(postJsonString));
        // 下单成功，跳转到订单管理界面
        wx.redirectTo({
          url: "/pages/order-list/index"
        });
      }
    })

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
      goodsJsonStrTmp += '{"goodsId:"' + goodsList[i].goodsId + '","buyNum":' + goodsList[i].buyNum + ',"propertyChildIds":"' + goodsList[i].propertyChildIds + '"logisticsType":0, "inviter_id":' + inviter_id + '}';
      goodsJsonStr += goodsJsonStrTmp;

    }
    goodsJsonStr += ']'
    // console.log(goodsJsonStr)
    this.setData({
      goodsJsonStr: goodsJsonStr,
      isLogistics: isLogistics,
      totalPrice: totalPrice
    })
    this.createOrder()
  },
  // 增加地址
  addAdress(){
    wx.navigateTo({
      url: '/pages/add-address/add-address'
    })
  }

})