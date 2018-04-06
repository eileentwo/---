// pages/cart/cart.js
Page({
  data: {
    goodsList:{
      list:[],
      curHidden: false,
      totalPrice:0,
      allSelect:true,
      noSelect:false
    }
  },
  onLoad: function () {
    this.onShow();
  },
  onShow() {
    let shopCartInfo = wx.getStorageSync('shopCartInfo')
    let shopList=[]
    if (shopCartInfo.shopList && shopCartInfo){
      shopList = shopCartInfo.shopList
      this.setGoodsList(shopList, this.totalPrice(), this.totalSelect(), this.hidden(),this.noSelect())
    }
  },
  // 设置商品列表
  setGoodsList(list, totalPrice, allSelect, curHidden,noSelect){
    this.setData({
      goodsList: {
        list: list,
        totalPrice: totalPrice,
        allSelect: allSelect,
        curHidden: curHidden,
        noSelect: noSelect
      }
    })
    // 设置数据缓存
    let shopCartInfo = {}
    let tempNum =0
    shopCartInfo.shopList=list
    for(let i=0; i<list.length; i++ ){
      tempNum + list[i].buyNum
    }
    shopCartInfo.shopNum = tempNum
    wx.setStorage({
      key: 'shopCartInfo',
      data: shopCartInfo
    })
  },
  hidden(){
    let curHidden = this.data.goodsList.curHidden
    return curHidden
  },
  edit() {
    let list = this.data.goodsList.list
    for(let  i=0; i<list.length;i++ ){
      list[i].active = false
    }
    this.setGoodsList(list, this.totalPrice(), this.totalSelect(), !this.hidden(), this.noSelect())
  },
  save() {
    let list = this.data.goodsList.list
    for (let i = 0; i < list.length; i++) {
      list[i].active = true
    }
    this.setGoodsList(list, this.totalPrice(), this.totalSelect(), !this.hidden(), this.noSelect())
  },
  totalPrice(){

    let goodsList = this.data.goodsList
    let total=0;
    for (let i = 0; i <goodsList.list.length;i++){
      let curItem = goodsList.list[i];
      if(curItem.active){
        total += curItem.buyNum * parseFloat(curItem.price)
      }
    }
    total = parseFloat(total.toFixed(2));//js浮点计算bug，取两位小数精度
    return total
  },
  // 选择商品
  select(e){
    let index = e.currentTarget.dataset.index
    let list = this.data.goodsList.list
    if (index !== '' && index != null) {
      list[index].active = !list[index].active
      this.setGoodsList(list, this.totalPrice(), this.totalSelect(), this.hidden(), this.noSelect())
    }
    
  },
  //是否全选
  totalSelect(){
    // console.log(this.data.goodsList)
    let list = this.data.goodsList.list 
    let allSelect=false
    for (let i = 0; i < list.length;i++){
      if (list[i].active){
        allSelect = true;
      }else{
        allSelect = false;
        break;
      }
    }
    return allSelect
  },
  bindAllSelect() {
    let list = this.data.goodsList.list
    let curSelect = this.data.goodsList.allSelect
    if(curSelect){
      for(let i=0; i<list.length;i++){
        list[i].active = false
      }
    }else{
      for (let i = 0; i < list.length; i++) {
        list[i].active = true
      }
    }
    this.setGoodsList(list, this.totalPrice(), this.totalSelect(), this.hidden(), this.noSelect())
  },
  // 全不选
  noSelect(){
    let list = this.data.goodsList.list
    let noSelect = false
    console.log()
    for (let i = 0; i < list.length; i++) {
      if (!list[i].active) {
        noSelect = false;
      } else {
        noSelect = true;
        break;
      }
    }
    return noSelect
  },
  // 减少数量
  minus(e){
    let index = e.currentTarget.dataset.index
    let list = this.data.goodsList.list
    if(index !=='' && index !=null){
      if (list[index].buyNum>1){
        list[index].buyNum--;
        this.setGoodsList(list, this.totalPrice(), this.totalSelect(), this.hidden(), this.noSelect())
      }
    }
  },
  // 增加数量
  plus(e){
    let index = e.currentTarget.dataset.index
    let list = this.data.goodsList.list
    if(index !=='' && index !=null){
      if (list[index].buyNum <10){
        list[index].buyNum++;
        this.setGoodsList(list, this.totalPrice(), this.totalSelect(), this.hidden(), this.noSelect())
      }
    }
    
  },
  // 删除购物车商品
  delete(){
    let list = this.data.goodsList.list
    list = list.filter(function (curItem) {
      return !curItem.active;
    })
    this.setGoodsList(list, this.totalPrice(), this.totalSelect(), this.hidden(), this.noSelect())

  },
  // 支付
  toPay(){

  }
})