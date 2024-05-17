import { formatTime } from '../../utils/utils';
const app = getApp();
const db = wx.cloud.database()

Page({
  // 定义好 userInfo 存储用户信息
  data: {
    userInfo: {},
    uploadShow: true,
    imageUrl: [],
    videoUrl: [],
    mediaNum: 0,
    content: ''
  },
  onLoad: function () {
    this.getData();
  },
  getData: function () {
    let nickName = app.globalData.nickName ? app.globalData.nickName : app.globalData.userInfo.nickName;
    let avatarUrl = app.globalData.avatarUrl;
    this.setData({
      userInfo: { nickName, avatarUrl }
    })
    // console.log('getData/userInfo', this.data.userInfo)
  },
  handleChange(e) {
    const content = e.detail.value;
    this.setData({
      content: content
    })
  },
  handleUpload: function () {
    let itemList = ['图片', '视频'];
    let itemListType = ['image', 'video'];
    // console.log('this', this)
    // 唤起 showActionSheet 更具选择调用拍照或者摄像功能
    // 并在选择资源成功之后把资源地址传给 uploadFile 方法
    wx.showActionSheet({
      itemList: itemList,
      success: (res) => {
        console.log('res.tapIndex', res.tapIndex)
        let type = itemListType[res.tapIndex];
        console.log('type', type)
        if (type === 'image') {
          console.log("上传image")
          wx.chooseMedia({
            count: 1,
            mediaType: 'image',
            sizeType: ['compressed'],
            sourceType: ['album', 'camera'],
            success: (res) => {
              let filePath = res.tempFiles[0].tempFilePath;
              console.log('上传/filePath', filePath)
              this.uploadFile(type, filePath)
              this.updateMediaNum();
            }
          })
        } else {
          console.log("上传video")
          wx.chooseMedia({
            count: 1,
            mediaType: 'video',
            sourceType: ['album', 'camera'],
            maxDuration: 15,
            camera: 'back',
            success: (res) => {
              let filePath = res.tempFiles[0].tempFilePath;
              console.log('上传/filePath', filePath)
              this.uploadFile(type, filePath)
              this.updateMediaNum();
            }
          })
        }
      }
    })
  },
  uploadFile: function (type, filePath) {
    console.log('uploadFile', type)
    let openid = app.globalData.openid;
    let timestamp = Date.now();
    let postfix = filePath.match(/\.[^.]+?$/)[0];
    // 根据 open_id 和时间戳拼接出文件名
    let cloudPath = `${openid}_${timestamp}${postfix}`;
    // console.log('postfix', postfix)
    // console.log('cloudPath', cloudPath)
    wx.showLoading({
      title: '上传中',
      mask: true
    });
    // 使用 wx.cloud.uploadFile 上传文件到云开发的存储管理内
    wx.cloud.uploadFile({
      cloudPath,
      filePath,
      success: (res) => {
        if (type === 'image') {
          let imageUrl = [...this.data.imageUrl];
          imageUrl.push(res.fileID)
          this.setData({
            imageUrl: imageUrl
          })
          console.log('上传/res.fileID', res.fileID)
          console.log('上传/imageUrl', this.data.imageUrl)
        } else {
          let videoUrl = [...this.data.videoUrl];
          videoUrl.push(res.fileID)
          this.setData({ videoUrl })
          console.log('上传/res.fileID', res.fileID)
          console.log('上传/videoUrl', this.data.videoUrl)
        }
      },
      fail: (e) => {
        wx.showToast({
          icon: 'none',
          title: '上传失败',
        })
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  },
  updateMediaNum: function () {
    let mediaNum = this.data.imageUrl.length + this.data.videoUrl.length + 1
    console.log('mediaNum', mediaNum)
    if (mediaNum >= 3) {
      this.setData({
        uploadShow: false
      })
    }
  },
  handleSubmit: function () {
    let date = new Date();
    let date_display = formatTime(date);
    let createTime = db.serverDate();
    let content = this.data.content;
    let imageUrl = this.data.imageUrl;
    let videoUrl = this.data.videoUrl;
    const nickName = app.globalData.nickName ? app.globalData.nickName : app.globalData.userInfo.nickName;
    const avatarUrl = app.globalData.avatarUrl;
    let userInfo = { ...app.globalData.userInfo, nickName, avatarUrl };
    console.log('发布/userInfo', userInfo)
    console.log('发布/content', content)
    console.log('发布/imageUrl', imageUrl)
    console.log('发布/videoUrl', videoUrl)
    console.log('发布/date_display', date_display)
    console.log('发布/createTime', createTime)
    if (!content && !imageUrl.length && !videoUrl.length) {
      wx.showToast({
        icon: 'none',
        title: '请输入内容',
      })
      return
    }
    wx.showLoading({
      title: '上传中',
      mask: true
    });
    db.collection('topic').add({
      data: {
        content, userInfo, createTime, date_display, imageUrl, videoUrl
      },
      success: (res) => {
        console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
        let url = '/pages/detail/detail?id=' + res._id;
        wx.redirectTo({ url })
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '新增记录失败'
        })
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  }
})