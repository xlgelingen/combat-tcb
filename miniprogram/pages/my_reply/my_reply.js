const app = getApp();
const db = wx.cloud.database()
Page({
  data: {
    replies: [],
    loadedRepliesCount: 0,
    perLoadCount: 15,
  },
  onShow: function () {
    this.getReplies();
  },
  getReplies: function () {
    const { loadedRepliesCount, perLoadCount } = this.data;
    db.collection('reply').orderBy('createTime', 'desc').where({
      _openid: app.globalData.openid,
    }).skip(loadedRepliesCount)
      .limit(perLoadCount).get({
        success: (res) => {
          let replies = res.data;
          console.log('[数据库] [查询记录] 成功: ', replies)
          const newloadedRepliesCount = loadedRepliesCount + replies.length;
          this.setData({
            replies: this.data.replies.concat(replies),
            loadedRepliesCount: newloadedRepliesCount,
          });
        }
      })
  },
  onPullDownRefresh: function () {
    this.setData({
      loadedRepliesCount: 0,
      replies: []
    });
    this.getReplies(() => {
      wx.stopPullDownRefresh();
    });
  },
  onReachBottom: function () {
    wx.showLoading({
      title: '',
    });
    setTimeout(() => {
      this.getReplies();
      wx.hideLoading();
    }, 500);
  },
})
