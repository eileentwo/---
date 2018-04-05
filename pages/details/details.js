// pages/details/details.js
var app = getApp();
// var WxParse = require('../../wxParse/wxParse.js');
Page({
  data: {
    indicatorDots: true,
    autoplay: true,
    interval: 5000,
    duration: 1000,
    banners: [],
    goodsDetail:[],
    hiddenCurrent:true,
    active: false,

    selectSize: "选择：",
    selectSizePrice: 0,
    shopNum: 0,

    buyNum: 0,
    buyMin: 1,
    buyMax: 0,

    propertyChildIds:'',
    propertyChildNames:'',
    canSubmit: false,  //选中规格尺寸时候是否允许加入购物车
    shopType: 'addCart',//购物类型，加入购物车或立即购买，默认为加入购物车
    shopCarInfo: {}, //购物车信息
    buyNowInfo:{}     //立即购买信息
    
  },
  onLoad: function (options) {
    const { id } = options;
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/shop/goods/detail',
      data:{
        id: id
      },
      success:(res)=>{
        // console.log(res.data.data.content)
        const html = res.data.data.content
        const patt = /<img[^>]+src=['"]([^'"]+)['"]+/g
        const re = /[\u4e00-\u9fa5]+，?[\u4e00-\u9fa5]+/g
        const desText =re.exec(html)[0]
        const imgSrc = [];
        
        html.replace(patt, function ($0, $1) {
          imgSrc.push($1)
        })
        if(imgSrc.length > 5){
          imgSrc.length=5
        }
        this.setData({
          goodsDetail:res.data.data,
          desText: desText,
          imgSrc:imgSrc
        })
        this.getVideoSrc(this.data.goodsDetail.basicInfo.videoId)
        this.reputation(this.data.goodsDetail.basicInfo.id)
      }

    })
  },
  getVideoSrc(videoId){
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/media/video/detail',
      data:{
        videoId: videoId
      },
      success:(res)=>{
        // console.log(res)
        if(res.data.code == 0){
          this.setData({
            videoSrc:res.data.data.fdMp4
          })
        }
      }
    })
  },
  reputation(goodsId){
    wx.request({
      // url: `https://api.it120.cc/tz/shop/goods/detail?id=` + goodsId,
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/shop/goods/reputation',
      data: {
        goodsId: goodsId
      },
      success:(res)=>{
        const goodsCommen = res.data.data || []
        // console.log(goodsCommen)
        this.setData({
          goodsCommen: goodsCommen
        })
      }
    })
  },
  // 去购物车
  goToCart(){
    wx.navigateTo({
      url: '/page/cart/cart'
    })
  },
  //关闭遮罩层
  toHidden(){
    this.setData({
      hiddenCurrent:true
    })
  },
  //打开遮罩层
  toShow(){
    this.setData({
      hiddenCurrent: false
    })
  },
  //判断是加入购物车
  toAddCar(){
    // console.log(this.data.goodsDetail)
    this.setData({
      shopType: 'addCart'
    })
    this.toShow()
  },
  //判断是立即购买
  toBuy() {
    this.setData({
      shopType: 'toBuy'
    })
    this.toShow()
  },
  // 选择商品信息
  toSelect(e){
    // console.log(this.data.goodsDetail.properties)
    const propertyGood = this.data.goodsDetail.properties  //当前商品的详细属性
    const propertyItem = e.currentTarget.dataset.propertyindex   //当前项目所属的索引
    const propertyChildIndex = e.currentTarget.dataset.propertychildindex   //当前项目所属索引下的所有子项目的当前索引
    const propertyChilds = propertyGood[propertyItem].childsCurGoods  //当前项目所属索引下的所有子项目
    
    for (let i = 0; i < propertyChilds.length;i++){
      //取消所有的子项目的选中状态
      propertyChilds[i].active = false  
    }
      //增加所有的子项目的选中状态
    propertyChilds[propertyChildIndex].active = true
    
    //获取所有选中的规格尺寸的数据
    const needNum = propertyGood.length  //当前商品的详细属性的长度
    let propertyNum = 0     //需要的数据的长度
    let propertyChildIds = ''   //需要的数据中每个数据的子项的ID
    let propertyChildNames = '' //需要的数据中每个数据的子项的名称
    let childs=[]   

    for (let i = 0; i < needNum; i++) {
      childs = propertyGood[i].childsCurGoods     //需要的数据中每个数据的子项
      for (let j = 0; j < childs.length; j++) {
        if(childs[j].active){//判断当前选择的信息是哪个 
          propertyNum++;
          propertyChildIds = propertyChildIds + propertyGood[i].id + ":" + childs[j].id +',';
          propertyChildNames = propertyChildNames + propertyGood[i].name + ":" + childs[j].name + ' ';
          
        }
      }
    }
    //判断是否信息选择的完整
    let canSubmit = this.data.canSubmit;
    //当需要选择数据的长度与当前已经选择的长度一致时，说明信息选择完整
    if (needNum == propertyNum){
      canSubmit = true;
    }
    // 当信息完整时计算当前价格
    if(canSubmit){
      wx.request({
        url: 'https://api.it120.cc/' + app.globalData.subDomain + '/shop/goods/price',
        data:{
          goodsId: this.data.goodsDetail.basicInfo.id,
          propertyChildIds: propertyChildIds
        },
        success:(res)=>{
          
          this.setData({
            goodsId: res.data.data.goodsId,   //选择的商品的商品id
            selectSizePrice: res.data.data.price,   //选择的商品的价格
            propertyChildIds: propertyChildIds,   //选择的商品的的子项的id
            propertyChildNames: propertyChildNames,   //选择的商品的的子项的名称
            buyMax: res.data.data.stores,   //选择的商品的库存
            buyNum: (res.data.data.stores > 0) ? 1 : 0   //判断购买的数量是否大于0，如果是，那么就设置默认的购买数量为1，如果不是，那么默认购买数量为0

          })
        }
      })
    }
    //动态变更goodsDetail数据信息
    this.setData({
      goodsDetail:this.data.goodsDetail,
      canSubmit: canSubmit
    })
  },
  // 数量减去
  minusNum(){
    if(this.data.buyNum > this.data.buyMin ){
      let propertyNum = this.data.buyNum;
      propertyNum --;
      this.setData({
        buyNum:propertyNum
      })
    }
    
  },
  // 数量加上
  plusNum(){
    if (this.data.buyMax > this.data.buyNum) {
      let propertyNum = this.data.buyNum;
      propertyNum++;
      this.setData({
        buyNum: propertyNum
      })
    }
  },
  //当是加入购物车时提交
  addCart() {
    // 判断是否有选择商品信息
    if (this.data.goodsDetail.properties && !this.data.canSubmit) {
      if (!this.data.canSubmit) {
        wx.showModal({
          title: '提示',
          content: '请选择商品信息！',
          showCancel: false
        })

      }
      this.toShow();
      return;
    }
    if (this.data.buyNum < 1) {
      wx.showModal({
        title: '提示',
        content: '购买数量不能为0！',
        showCancel: false
      })
      return;
    }
    let shopCartInfo = this.shopCartInfo();
    this.setData({
      shopCartInfo: shopCartInfo,
      shopNum: shopCartInfo.shopNum
    })

    // 写入本地存储
    wx.setStorage({
      key: 'shopCartInfo',
      data: 'shopCartInfo'
    })
    // 关闭弹层
    this.toHidden()
    // 提示信息
    wx.showModal({
      title: '加入购物车成功',
      icon: 'success',
      duration: 2000
    })
  },
  // 组建购物车信息
  shopCartInfo(){
    const basicInfo = this.data.goodsDetail.basicInfo
    let shopMap = {};
    // 获取数据的相关信息
    shopMap.goodsId = basicInfo.id;
    shopMap.pic = basicInfo.pic;
    shopMap.name = basicInfo.name;
    shopMap.logisticsType = basicInfo.logisticsId;
    shopMap.weight = basicInfo.weight;
    shopMap.logistics = this.data.goodsDetail.logistics;

    shopMap.price = this.data.selectSizePrice;
    shopMap.curChildIds = this.data.curChildIds;
    shopMap.curChildNames = this.data.curChildNames;
    shopMap.left = '';
    shopMap.active = true;
    shopMap.buyNum = this.data.buyNum;


    let shopCarInfo = this.data.shopCarInfo

    if (!shopCarInfo.shopNum){
      shopCarInfo.shopNum=0
    }
    if (!shopCarInfo.shopList){
      shopCarInfo.shopList=[]
    }
    let hasSameGoodsIndex =-1
    for (let i = 0; i < shopCarInfo.shopList.length;i++){
      let tmpShopMap = shopCarInfo.shopList[i]
      if (tmpShopMap.goodsId == shopMap.goodsId && tmpShopMap.propertyChildIds == shopMap.propertyChildIds ){
        hasSameGoodsIndex = i;
        shopMap.number += tmpShopMap.number;
        break;
      }
    }
    shopCarInfo.shopNum += this.data.buyNum
    if (hasSameGoodsIndex > -1) {
      shopCarInfo.shopList.splice(hasSameGoodsIndex, 1, shopMap);
    }else{
      shopCarInfo.shopList.push(shopMap);
    }
    
    return shopCarInfo;
  },
  //当是立即购买时提交
  buyNow() {

    // 判断是否有选择商品信息
    if (this.data.goodsDetail.properties && !this.data.canSubmit) {
      if (!this.data.canSubmit) {
        wx.showModal({
          title: '提示',
          content: '请选择商品信息！',
          showCancel: false
        })

      }
      this.toShow();
      return;
    }
    if (this.data.buyNum < 1) {
      wx.showModal({
        title: '提示',
        content: '购买数量不能为0！',
        showCancel: false
      })
      return;
    }
    // this.isChoose()
    let buyNowInfo = this.buyNowInfo()
    // 写入本地存储
    wx.setStorage({
      key: 'buyNowInfo',
      data: 'buyNowInfo'
    })
    this.toHidden()
    wx.navigateTo({
      url: "/pages/to-pay/to-pay?orderType=buyNow"
    })
  },
  // 组建立即购买信息
  buyNowInfo() {

    const basicInfo = this.data.goodsDetail.basicInfo
    let shopMap = {};
    // 获取数据的相关信息
    shopMap.goodsId = basicInfo.id;
    shopMap.pic = basicInfo.pic;
    shopMap.name = basicInfo.name;
    shopMap.logisticsType = basicInfo.logisticsId;
    shopMap.weight = basicInfo.weight;
    shopMap.logistics = this.data.goodsDetail.logistics;

    shopMap.price = this.data.selectSizePrice;
    shopMap.curChildIds = this.data.curChildIds;
    shopMap.curChildNames = this.data.curChildNames;
    shopMap.left = '';
    shopMap.active = true;
    shopMap.buyNum = this.data.buyNum;

    let buyNowInfo ={}
    if(!buyNowInfo.shopNum){
      buyNowInfo.shopNum=0
    }
    if (!buyNowInfo.shopList) {
      buyNowInfo.shopList = []
    }
    buyNowInfo.shopList.push(this.data.shopMap)
    return buyNowInfo
  }
})