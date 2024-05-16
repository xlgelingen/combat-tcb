const app = getApp();

Page({
  // 定义好 userInfo 存储用户信息
  data: {
    userInfo: {},
  },
  // 在页面加载时调用 getUserInfo 方法
  onLoad: function() {
    this.getData();
  },
  getData: function() {
    let nickName = app.globalData.nickName;
    let avatarUrl = app.globalData.avatarUrl;
    this.setData({
      userInfo: {nickName,avatarUrl}
    })
  },
})