// packageB/pages/mine/mine.js
const app = getApp();
import {
    goTo
} from "../../../utils/navigate";
Page({
    /**
     * 页面的初始数据
     */
    data: {
        userName: "点击授权用户名",
        isIPhoneX: app.isIPhoneX,
        userAvatar: "../images/avatar.png"
    },
    onChooseAvatar(e) {
        const {
            avatarUrl
        } = e.detail;
        console.log(avatarUrl);
        this.setData({
            userAvatar: avatarUrl,
        });
        wx.setStorageSync("avatarUrl", avatarUrl);
    },
    blur(e) {
        console.log(e);
        const {
            value
        } = e.detail;
        if (!value) return;
        this.setData({
            userName: value
        });
        wx.setStorageSync("userName", value);
    },
    goQA() {
        goTo('useQA')
    },
    goRegister() {
        goTo('web-view')

    },
    /**
     * 生命周期函数--监听页面加载
     */
    async onLoad(options) {
        let hasPhone = await wx.getStorageSync('hasPhone')
        if (!hasPhone) {
            wx.showToast({
                title: "请先登录",
                icon: "error",
            });
            goTo("signIn")
        }
        const userAvatar = await wx.getStorageSync("avatarUrl") || "../images/avatar.png";
        const userName = await wx.getStorageSync("userName") || "";
        this.setData({
            userAvatar,
            userName
        });
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {},

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {},

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