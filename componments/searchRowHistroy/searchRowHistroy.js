// componments/searchRowHistroy/searchRowHistroy.js
const app = getApp();

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    historyList:{
        type:Array,
        default:[]
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    isIPhoneX: app.isIPhoneX,

  },

  /**
   * 组件的方法列表
   */
  methods: {
    goSearch() {
      this.triggerEvent("myevent1");
    },
    goSearch2(item) {
      this.triggerEvent("myevent2",item);
    },
    myKeyinput(e) {
        console.log(e)
      this.triggerEvent("myKeyinput",e);
    },
    myevent1(){
      this.triggerEvent("myevent1");
    },
    deleteHistory(){
      this.triggerEvent("deleteHistory");
    }
  },
});
