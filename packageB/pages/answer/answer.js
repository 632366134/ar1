// packageB/pages/answer/answer.js
const app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
    isIPhoneX: app.isIPhoneX,
    img:'',
    height:''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad({param}) {
        let img,height
        if(param ==0){
            img = '../images/a1.png'
            height ='3413'
        }else if (param ==1){
            img = '../images/a2.png'
            height = '3285'
        }
        this.setData({img,height})
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