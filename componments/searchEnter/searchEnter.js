import { goTo } from "../../utils/navigate";
const publicFn = require("../../utils/public"); // componments/searchEnter/searchEnter.js
const { API } = require("../../utils/request");
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    disable: {
      type: Boolean,
      default: false,
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    inputValue: "",
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onTap() {
      this.triggerEvent("goSearch");
    },
    syncInputValue: function (e) {
      let value = e.detail.value;;
      // console.log("写入：" + value)
      if (!value) {
        return;
      }
      this.triggerEvent('myKeyinput',value)
    //   this.setData({ inputValue: value });
    },
    goSearch() {
      this.triggerEvent('myevent1')
    },
  
  },
});
