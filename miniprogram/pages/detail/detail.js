const app = getApp();
const db = wx.cloud.database()
import { formatTime } from '../../utils/utils';
Page({
  data: {
    id: '',
    topic: {},
    userInfo: {},
    fullScreen: false,
    message: '',
    replies: []
  },
  onLoad: function (options) {
    this.getTopics(options.id);
    this.getUserInfo();
    this.getReplies(options.id);
  },
  onShow() {
    this.getUserInfo();
  },
  getTopics: function (id) {
    db.collection('topic').doc(id).get({
      success: (res) => {
        let topic = res.data;
        console.log('topic', topic)
        this.setData({ topic, id })
      }
    })
  },
  getUserInfo: function () {
    let userInfo = app.globalData.userInfo;
    if (userInfo.nickName) {
      this.setData({
        logged: true,
        userInfo: userInfo,
        // nickName: app.globalData.nickName,
        // avatarUrl: app.globalData.avatarUrl
      })
    }
  },
  getReplies: function (id) {
    db.collection('reply').orderBy('createTime', 'desc').where({
      topic_id: id
    }).get({
      success: (res) => {
        let replies = res.data;
        this.setData({ replies, id })
        console.log('getReplies', this.data.replies)
      }
    })
  },
  handleLogin: function () {
    wx.navigateTo({
      url: '../login/login'
    })
  },
  handlePreviewImage: function (e) {
    let url = e.currentTarget.dataset.url;
    wx.previewImage({
      current: url,
      urls: [url]
    })
  },
  handlePreviewVideo: function (e) {
    let id = e.currentTarget.dataset.id;
    let videoCtx = wx.createVideoContext(id);
    let fullScreen = this.data.fullScreen;
    if (fullScreen) {
      videoCtx.pause();
      videoCtx.exitFullScreen();
      this.setData({ fullScreen: false })
    } else {
      videoCtx.requestFullScreen();
      videoCtx.play();
      this.setData({ fullScreen: true })
    }
  },
  handleSubmit(e) {
    const nickName = app.globalData.nickName ? app.globalData.nickName : app.globalData.userInfo.nickName;
    const avatarUrl = app.globalData.avatarUrl;
    let userInfo = { ...app.globalData.userInfo, nickName, avatarUrl };
    let content = this.data.message;
    let topic_id = this.data.id;
    let replies = this.data.replies;
    let date = new Date();
    let date_display = formatTime(date);
    let createTime = db.serverDate();
    // console.log('评论/userInfo', userInfo)
    // console.log('评论/content', content)
    // console.log('评论/topic_id', topic_id)
    // console.log('评论/replies', replies)
    // console.log('评论/date_display', date_display)
    // console.log('评论/createTime', createTime)
    if (!content) {
      wx.showToast({ title: '评论不能为空', icon: 'none' })
      return
    }
    wx.showLoading({
      title: '上传中',
      mask: true
    });
    db.collection('reply').add({
      data: {
        userInfo, content, topic_id, createTime, date_display,
      },
      success: (res) => {
        wx.showToast({ title: '评论成功' })
        replies.unshift({ content, userInfo, date_display, topic_id, createTime });
        this.setData({ replies, message: '' });
        // 在新增评论成功后调用递增方法
        this.incReply(topic_id);
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '新增记录失败'
        })
        console.error('[数据库] [新增记录] 失败：', err)
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  },
  incReply(topic_id) {
    wx.cloud.callFunction({
      name: 'incReply',
      data: {
        topic_id: topic_id
      },
      success: res => {
        console.log('[云函数] [addReply] user openid: ', res.result)
      },
      fail: err => {
        console.error('[云函数] [addReply] 调用失败', err)
      }
    })
  }
})
