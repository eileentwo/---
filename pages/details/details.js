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
    goodsDetail:[]
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
        console.log(goodsCommen)
        this.setData({
          goodsCommen: goodsCommen
        })
      }
    })
  }
})