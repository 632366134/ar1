// packageA/canvasAr/canvasAr.js
import getBehavior from "./behavior";
import yuvBehavior from "../../../utils/yuvBehavior";
const { API } = require("../../../utils/request");
const app = getApp();
const NEAR = 0.001;
const FAR = 1000;
let oldTouches = {};
Component({
  behaviors: [getBehavior(), yuvBehavior],
  data: {
    isIPhoneX: app.isIPhoneX,
    isShowScan: false,
    theme: "light",
    imgUrl: "",
    percentLine: 50,
    projectCode: "",
    obsList: [],
    mediaList: [],
    modelParamList: [],
    i: 0,
  },
  lifetimes: {
    /**
     * 生命周期函数--监听页面加载
     */
    detached() {
      console.log("页面detached");
      if (wx.offThemeChange) {
        wx.offThemeChange();
      }
      wx.removeStorageSync("projectCode");
    },
    async ready() {
      let projectCode = wx.getStorageSync("projectCode");
      if (!projectCode) {
        projectCode = "312330376891027456";
      }
      let data = { projectCode };
      let mediaList = await API.selMediaApps(data);
      mediaList.mediaList.forEach((value, index) => {
        switch (value.mediaType) {
          //   case 1:
          //     this.data.obsList.push(value);
          //     break;
          case 3:
            break;
          case 4:
            break;
          case 5:
            this.data.mediaList.push(value);
            break;
          case 6:
            break;
          case 7:
            break;
          case 9:
            break;
          default:
            break;
        }
      });
      this.data.modelParamList = mediaList.modelParamList;
      this.setData({ mediaList: this.data.mediaList });
      this.onReady2();
    },
  },
  methods: {
    // touchMove({ touches }) {
    //   if (this.reticle.visible == true) return;
    //   console.log(touches[0]);
    //   if ((oldTouches.length = 0)) {
    //     oldTouches.x = touches[0].x;
    //     oldTouches.y = touches[0].y;
    //   } else {
    //     changeX = oldTouches.x - touches[0].x;
    //     changeY = oldTouches.y - touches[0].y;
    //     this.model.rotation.set(
    //         changeY/5,
    //         changeX/5,
    //         0
    //       );
    //   }

    //   //   oldTouches = touches.pageX
    // },
    init() {
      this.initGL();
    },
    render(frame) {
      this.renderGL(frame);

      const camera = frame.camera;

      // 修改光标位置
      const reticle = this.reticle;
      if (reticle.visible == true) {
        const hitTestRes = this.session.hitTest(0.5, 0.5);
        if (hitTestRes.length) {
          reticle.matrixAutoUpdate = false;
          reticle.matrix.fromArray(hitTestRes[0].transform);
          reticle.matrix.decompose(
            reticle.position,
            reticle.quaternion,
            reticle.scale
          );
        }
      }

      // 更新动画
      this.updateAnimation();

      // 相机
      if (camera) {
        this.camera.matrixAutoUpdate = false;
        this.camera.matrixWorldInverse.fromArray(camera.viewMatrix);
        // this.camera.matrixWorld.getInverse(this.camera.matrixWorldInverse);
        this.camera.matrixWorld.copy(this.camera.matrixWorldInverse).invert();
        const projectionMatrix = camera.getProjectionMatrix(NEAR, FAR);
        this.camera.projectionMatrix.fromArray(projectionMatrix);
        // this.camera.projectionMatrixInverse.getInverse(
        //   this.camera.projectionMatrix
        // );
        this.camera.projectionMatrixInverse
          .copy(this.camera.projectionMatrix)
          .invert();
      }

      this.renderer.autoClearColor = false;
      this.renderer.render(this.scene, this.camera);
      this.renderer.state.setCullFace(this.THREE.CullFaceNone);
    },
  },
});
