// componments/history/history.js
const publicFn = require("../../utils/public");
const app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
  },

  /**
   * 组件的初始数据
   */
  data: {
    title: "历史记录",
    isMask: false,
    borchureDetail: {},
    animationSelected: {},
    animationNoSelected: {},
    currentBannerIndex: 0,
    isIPhoneX: app.isIPhoneX,
    historyList: [],
    collect:{}
  },
//   observers: {
//     historyList: function (historyList) {
//       this.setData({
//         list: historyList,
//       });
//     },
//   },
  lifetimes: {
   async ready() {
        let historyList = await wx.getStorageSync("historyList");
        let collect = await wx.getStorageSync("collect");

    this.setData({  historyList ,collect});
    publicFn.LoadingOff();

      this.enlarge();
      this.shrink();
    },
  },
  /**
   * 组件的方法列表
   */
  methods: {
    handleChangeBanner(e) {
      this.setData({
        currentBannerIndex: e.detail.current,
      });
      console.log(this.data.currentBannerIndex);
      this.enlarge();
      this.shrink();
    },
    enlarge() {
      console.log("enlarge");

      let animationSelected = wx.createAnimation({
        duration: 500,
        timingFunction: "ease",
      });
      animationSelected.scale(1, 1).step();
      this.setData({
        animationSelected: animationSelected.export(),
      });
    },
    shrink() {
      console.log("shrink");
      let animationNoSelected = wx.createAnimation({
        duration: 500,
        timingFunction: "ease",
      });
      animationNoSelected.scale(0.95, 0.95).step();
      this.setData({
        animationNoSelected: animationNoSelected.export(),
      });
    },

    gopriview({ currentTarget }) {
      console.log(currentTarget);
      this.setData({
        isMask: true,
        borchureDetail: currentTarget.dataset.item,
      });
    },
    changeMask() {
      this.setData({
        isMask: false,
      });
    },
  },
});
