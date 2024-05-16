const app = getApp();

Page({
  // 定义好 userInfo 存储用户信息
  data: {
    logged: false,
    nickName: '',
    avatarUrl: '../../images/people.png',
    userInfo: {},
  },
  // 在页面加载时调用 getUserInfo 方法
  onLoad: function() {
    this.getUserInfo();
  },
  // 获取全局对象中的 app.globalData.userInfo
  getUserInfo: function() {
    let userInfo = app.globalData.userInfo;
    console.log('getUserInfo',userInfo)
    if(userInfo.nickName){
      this.setData({
        logged: true,
        userInfo: userInfo
      })
    }
  },
  onChooseAvatar(e) {
    console.log('onChooseAvatar',e.detail)
    const { avatarUrl } = e.detail 
    this.setData({
      avatarUrl,
    })
  },
  onGetUserInfo: function(e) {
    console.log('onGetUserInfo',e.detail.userInfo)
    if (e.detail.userInfo) {
      app.getUserInfo((res)=>{
        this.setData({
          userInfo: res.userInfo
        })
      })
    }
  }
})