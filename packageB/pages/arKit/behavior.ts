// import { createScopedThreejs } from "threejs-miniprogram";
import * as THREE from "three-platformize";
import { WechatPlatform } from "three-platformize/src/WechatPlatform";
import { GLTFLoader } from "three-platformize/examples/jsm/loaders/GLTFLoader";
import { FBXLoader } from "three-platformize/examples/jsm/loaders/FBXLoader";
// import { OrbitControls  } from "three-platformize/examples/jsm/controls/OrbitControls";
// import registerOrbit from "./orbit"
import cloneGltf from "../../../loaders/gltf-clone";
import GLTFPBRMetallicRoughnessNode from "XrFrame/loader/glTF/materials/pbr/GLTFPBRMetallicRoughnessNode";
const info = wx.getSystemInfoSync();
const DEBUG_SIZE = false;
export default function getBehavior() {
  return Behavior({
    data: {
      width: 1,
      height: 1,
      fps: 0,
      memory: 0,
      cpu: 0,
      hide: false,
      selectMediaList: [],
      type2: null,
      modelscale: [1, 1, 1],
      modelposition: [0, 0, 0],
      modelrotation: [0, 0, 0],
      reticleData: [],
      type: "glb",
    },
    methods: {
      async onHide() {
        console.log("onhide1");
        this.setData({
          hide: true,
        });
      },
      onReady2() {
        wx.createSelectorQuery()
          .select("#webgl")
          .node()
          .exec((res) => {
            this.canvas = res[0].node;
            const info = wx.getSystemInfoSync();
            const pixelRatio = info.pixelRatio;
            const calcSize = (width, height) => {
              console.log(`canvas size: width = ${width} , height = ${height}`);
              this.canvas.width = (width * pixelRatio) / 2;
              this.canvas.height = (height * pixelRatio) / 2;
              this.setData({
                width,
                height,
              });
            };
            calcSize(info.windowWidth, info.windowHeight);

            this.initVK();
          });
      },
      onUnload() {
        if (this._texture) {
          this._texture.dispose();
          this._texture = null;
        }
        if (this.renderer) {
          this.renderer.dispose();
          this.renderer = null;
        }
        if (this.scene) {
          this.scene.dispose();
          this.scene = null;
        }
        if (this.camera) this.camera = null;
        if (this.model) this.model = null;
        if (this._insertModel) this._insertModel = null;
        if (this._insertModels) this._insertModels = null;
        if (this.planeBox) this.planeBox = null;
        if (this.mixers) {
          this.mixers.forEach((mixer) => mixer.uncacheRoot(mixer.getRoot()));
          this.mixers = null;
        }
        if (this.clock) this.clock = null;

        if (this.THREE) this.THREE = null;
        if (this._tempTexture && this._tempTexture.gl) {
          this._tempTexture.gl.deleteTexture(this._tempTexture);
          this._tempTexture = null;
        }
        if (this._fb && this._fb.gl) {
          this._fb.gl.deleteFramebuffer(this._fb);
          this._fb = null;
        }
        if (this._program && this._program.gl) {
          this._program.gl.deleteProgram(this._program);
          this._program = null;
        }
        if (this.canvas) this.canvas = null;
        if (this.gl) this.gl = null;
        if (this.session) this.session = null;
        if (this.anchor2DList) this.anchor2DList = [];
        if (this.session) this.session.destroy();
      },
      initVK() {
        // 初始化 threejs
        this.initTHREE();
        const THREE = this.THREE;

        // 自定义初始化
        if (this.init) this.init();

        console.log("this.gl", this.gl);
        // const isSupportV2 = wx.isVKSupport("v2");

        const session = (this.session = wx.createVKSession({
          track: {
            plane: {
              mode: 3,
            },
          },
          version: 'v1',
          gl: this.gl,
        }));
        session.start(async (err) => {
          if (err) return console.error("VK error: ", err);

          console.log("@@@@@@@@ VKSession.version", session.version);

          const canvas = this.canvas;

          const calcSize = (width, height, pixelRatio) => {
            console.log(`canvas size: width = ${width} , height = ${height}`);
            this.canvas.width = (width * pixelRatio) / 2;
            this.canvas.height = (height * pixelRatio) / 2;
            this.setData({
              width,
              height,
            });
          };

          session.on("resize", () => {
            const info = wx.getSystemInfoSync();
            calcSize(info.windowWidth, info.windowHeight, info.pixelRatio);
          });

          this.clock = new THREE.Clock();
          const model4 = await this.loading(
            "https://dldir1.qq.com/weixin/miniprogram/RobotExpressive_aa2603d917384b68bb4a086f32dabe83.glb"
          );
          const model5 = await this.loading(
            "https://ar-p2.obs.cn-east-3.myhuaweicloud.com/dian.glb"
          );
          const reticle = (this.reticle = new THREE.Object3D());
          model4.scene.scale.set(0.0001, 0.0001, 0.0001);
        //   if(isSupportV2){
        //   model5.scene.scale.set(0.08, 0.08, 0.08);
        //   }else {
          model5.scene.scale.set(0.2, 0.2, 0.2);
        //   }

          reticle.add(model4.scene);
          reticle.add(model5.scene);
          this.scene.add(reticle);
          // this.scene.add(model5.scene)

          // 平面集合
          // const planeBox = (this.planeBox = new THREE.Object3D());
          // this.scene.add(planeBox);
          let mediaList = this.data.mediaList;
          for (let i = 0; i <= mediaList.length - 1; i++) {
            const data = "https:" + mediaList[i].mediaUrl;
            const mediaCode = mediaList[i].mediaCode;
            this.setData({ type: data.slice(data.lastIndexOf(".") + 1) });
            const modelList = this.data.modelParamList.filter(
              (element) => element.mediaCode == mediaCode
            );
            console.log(modelList, "modelListmodelList");
            try {
              let list = [];
              await this.loading(data);
              // @ts-ignore
              list.push(this.model, this.data.type, modelList);
              this.data.selectMediaList.push(list);
              console.log("okokokok");
            } catch (error) {
              console.log(error);
            }
          }

          console.log("success1");
          console.log(this.data.selectMediaList);

          this.setData({ isShowScan: true });
          // 逐帧渲染
          const onFrame = (timestamp) => {
            // let start = Date.now()
            const frame = session.getVKFrame(canvas.width, canvas.height);
            if (frame) {
              this.render(frame);
            }
            // this.orbitControl?.update()
            session.requestAnimationFrame(onFrame);
          };
          session.requestAnimationFrame(onFrame);
        });
      },
      //   touchStart(e) {
      //     this.canvas.dispatchTouchEvent({...e, type:'touchstart'})
      //   },
      //   touchMove(e) {
      //     this.canvas.dispatchTouchEvent({...e, type:'touchmove'})
      //   },
      //   touchEnd(e) {
      //     this.canvas.dispatchTouchEvent({...e, type:'touchend'})
      //   },
      initTHREE() {
        const platform = new WechatPlatform(this.canvas);
        this.platform = platform;
        platform.enableDeviceOrientation("game");
        THREE.PLATFORM.set(platform);
        this.THREE = THREE;
        // createScopedThreejs(this.canvas)
        // 相机
        this.camera = new THREE.Camera();
        // this.camera = new THREE.PerspectiveCamera(45, this.canvas.width / this.canvas.height, 0.25, 100);

        // 场景
        const scene = (this.scene = new THREE.Scene());

        // 光源
        const light = new THREE.AmbientLight(0x404040, 1); // soft white light
        scene.add(light);
        let light1 = new THREE.HemisphereLight(0xffffff, 0x444444); // 半球光
        light1.position.set(0, 2, 0);
        scene.add(light1);
        light1 = new THREE.HemisphereLight(0xffffff, 0x444444); // 半球光
        light1.position.set(0, -0.2, 0);
        scene.add(light1);
        const light2 = new THREE.DirectionalLight(0xffffff, 0.6); // 平行光
        light2.position.set(0, 2, 0.1);
        scene.add(light2);
        const light3 = new THREE.DirectionalLight(0xffffff, 0.6); // 平行光
        light2.position.set(0, 2, -0.1);
        scene.add(light3);
        const light4 = new THREE.DirectionalLight(0xffffff, 0.6); // 平行光
        light2.position.set(0.1, 2, 0);
        scene.add(light4);
        const light5 = new THREE.DirectionalLight(0xffffff, 0.6); // 平行光
        light2.position.set(-0.1, 2, 0);
        scene.add(light5);
        const light6 = new THREE.DirectionalLight(0xffffff, 0.6); // 平行光
        light2.position.set(0, 2, 0);

        scene.add(light6);

        // 渲染层
        const renderer = (this.renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: true,
          canvas: this.canvas,
        }));
        renderer.outputEncoding = THREE.sRGBEncoding;
        // const { OrbitControls } = registerOrbit(THREE)
        // this.orbitControl = new OrbitControls( this.camera, renderer.domElement );
        //     this.orbitControl = new OrbitControls(this.camera, renderer.domElement);
        // this.orbitControl.enableDamping = true;
        // this.orbitControl.dampingFactor = 0.05;
        // renderer.outputEncoding = THREE.LinearEncoding;
      },
      //   onTX(e) {
      //     this.platform.dispatchTouchEvent(e);
      //   },
      updateAnimation() {
        const dt = this.clock.getDelta();
        if (this.mixers) this.mixers.forEach((mixer) => mixer.update(dt));
      },
      copyRobot() {
        const THREE = this.THREE;
        if (this.type2 === "glb") {
          const { scene, animations } = cloneGltf(this.model, THREE);
          scene.scale.set(0.05, 0.05, 0.05);

        //   scene.position.set(
        //     this.data.modelposition[0] / 10,
        //     this.data.modelposition[1] / 10,
        //     this.data.modelposition[2] / 10
        //   );
        //   scene.rotation.set(
        //     this.data.modelrotation[0],
        //     this.data.modelrotation[1],
        //     this.data.modelrotation[2]
        //   );
          const mixer = new THREE.AnimationMixer(scene);
          for (let i = 0; i < animations.length; i++) {
            const clip = animations[i];
            if (clip) {
              const action = mixer.clipAction(clip);
              action.play();
            }
          }
          this.mixers = this.mixers || [];
          this.mixers.push(mixer);
          scene._mixer = mixer;
          return scene;
        } else {
          this.model.scale.set(0.05, 0.05, 0.05);
        //   this.model.position.set(
        //     this.data.modelposition[0] / 10,
        //     this.data.modelposition[1] / 10,
        //     this.data.modelposition[2] / 10
        //   );
        //   this.model.rotation.set(
        //     this.data.modelrotation[0],
        //     this.data.modelrotation[1],
        //     this.data.modelrotation[2]
        //   );
          const mixer = new THREE.AnimationMixer(this.model);
          for (let i = 0; i < this.model.animations.length; i++) {
            const clip = this.model.animations[i];
            if (clip) {
              const action = mixer.clipAction(clip);
              action.play();
            }
          }
          this.mixers = this.mixers || [];
          this.mixers.push(mixer);
          return this.model;
        }
      },
      getRobot() {
        const THREE = this.THREE;

        const model = new THREE.Object3D();
        model.add(this.copyRobot());

        this._insertModels = this._insertModels || [];
        this._insertModels.push(model);

        if (this._insertModels.length > 1) {
          const needRemove = this._insertModels.splice(
            0,
            this._insertModels.length - 1
          );
          needRemove.forEach((item) => {
            if (item._mixer) {
              const mixer = item._mixer;
              this.mixers.splice(this.mixers.indexOf(mixer), 1);
              mixer.uncacheRoot(mixer.getRoot());
            }
            if (item.parent) item.parent.remove(item);
          });
        }
        return model;
      },
      onTouchEnd(evt) {},
      //   onTouchEnd(evt) {
      //     // 点击位置放一个机器人
      //     const touches = evt.changedTouches.length
      //       ? evt.changedTouches
      //       : evt.touches;
      //     if (touches.length === 1) {
      //       const touch = touches[0];
      //       if (this.session && this.scene && this.model) {
      //         const hitTestRes = this.session.hitTest(
      //           touch.x / this.data.width,
      //           touch.y / this.data.height,
      //           this.resetPanel
      //         );
      //         this.resetPanel = false;
      //         if (hitTestRes.length) {
      //           const model = this.getRobot();
      //           model.matrixAutoUpdate = false;
      //           model.matrix.fromArray(hitTestRes[0].transform);
      //           this.scene.add(model);
      //         }
      //       }
      //     }
      //   },
      loading(data) {
        const THREE = this.THREE;
        return new Promise((resolve, reject) => {
          if (this.data.type === "mp4") resolve("mp4");

          const onProgress = (xhr) => {
            console.log("onprogress");
            console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
          };
          const onErr = (error) => {
            console.log("error!", error);
            wx.showToast({
              title: "Loading model failed.",
              icon: "none",
              duration: 3000,
            });
          };
          const glbFun = async () => {
            await new GLTFLoader().load(
              data,
              (gltf) => {
                console.log(gltf, "gltf!gltfgltf");
                this.model = {
                  scene: gltf.scene,
                  animations: gltf.animations,
                };
                gltf.scene.traverse((obj) => {
                    // @ts-ignore
                    if (obj.isMesh) {
                          // @ts-ignore

                          // @ts-ignore
                        if(data =='https://ar-p2.obs.cn-east-3.myhuaweicloud.com/dian.glb'){
                            obj.castShadow = true;
                            obj.receiveShadow = true;
                            // @ts-ignore
                            obj.material.minFilter = THREE.NearestFilter;
                            // @ts-ignore
                            obj.material.side = THREE.DoubleSide;
                            // @ts-ignore
                            obj.material.wrapS = obj.material.wrapT =
                              THREE.ClampToEdgeWrapping;
                            // @ts-ignore
                            obj.material.transparent = true;
                            // @ts-ignore
                            obj.material.opacity =1;
                            // @ts-ignore
                            // @ts-ignore
  
                        }else{

                          // @ts-ignore
                        obj.material.emissive =  obj.material.color;
                          // @ts-ignore

                        obj.material.emissiveMap = obj.material.map ;
                          // @ts-ignore
                          // @ts-ignore
                        if(obj.name.slice(0,5) =='alpha'){
                            console.log('alpa!!!!')
                          obj.castShadow = true;
                          obj.receiveShadow = true;
                          // @ts-ignore
                          obj.material.minFilter = THREE.NearestFilter;
                          // @ts-ignore
                        //   obj.material.side = THREE.DoubleSide;
                          // @ts-ignore
                          obj.material.wrapS = obj.material.wrapT =
                            THREE.ClampToEdgeWrapping;
                          // @ts-ignore
                          obj.material.transparent = true;
                          // @ts-ignore
                          obj.material.opacity =0.7;
                          // @ts-ignore

                        obj.material.depthTest =false


                        }else{
                          // @ts-ignore
                        obj.material.depthTest =true


                          obj.castShadow = true;
                          obj.receiveShadow = true;
                          // @ts-ignore
                          obj.material.minFilter = THREE.NearestFilter;
                          // @ts-ignore
                          obj.material.side = THREE.DoubleSide;
                          // @ts-ignore
                          obj.material.wrapS = obj.material.wrapT =
                            THREE.ClampToEdgeWrapping;
                          // @ts-ignore
                          obj.material.transparent = true;
                          // @ts-ignore
                          obj.material.opacity =1;
                          // @ts-ignore
                        }
                     
                    }
                }

                  });
                resolve(gltf);
              },
              onProgress,
              onErr
            );
          };
          const fbxFun = async () => {
            const loader = new FBXLoader();
            const object = await loader.load(
              data,
              (gltf) => {
                console.log(gltf);
                this.model = gltf;
                this.model.traverse((obj) => {
                    // @ts-ignore
                    if (obj.isMesh) {
                        if(obj.name.slice(0,5) =='alpha'){
                            console.log('alpa!!!!')
                          obj.castShadow = true;
                          obj.receiveShadow = true;
                          // @ts-ignore
                          obj.material.minFilter = THREE.NearestFilter;
                          // @ts-ignore
                        //   obj.material.side = THREE.DoubleSide;
                          // @ts-ignore
                          obj.material.wrapS = obj.material.wrapT =
                            THREE.ClampToEdgeWrapping;
                          // @ts-ignore
                          obj.material.transparent = true;
                          // @ts-ignore
                          obj.material.opacity =0.7;
                          // @ts-ignore

                        obj.material.depthTest =false
                        }else{
                          // @ts-ignore
                        obj.material.depthTest =true


                          obj.castShadow = true;
                          obj.receiveShadow = true;
                          // @ts-ignore
                          obj.material.minFilter = THREE.NearestFilter;
                          // @ts-ignore
                          obj.material.side = THREE.DoubleSide;
                          // @ts-ignore
                          obj.material.wrapS = obj.material.wrapT =
                            THREE.ClampToEdgeWrapping;
                          // @ts-ignore
                          obj.material.transparent = true;
                          // @ts-ignore
                          obj.material.opacity =1;
                          // @ts-ignore
                        }
                     
                    }
                  });
                resolve(gltf);
              },
              onProgress,
              onErr
            );
          };

          try {
            if (this.data.type === "fbx") {
              fbxFun();
            } else if (this.data.type === "glb") {
              glbFun();
            }
          } catch (error) {
            console.log(error);
          }
        });
      },
      changeModel(e) {
        let index = e.currentTarget.dataset.index;
        console.log(e);
        console.log(index);
        let data = this.data.selectMediaList[index];
        this.type2 = data[1];
        this.model = data[0];
        let modelParamList = data[2];
        const position = modelParamList[0].modelParamInfo.split("|");
        const scale = modelParamList[1].modelParamInfo.split("|");
        const rotation = modelParamList[2].modelParamInfo.split("|");
        console.log(position, "p1");
        this.setData({
          modelscale: scale,
          modelposition: position,
          modelrotation: rotation,
        });
        if (this.scene && this.model && this.reticle) {
          let reticleData = this.data.reticleData;
          if (reticleData.length === 0) {
            reticleData = this.data.reticleData = [
              this.reticle.position,
              this.reticle.rotation,
            ];
          }
          const model = this.getRobot();
          console.log(reticleData, "p1");

          model.position.copy(reticleData[0]);
          model.rotation.copy(reticleData[1]);
          model.scale.set(0.5*scale[0], 0.5*scale[1], 0.5*scale[2]);

            // model.lookAt(this.camera.position)
          this.model = model;   
          this.scene.add(model);
          this.reticle.visible = false;
        }
      },
      reset() {
        this.scene.remove(this.model);
        this.reticle.visible = true;
        this.data.reticleData = [];
      },
    },
  });
}
