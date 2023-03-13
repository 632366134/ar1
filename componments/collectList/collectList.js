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
      value: [],
    },
    flag: {
      type: Boolean,
      value: false,
    },
  },
  data: {
    isIPhoneX: app.isIPhoneX,
    modelList: [],
  },
  lifetimes: {
    async ready() {
        if(this.properties.list.length >=7){
            
        }
    },
  },
  /**
   * 组件的初始数据
   */

  async onReachBottom() {
    let list =  await this.filterProjectName(this.properties.inputValue)
    list = [...this.data.list,...list]
    this.setData({list})
   },
  methods: {
    async filterProjectName(inputValue) {
        let pageNum = 2,
          pageSize = 4;
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
          for (let i = 0; i < list.length; i++) {
            let { mediaList } = await API.selMediaApps({projectCode:list[i].projectCode});
            if (mediaList.some((s) => s.mediaType == 5)) {
              list[i].mediaType = 5;
            }
          }
          pageNum++
        } else {
          wx.showToast({
            title: "没有更多结果",
            icon: "error",
          });
        }
      },
    select_box(e) {
      if (this.data.flag) return;
      let data = e.currentTarget.dataset.item;
      let id = data.id;
      if (this.data.listIndex == id) {
        id = "";
        data = {};
      }
      this.setData({
        listIndex: id,
      });
      this.triggerEvent("myevent", data);
    },
  },
});
