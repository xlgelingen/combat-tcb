const db = wx.cloud.database()
// 引用全局对象 app
const app = getApp();
Page({
  data: {
    fullScreen: false,
    topics: [],
    loadedTopicsCount: 0,
    perLoadCount: 10,
  },
  onShow: function () {
    this.getTopics()
  },
  getTopics: function (cb) {
    const { loadedTopicsCount, perLoadCount } = this.data;
    // 加上 where 条件判断，传入筛选条件 openid
    db.collection('topic').orderBy('createTime', 'desc').where({
      _openid: app.globalData.openid,
    }).skip(loadedTopicsCount)
      .limit(perLoadCount).get({
        success: res => {
          let topics = res.data;
          console.log('[数据库] [查询记录] 成功: ', topics)
          const newLoadedTopicsCount = loadedTopicsCount + topics.length;
          this.setData({
            topics: this.data.topics.concat(topics),
            loadedTopicsCount: newLoadedTopicsCount,
          });
          typeof cb === 'function' && cb();
        },
        fail: err => {
          wx.showToast({
            icon: 'none',
            title: '查询记录失败'
          })
          console.error('[数据库] [查询记录] 失败：', err)
        }
      })
  },
  onPullDownRefresh: function () {
    this.setData({
      loadedTopicsCount: 0,
      topics: []
    });
    this.getTopics(() => {
      wx.stopPullDownRefresh();
    });
  },
  onReachBottom: function () {
    wx.showLoading({
      title: '',
    });
    setTimeout(() => {
      this.getTopics();
      wx.hideLoading();
    }, 500);
  },
})
