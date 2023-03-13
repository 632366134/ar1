// index.js
const { API } = require("../../utils/request.js");
import { goTo } from "../../utils/navigate";
const publicFn = require("../../utils/public");
const NEAR = 0.001;
const FAR = 1000;
const app = getApp();
let eventChannel;
Page({
    onShareAppMessage: function () {
      wx.showShareMenu({
        withShareTicket: true,
        menu: ["shareAppMessage", "shareTimeline"],

      });
    },
    
          //用户点击右上角分享朋友圈
          onShareTimeline:function(){
            return {
              title:'',
              query:{
                key:''
              },
              imageUrl:''
            }
          },
  data: {
    theme: "light",
    isIPhoneX: app.isIPhoneX,
    list: [],
    compList: [],
    compList1: [],
    compList2: [],
    compList3: [],
    collectUrl: "/images/index/add.png",
    isCollect: false,
    collect: [],
    isMask: false,
    borchureDetail: {},
    isShowScan: true,
    active:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onUnload() {
    console.log("页面detached");
    if (wx.offThemeChange) {
      wx.offThemeChange();
    }
  },
  async onReady() {
    publicFn.LoadingOff();
    console.log("页面准备完全");

    this.setData({
      theme: wx.getSystemInfoSync().theme || "light",
    });

    if (wx.onThemeChange) {
      wx.onThemeChange(({ theme }) => {
        this.setData({ theme });
      });
    }

    let list = await API.selProjects();
    await wx.setStorageSync("list", list);
    let collect = wx.getStorageSync("collect");
    if (collect) {
      let { projectCode } = collect;
      collect = list.find((v) => {
        v.projectCode === projectCode;
      });
      if (list) {
        wx.setStorageSync("collect", collect);
      }
    }
    publicFn.LoadingOff();
    list = list.filter((element) => {
      return (
        element.memberType > 2 && element.projectCode != "312330376891027456"
      );
    });
    let compList = list.filter((element) => {
      return element.memberType == 3;
    });
    let compList1 = compList.filter(i=> i.classify ==2)
    let compList2 = compList.filter(i=> i.classify ==3)
    let compList3 = compList.filter(i=> i.classify ==4)
     compList= compList.filter(i=> i.classify ==1)

    list = list.filter((element) => {
      return element.memberType == 4;
    });
    list = list.slice(0, 6);
    this.setData({
      list,
      compList,
      compList1,
      compList2,
      compList3,

    });
  },
  async onShow() {
    let collect = wx.getStorageSync("collect");

    this.setData({
      collect,
      collectUrl: collect
        ? "https://ar-p2.obs.cn-east-3.myhuaweicloud.com/" +
          collect.bookCoverObsPath +
          collect.bookCoverObsName
        : "/images/index/add.png",
      isCollect: collect ? true : false,
    });
    let flag = await wx.getStorageSync("flag");
    if (flag) {
      console.log("收藏已清空");
      await wx.showToast({
        title: "收藏已清空",
      });

      await wx.removeStorageSync("flag");
    }
  },
  goHistroy() {
    publicFn.Loading();
    goTo("history");
  },
  gopriview({ currentTarget }) {
    console.log(currentTarget, "currentTarget");
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

  goService() {
    publicFn.Loading();
    goTo("mycomp");
  },
  goColllect() {
    publicFn.Loading();
    goTo("collect");
  },
  goSearch() {
    publicFn.Loading();
    goTo("compSearch");
  },
  onChange(event) {
    this.setData({ active: event.detail });
  },
});
