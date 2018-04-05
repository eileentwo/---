// pages/cart/cart.js
Page({
  data: {
    goodsList:{
      list:[],
      curHidden: true,
      totalPrice:0,
      allSelect:true,
      noSelect:false
    }
  },
  onLoad: function () {
    this.onShow();
    // this.totalPrice();
    // this.totalSelect()
  },
  onShow() {
    let shopCartInfo = wx.getStorageSync('shopCartInfo')
    let shopList=[]
    if (shopCartInfo.shopList && shopCartInfo){
      shopList = shopCartInfo.shopList
    }
    this.setGoodsList(shopList, this.totalPrice(), this.totalSelect())
  },
  // 设置商品列表
  setGoodsList(list, totalPrice, allSelect){
    this.setData({
      list: list,
      totalPrice: totalPrice,
      allSelect: allSelect
      // ,
      // curHidden: curHidden,
      // noSelect: noSelect
    })

  },
  totalPrice(){
    let list = this.data.goodsList
    let total=0;
    for (let i=0; i<list.length;i++){
      let curItem = list[i];
      if(curItem.active){
        total += curItem.buyNum * curItem.price
      }
    }
    return total
  },
  // 选择商品
  select(e){
    let index = e.currentTarget.dataset.index
    let list = this.data.goodsList
    if (index !== '' && index != null) {
      list[index].active = !list[index].active
      this.setGoodsList(list, this.totalPrice(), this.totalSelect())
    }
    
  },
  //是否全选
  totalSelect(){
    // console.log(this.data.goodsList)
    let list = this.data.goodsList 
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
  bindAllSelect(){
    
  },
  // 减少数量
  minus(e){
    let index = e.currentTarget.dataset.index
    let list = this.data.goodsList
    if(index !=='' && index !=null){
      if(list[index].buyNum>1){
        list[index].buyNum--;
        this.setData({
          goodsList:list
        })
      }
    }
  },
  // 增加数量
  plus(e){
    let index = e.currentTarget.dataset.index
    let list =this.data.goodsList
    if(index !=='' && index !=null){
      if(list[index].buyNum <10){
        list[index].buyNum++
        this.setData({
          goodsList: list
        })
      }
    }
    
  }
})