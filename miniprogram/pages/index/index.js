const db = wx.cloud.database()
Page({
  data: {
    fullScreen: false,
    topics: []
  },
  onShow: function () {
    this.getTopics()
  },
  getTopics: function (cb) {
    db.collection('topic').orderBy('createTime', 'desc').get({
      success: res => {
        let topics = res.data;
        console.log('[数据库] [查询记录] 成功: ')
        this.setData({
          topics: topics
        })
        console.log('topics', this.data.topics)
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
  handlePreviewImage(e) {
    let url = e.currentTarget.dataset.url;
    wx.previewImage({
      current: url,
      urls: [url]
    })
  },
  handlePreviewVideo(e) {
    console.log('e',e)
    let id = e.currentTarget.dataset.id;
    console.log('id',id)
    let videoCtx = wx.createVideoContext(id);
    console.log('videoCtx',videoCtx)
    let fullScreen = this.data.fullScreen;
    console.log('fullScreen',fullScreen)
    if (fullScreen) {
      videoCtx.pause();
      videoCtx.exitFullScreen();
      this.setData({ fullScreen: false })
    } else {
      //全屏效果的测试，需要使用真实手机才能测试
      videoCtx.requestFullScreen();
      videoCtx.play();
      this.setData({ fullScreen: true })
    }
  },
  onPullDownRefresh: function() {
    this.getTopics(()=>{
      wx.stopPullDownRefresh()
    })
  }
})