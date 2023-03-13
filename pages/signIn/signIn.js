// pages/signIn/signIn.js
const {
    API
} = require("../../utils/request.js");
import {
    goTo,
    navigateBack,
    redirectTo
} from "../../utils/navigate";
const publicFn = require("../../utils/public");
const app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        isIPhoneX: app.isIPhoneX,
        userPhone: '',
        code: '',
        hidden: false,
        btnValue: '',
        btnDisabled: false,
        hasPhone:wx.getStorageSync('hasPhone'),
        detail:{}
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {

    },
    async getPhoneNumber(e) {

        if (!e.detail.code) return
        //   const res2 = await API.getPhone({code:e.detail.code})
        // publicFn.Loading()
        console.log(e)
        const {
            data
        } = await API.getPhone(`code=${e.detail.code}`);
        console.log(data, 'data')
        wx.showToast({
            title: "绑定成功",
            icon: "success",
        });
        this.setData({
            userPhone: data.purePhoneNumber,
        })


    },
    async sendMsg() {
        publicFn.Loading()
        const data = await API.sendMsg(`phone=${this.data.userPhone}`);

        console.log(data)
    },
    phoneBlur({
        detail
    }) {
        console.log(detail)
        this.setData({
            detail:detail,
            userPhone: detail.value
        })
    },
    async goMine() {
        if(this.data.userPhone =='') {
            wx.showToast({
                title: "请绑定手机号",
                icon: "error",
            });
            return
        }
        wx.setStorageSync('hasPhone', true)
        this.setData({
            hasPhone:true
        })
        redirectTo('mine')
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {


    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    }
})