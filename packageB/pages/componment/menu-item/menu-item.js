// packageB/pages/componment/meun-item/meun-item.js
const { API } = require("../../../../utils/request");
const app = getApp();

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    text: {
      type: String,
    },
    BtnType: { type: String, default: "" },
  },
  /**
   * 组件的初始数据
   */
  data: {
    hasPhone: false,
  },
  ready() {},
  /**
   * 组件的方法列表
   */
  methods: {
    async getPhoneNumber(e) {
        if(!e.detail.code) return
      if (this.data.hasPhone) {
        wx.showToast({
          title: "已经绑定过手机号",
          icon: "none",
        });
        return;
      }
      //   const res2 = await API.getPhone({code:e.detail.code})
      const { data } = await API.getPhone(`code=${e.detail.code}`);
      console.log(data,'data')
      wx.showToast({
        title: "绑定成功",
        icon: "success",
      });
      this.setData({ hasPhone: true });
    },
  },
});
