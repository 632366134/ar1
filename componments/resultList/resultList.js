// componments/collectList.js
const { API } = require("../../utils/request");

var app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多 slot 支持
  },
  externalClasses: ["url"],
  properties: {
    list: {
      type: Array,
      value: []
    },
    flag: {
      type: Boolean,
      value: false,
    },
    inputValue:{
        type:String
    }
  },
  data: {
    isIPhoneX: app.isIPhoneX,
    modelList: [],
  },
  lifetimes: {
    async ready() {
        
    },
  },
  /**
   * 组件的初始数据
   */


  methods: {

    select_box(e) {
      if (this.data.flag) return;
      let data = e.currentTarget.dataset.item;
    //   let id = data.id;
    //   if (this.data.listIndex == id) {
    //     id = "";
    //     data = {};
    //   }
    //   this.setData({
    //     listIndex: id,
    //   });
      this.triggerEvent("myevent", data);
    },
  },
});
