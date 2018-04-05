// pages/add-address/add-address.js
let commonCityData = require('../../utils/city.js')
let app = getApp()

Page({
  data: {
    provinces: [],
    citys: [],
    districts: [],
    selProvince: '请选择',
    selCity: '请选择',
    selDistrict: '请选择',
    selProvinceIndex:0,
    selCityIndex:0,
    selDistrictIndex:0
  },
  // 初始化城市数据
  initCityData(level, obj) {
    if (level == 1) {
      let provinceArry = []
      // console.log(commonCityData.cityData)
      for (let i = 0; i < commonCityData.cityData.length; i++) {
        provinceArry.push(commonCityData.cityData[i].name)
      }
      this.setData({
        provinces: provinceArry
      })
    }else if(level ==2 ){
      let cityArry = []
      let dataArry = obj.cityList
      for (let i = 0; i < dataArry.length; i++){
        cityArry.push(dataArry[i].name)
      }
      this.setData({
        citys: cityArry
      })
    }else if(level == 3){
      let districtArry = []
      let dataArry = obj.districtList
      for (let i = 0; i < dataArry.length; i++) {
        districtArry.push(dataArry[i].name)
      }
      this.setData({
        districts: districtArry
      })
    }
  },
  onLoad: function (options) {
    // 将地址数据初使化
    this.initCityData(1)
    let id = options.id
    if(id){
      // 初始化原数据
      wx.showLoading()
      wx.request({
        url: 'https://api.it120.cc/' + app.globalData.subDomain + '/user/shipping-address/detail',
        data:{
          token:app.globalData.token,
          id:id
        },
        success:(res)=>{
          wx.hideLoading()
          if(res.data.code==0){
            this.setData({
              id:id,
              addressData:res.data.data,
              selProvince:res.data.data.provinceStr,
              selCity: res.data.data.cityStr,
              selDistrict: res.data.data.areaStr
            })
            this.saveDBSaveAddressId(res.data.data);
            return; 
          }
          else {
            wx.showModal({
              title: '提示',
              content: '无法获取快递地址数据'
            })
          }
        }
      })
    }
  },
  // 保存信息
  bindSave(e) {
    // console.log(e)
    let linkMan = e.detail.value.linkMan
    let address = e.detail.value.address
    let mobile = e.detail.value.mobile
    let code = e.detail.value.code
    if(linkMan == ''){
      wx.showModal({
        title: '提示',
        content: '请输入名字',
        showCancel:false
      })
      return
    }
    if (address == '') {
      wx.showModal({
        title: '提示',
        content: '请输入地址',
        showCancel: false
      })
      return
    }
    if (mobile == '') {
      wx.showModal({
        title: '提示',
        content: '请输入手机号码',
        showCancel: false
      })
      return
    }
    if (code == '') {
      wx.showModal({
        title: '提示',
        content: '请输入邮编',
        showCancel: false
      })
      return
    }
    if (this.data.selProvince == '请选择' || this.data.selCity == '请选择') {
      wx.showModal({
        title: '提示',
        content: '请选择地区',
        showCancel: false
      })
      return
    }
    const cityId = commonCityData.cityData[this.data.selProvinceIndex].cityList[this.data.selCityIndex].id
    let districtId;
    if (!this.data.selDistrict || this.data.selDistrict == '请选择' ){
      districtId='';
    }else{
      districtId = commonCityData.cityData[this.data.selProvinceIndex].cityList[this.data.selCityIndex].districtList[this.data.selDistrictIndex].id
    }
    if(address ==''){
      wx.showModal({
        title: '提示',
        content: '请填写详细地址',
        showCancel: false
      })
      return
    }

    let apiAddoRuPDATE = "add";
    let apiAddid = this.data.id;
    if (apiAddid) {
      apiAddoRuPDATE = "update";
    } else {
      apiAddid = 0;
    }

    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/user/shipping-address/' + apiAddoRuPDATE,
      data:{
        token: app.globalData.token,
        cityId: cityId,
        districtId: districtId,
        linkMan: linkMan,
        address: address,
        mobile: mobile,
        code: code,
        isDefault: 'true'
      },
      success:(res)=>{
        if(res.data.code != 0){
          wx.showModal({
            title: '失败',
            content: res.data.msg,
            showCancel:false
          })

        }
        //跳回上一页面
        wx.navigateBack({})
      }
    })

  },
  // 取消返回
  bindCancel(){
    wx.navigateBack({})
  },
  // 删除地址
  deleteAddress(e){
    let id = e.currentTarget.dataset.id
    wx.showModal({
      title: '提示',
      content: '是否确定删除该地址',
      success:(res)=>{
        if(res.confirm){
          wx.request({
            url: 'https://api.it120.cc/' + app.globalData.subDomain + '/user/shipping-address/delete',
            data:{
              token: app.globalData.token,
              id:id
            },
            success:(res)=>{
              wx.navigateBack({})
            }
          })
        }else if(res.cancel){
          console.log('用户点击取消')
        }
      }
    })
  },
  // 设置地址的id
  saveDBSaveAddressId(data){  
    let retSelId= 0;
    for (let i = 0; i < commonCityData.cityData.length; i++ ){  //从数据中获取省份
      if (data.provinceId == commonCityData.cityData[i].id ){  //判断当前的省份与数据中的省份相同的省份
        this.data.selProvinceIndex = i;
        for (let j = 0; j < commonCityData.cityData[i].cityList.length; j++) {  //从数据中获取城市
          if (data.cityId == commonCityData.cityData[i].cityList[j].id) {  //判断当前的城市与数据中的城市相同的城市
            this.data.selCityIndex = j;
            for (let k = 0; k < commonCityData.cityData[i].cityList[j].districtList.length; k++) {  //从数据中获取街道
              if (data.districtId == commonCityData.cityData[i].cityList[j].districtList[k].id) {  //判断当前的街道与数据中的街道相同的街道
                this.data.selDistrictIndex = k;
              }
            }
          }
        }
      }
    }
  },
  // 从微信中读取
  readFromWx(){
    wx.chooseAddress({
      success:(res)=>{
        let provinceName = res.provinceName
        let cityName = res.cityName
        let districtName = res.countyName
        let retSelIdx =0

        for (let i = 0; i < commonCityData.cityData.length; i++) {

          if (provinceName == commonCityData.cityData[i].name){
            let eventJ = { detail: { value: i}}
            this.bindPickerProvinceChange(eventJ);
            this.data.selProvinceIndex = i;

            for (let j = 0; j < commonCityData.cityData[i].cityList.length; j++) {

              if (cityName == commonCityData.cityData[i].cityList[j].name){

                let eventJ = { detail: { value: j } }
                this.bindPickerCityChange(eventJ);
                this.data.selCityIndex =j;

                for (let k = 0; k < commonCityData.cityData[i].cityList[j].districtList.length; k++){
                  
                  if (districtName == commonCityData.cityData[i].cityList[j].districtList[k].name) {
                    let eventJ = { detail: { value: k } }
                    this.bindPickerDistrictChange(eventJ);
                  }
                }
              }
            }
          }
        }

        this.setData({
          wxaddress:res
        })
      }
    })

  },
  // 监听选择省份
  bindPickerProvinceChange(e){
    let selItem = commonCityData.cityData[e.detail.value]
    this.setData({
      selProvince:selItem.name,
      selProvinceIndex: e.detail.value,
      selCity: '请选择',
      selCityIndex:0,
      // selDistrict: selItem.cityList[0].districtList[0].name,
      selDistrict: '请选择',
      selDistrictIndex: 0
    })
    this.initCityData(2,selItem)
  },
  // 监听选择城市
  bindPickerCityChange(e) {
    let selItem = commonCityData.cityData[this.data.selProvinceIndex].cityList[e.detail.value];
    this.setData({
      selCity: selItem.name,
      selCityIndex: e.detail.value,
      selDistrict: selItem.districtList[0].name,
      selDistrictIndex: 0
      
    })
    this.initCityData(3, selItem)
  },
  // 监听选择区县
  bindPickerDistrictChange(e) {
    let selItem = commonCityData.cityData[this.data.selProvinceIndex].cityList[this.data.selCityIndex].districtList[e.detail.value];
    if (selItem && selItem.name && e.detail.value){
      this.setData({
        selDistrict: selItem.name,
        selDistrictIndex: e.detail.value
      })
    }
  }

})