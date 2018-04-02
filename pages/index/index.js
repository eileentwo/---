// pages/index/index.js
var app =getApp()
Page({
  data: {
    interval: 5000,
    duration: 1000,
    banners: [],
    swiperCurrent:0,//轮播图当前的index
    searchValue:'',//搜索框内的值
    categories:[],   //种类
    activeCategoryId:0,
    goods:[],  //商品
    loadingMoreHidden:true
  },
  onLoad(){
    wx.setNavigationBarTitle({
      title:wx.getStorageSync('mallName')
    })
    // 加载轮播图数据
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/banner/list',
      data: {
        key: 'mallName'
      },
      success:(res)=>{
        if (res.data.code == 404) {
          wx.showModal({
            title: '提示',
            content: '请在后台添加 banner 轮播图片',
            showCancel: false
          })
        } else {
          this.setData({
            banners:res.data.data
          })
        }
       
      }
    })
    // 加载所有的商品种类数据
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/shop/goods/category/all',
      success:(res)=>{
        // 将所有的商品种类数据都增加到categories中
        const categories = [{id:0,name:'全部'}]
        if(res.data.code == 0){
          for(let i=0; i<res.data.data.length;i++){
            categories.push(res.data.data[i])
          }
        }
        this.setData({
          categories: categories,
          activeCategoryId:0
        })
        this.getGoodList(0)
      }
        
    })
  },
  getGoodList(categoryId) {
    if(categoryId === 0){
      categoryId=''
    } 
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/shop/goods/list',
      data:{//通过传递过来的id或者搜索框内的数据筛选
        categoryId: categoryId,
        nameLike: this.data.searchValue
      },
      success:(res)=>{
        // console.log(res)
        this.setData({
          goods:[],
          loadingMoreHidden: true
        })
        const goods = []
        // 判断数据是否为空，当传递过来的数据为空时进入if环节
        if (res.data.code != 0 || res.data.data.length == 0){
          this.setData({
            loadingMoreHidden: false
          })
          return
        }
        for (let i = 0; i < res.data.data.length;i++){
          goods.push(res.data.data[i])
        }
        this.setData({
          goods:goods
        })
      }
    })
  },
  toDetail(e){
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: '../details/details?id=' +id,
    })
  },
  swiperChange: function (e) {//改变当前的轮播图的index
  // console.log(e.detail.current)
    this.setData({
      swiperCurrent: e.detail.current
    })
  },
  tapBanner(e){
    const { id } = e.currentTarget.dataset;
    if( id == 0){
      return
    }
    wx.navigateTo({
      url: '../details/details?id=' + id,
    })
  },
  tapclick(e){
    console.log(e.target.id)
    this.setData({
      activeCategoryId: e.target.id
    })
    this.getGoodList(this.data.activeCategoryId)
  },
  listenerInput:function(e){
    this.setData({
      searchValue:e.detail.value
    })
  },
  toSearch(){
    this.getGoodList(this.data.activeCategoryId)
  }
}) 