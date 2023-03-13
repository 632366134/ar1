// app.js
const { API } = require("./utils/request.js");
const app = getApp();
App({
  globalData: {
    isIPhoneX: false, // 当前设备是否为 iPhone X
  },
  async onLaunch() {
    // await this.getUserInfo();
    this.checkIsIPhoneX()
  },
  checkIsIPhoneX: function () {
    var that = this
    wx.getSystemInfo({
      success: function (res) {
        var safeBottom = res.screenHeight - res.safeArea.bottom
        that.kBottomSafeHeight = safeBottom
        let statusBarHeight= res.statusBarHeight
        //根据安全高度判断
        if (safeBottom ===34 || statusBarHeight >= 44) {
          that.globalData.isIPhoneX = true
          that.isIPhoneX = true
        }
        // // 根据 model 进行判断
        // if (res.model.search('iPhone X') != -1) {
        //   that.globalData.isIPhoneX = true
        //   that.isIPhoneX = true
        // }
        // // 或者根据 screenHeight 进行判断
        // if (res.screenHeight == 812 || res.screenHeight == 896) {
        //   that.isIPhoneX = true
        // }
      }
    })
},
  async getUserInfo() {
    let data = {
      pageNum: "1",
      pagesize: "2",
      projectName: "",
      userCode: "",
    };
    let list = await API.selProjects(data);
    wx.setStorageSync("list", list);
    console.log(list);
  },
  //用户点击右上角分享给好友，要现在分享到好友这个设置menu的两个参数，才可以实现分享到朋友圈
  
});
