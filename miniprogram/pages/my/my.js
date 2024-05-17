const app = getApp();
Page({
  data: {
    logged: false,
    nickName: '',
    avatarUrl: '../../images/people.png',
    userInfo: {},
  },
  onShow: function () {
    this.getUserInfo();
  },
  // 获取全局对象中的 app.globalData.userInfo
  getUserInfo: function () {
    let userInfo = app.globalData.userInfo;
    // console.log('getUserInfo',userInfo)
    if (userInfo.nickName) {
      this.setData({
        logged: true,
        userInfo: userInfo,
        nickName:app.globalData.nickName,
        avatarUrl: app.globalData.avatarUrl
      })
    } 
  },
  handleLogin: function () { 
    wx.navigateTo({
      url: '../login/login'
    })
  },
})