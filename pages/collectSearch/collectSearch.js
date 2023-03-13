// pages/collect/collect.js
import { goTo } from "../../utils/navigate";
const publicFn = require("../../utils/public");
const { API } = require("../../utils/request.js");
const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    compList: [],
    inputValue: "",
    list: [],
    isIPhoneX: app.isIPhoneX,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad() {
    let list;
    list = wx.getStorageSync("list");
    if (list.length == 0) {
      let data = {
        pagination: "1",
        pageNum: "5",
        page: "1",
        projectName: "",
        userCode: "",
      };
      list = await API.selProjects(data);
      await wx.setStorageSync("list", list);
    }
    this.setData({ list });
  },
  bindKeyInput(e) {
    this.setData({
      inputValue: e.detail.detail,
    });
  },
  goSearch() {
    publicFn.Loading();
    console.log(this.data.inputValue);
    let inputValue = this.data.inputValue;
    if (!inputValue) {
      publicFn.Toast("请输入正确", "error");
      return;
    }
    this.filterProjectName(inputValue);
  },
  async filterProjectName(inputValue) {
    let pageNum = 1,
      pageSize =8;
    let data1 = `pageNum=${pageNum}&pageSize=${pageSize}&projectName=${inputValue}`;
    let data2 = `pageNum=${pageNum}&pageSize=${pageSize}&CompanyName=${inputValue}`;
    let list1 = await API.selProjectsOnNameByPage(data1);
    let list2 = await API.selProjectsOnCompanyNameByPage(data2);
    let list = [...list1, ...list2];
    let string = list.map(i=> JSON.stringify(i))
   list =  Array.from(new Set(string))
   list = list.map(d=> JSON.parse(d))
    list = list.filter((v) => {
      return v.projectCode != "312330376891027456";
    });
    if (list.length !== 0) {
        let { projectCode } = wx.getStorageSync("collect");
 
      for (let i = 0; i < list.length; i++) {
        let { mediaList } = await API.selMediaApps({
          projectCode: list[i].projectCode,
        });
        if (list[i].projectCode == projectCode) {
            list[i].collect = true;
          }
        if (mediaList.some((s) => s.mediaType == 5)) {
          list[i].mediaType = 5;
        }
      }
      goTo("searchList", { list, inputValue });
    } else {
      wx.showToast({
        title: "没有符合的结果！",
        icon: "error",
      });
      this.setData({
        inputValue: "",
      });
    }
  },
  deleteHistory() {
    this.setData({
      compList: [],
    });
    wx.setStorageSync("compList", this.data.compList);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.setData({
      compList: wx.getStorageSync("compList") || [],
    });
    publicFn.LoadingOff();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {},
});
