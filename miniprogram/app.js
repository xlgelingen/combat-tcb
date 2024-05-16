App({
  globalData: {
    userInfo: {},
    openid: '',
    nickName: '',
    avatarUrl: './images/people.png',
  },
  onLaunch: function () {
    this.cloudInit();
    this.getUserInfo();
  },
  // cloudInit 初始化云开发配置
  cloudInit: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      // 调用 wx.cloud.init 传入 traceUser 为 true 代表记录用户到后台中。
      wx.cloud.init({
        traceUser: true
      })
    }
  },
  // getUserInfo 获取用户信息
  getUserInfo: function (cb) {
    wx.getSetting({
      success: res => {
        console.log('getSetting',res.authSetting)
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success: res => {
              console.log('getUserInfo',res.userInfo)
              this.getOpenid();
              this.globalData.userInfo = res.userInfo;
              //检查传入的回调函数 cb 是否为函数类型，如果是函数，则调用它，并将获取到的用户信息 res 作为参数传递给它。
              typeof cb === 'function' && cb(res);
            }
          })
        } else {
          console.log('用户未授权');
        }
      }
    })
  },
  // getOpenid 方法从云函数中获取 openid
  getOpenid: function () {
    wx.showLoading({
      title: '',
    });
    wx.cloud.callFunction({
      name: 'quickstartFunctions',
      data: {
        type: 'getOpenId',
      },
      success: res => {
        console.log('[getOpenId]user openid: ', res.result.openid)
        this.globalData.openid = res.result.openid;
        wx.hideLoading();
      },
      fail: err => {
        console.error('[getOpenId] 调用失败', err)
        wx.hideLoading();
      }
    })
  },
})
