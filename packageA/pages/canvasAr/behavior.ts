import * as THREE from "three-platformize";
import { WechatPlatform } from "three-platformize/src/WechatPlatform";
import { GLTFLoader } from "three-platformize/examples/jsm/loaders/GLTFLoader";
import { FBXLoader } from "three-platformize/examples/jsm/loaders/FBXLoader";
import { OBJLoader } from "three-platformize/examples/jsm/loaders/OBJLoader";
import { MTLLoader } from "three-platformize/examples/jsm/loaders/MTLLoader";
import { STLLoader } from "three-platformize/examples/jsm/loaders/STLLoader";
import VideoPlayer from "./video.js";

const { API } = require("../../../utils/request");
import cloneGltf from "../../../loaders/gltf-clone";
const publicFn = require("../../../utils/public");
const w = 300;
let h = 200,
  box,
  canv;
let dpr = 1;
let c2d_freshId = 0;
let c2d, c2d_canvasId;
let lastTime = 0;
let video, videoCtx, ctx1;
let scene, camera, renderer, ctx3;
let texture, mesh, geometry;
let initCanvas = false;
let count = 0;
let controls, controller;
// let videoFrame = new Uint8Array(2000000);//保存视频的某一帧
let videoFrame = undefined as any;

const info = wx.getSystemInfoSync();
let DEBUG_SIZE = false; // 目前支持不完善
export default function getBehavior() {
  return Behavior({
    data: {
      width: 1,
      height: 1,
      fps: 0,
      memory: 0,
      cpu: 0,
      src: "",
      videoShow: true,
      left: "300vw",
      top: "0",
      type: "",
      h: 0,
      mediaUrl: "",
      selectMediaList: [],
      mediaUrl2: [],
      drawimage: null,
      rotate: 0,
      scale: 1,
      translateX: "translateX(-50%)",
      imageList: [],
    },
    methods: {
      binderror(err) {
        console.log(err);
      },
      bindwaiting(err) {
        console.log(err);
      },
      onReady2() {
        wx.showLoading({
          title: "加载中",
        });
        wx.createSelectorQuery()
          .select("#webgl")
          .node()
          .exec((res) => {
            this.canvas = res[0].node;
            // this.videoPlayer = new VideoPlayer(wx);
            wx.createSelectorQuery()
              .select("#video")
              .context((res) => {
                const video = (this.video = res.context);
              })
              .exec();
            publicFn.LoadingOff();
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
            console.log(this.data.type);
            this.initVK();

          });
      },
      back() {
        this.onUnload();
        wx.navigateBack({
          delta: 1,
        });
      },
      loadedmetadata(e) {
        // console.log("loadedmetadata");
        h = (w / e.detail.width) * e.detail.height;
        this.setData(
          {
            h,
            left: "50%",
          },
          () => {
            // this.draw();
          }
        );
      },
      draw() {
        if (this.left !== "50%") this.setData({ left: "50%" });
        this.video.play();
        console.log("drawimage1");
        clearInterval(this.data.drawimage);
        console.log(this.video);
        this.data.drawimage = setInterval(() => {
          console.log("drawimage2");
          this.ctx1.drawImage(
            this.video,
            0,
            0,
            w * info.pixelRatio,
            h * info.pixelRatio
          );
        }, 1000 / 24);
      },
      playVideoPlane(plane3, data) {
        let { THREE, scene, textureLoader } = this;
        this.videoPlayer
          .playVideo("target1", data, async (res) => {
            // console.log(res)
            if (res) {
              textureLoader.load(res, (texture) => {
                  console.log(texture,'texture')
                this.texture = texture;
                texture.flipY = false;
                texture.minFilter = THREE.NearestFilter;
                plane3.material.map = texture;
              });
            }
          })
          .then((res) => {
            res.plane3 = plane3;
            this.vp = this.vp2 = res;
          });
        this.i++;
      },
      createPanel(data) {
        let { THREE, textureLoader } = this;
        let rangeSize = 100;
        var geometry = new THREE.PlaneGeometry(1.5, 1);
        var material = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });
        var texture = textureLoader.load("./bg2.png");
        texture.minFilter = THREE.NearestFilter;
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.flipY = false;
        var plane3 = new THREE.Mesh(geometry, material);
        plane3.traverse(function (node) {
          if (node instanceof THREE.Mesh) {
            node.castShadow = true;
            node.material.map = texture;
            node.material.emissiveMap = node.material.map;
            node.material.transparent = true;
          }
        });
        plane3.material.map = texture;
        // plane3.rotateX(Math.PI);
        // this.scene.add(plane3);
        this.playVideoPlane(plane3, data);

        return plane3;
      },
      onUnload() {
        clearInterval(this.data.drawimage);
        this.video.pause();
        this.setData({ left: "300vw" });
        // this.data.drawimage = null
        if (this.session) this.session.destroy();
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
        if (THREE.PLATFORM) {
          THREE.PLATFORM.dispose();
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
      },

      initVK() {
        // 初始化 threejs
        this.initTHREE();
        const THREE = this.THREE;
        // 自定义初始化
        this.textureLoader = new THREE.TextureLoader();

        if (this.init) this.init();

        console.log("this.gl", this.gl);
        const isSupportV2 = wx.isVKSupport("v2");
        const session = (this.session = wx.createVKSession({
          track: {
            plane: {
              mode: 3,
            },
            marker: true,
          },
          version: isSupportV2 ? "v2" : "v1",
          //   version: "v1",
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
            calcSize(
              info.windowWidth,
              info.windowHeight,
              //   info.windowHeight,
              info.pixelRatio
            );
          });

          const createPlane = (size) => {
            const geometry = new THREE.PlaneGeometry(size.width, size.height);
            const material = new THREE.MeshBasicMaterial({
              color: 0xffffff,
              side: THREE.DoubleSide,
              transparent: true,
              opacity: 0.5,
            });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.rotateX(Math.PI / 2);
            const cnt = new THREE.Object3D();
            cnt.add(mesh);
            return cnt;
          };
          const updateMatrix = (object, m) => {
            object.matrixAutoUpdate = false;
            object.matrix.fromArray(m);
          };
          session.on("addAnchors", (anchors) => {
            console.log("加载模型1");
            anchors.forEach((anchor) => {
              const size = anchor.size;
              let markerid = anchor.id;
              let object;
              console.log(this.data.selectMediaList);
              object = new THREE.Object3D();
              let model;
              let selectLIst = this.data.selectMediaList;
              selectLIst.forEach((element, index) => {
                if (element[0] == markerid) {
                  console.log(element[0], "element[0]element[0]element[0]");
                  this.type2 = selectLIst[index + 1][1];
                  const modelParamList = selectLIst[index + 1][2];

                  let mediaData = selectLIst[index + 1][0];
                  const position = modelParamList[0].modelParamInfo.split("|");
                  const scale = modelParamList[1].modelParamInfo.split("|");
                  const rotation = modelParamList[2].modelParamInfo.split("|");
                  if (this.type2 === "mp4") {
                    this.setData({ src: mediaData });
                    this.video.play();
                    // const model = this.createPanel(mediaData);
                    this.type3 = "mp4";
                    if (rotation[0] == 0 || rotation[0] == 180) {
                      this.setData({
                        left: 50 + parseInt(position[0]) + "%",
                        top: 0 + parseInt(position[1]) + "%",
                        scale: scale[0],
                        rotate: rotation[0] + "deg",
                        translateX: "translateX(-50%)",
                      });
                    } else {
                      this.setData({
                        left: 50 + parseInt(position[0]) + "%",
                        top: 0 + parseInt(position[1]) + "%",
                        scale: scale[0],
                        rotate: rotation[0] + "deg",
                        translateX: "translateY(-50%)",
                      });
                    }
                    return;
                    // // model.rotateX(45);
              
                    // model.rotation.set(Math.PI+Math.PI/(360/rotation[0]),rotation[1],rotation[2])
                    // model.scale.set(scale[0],scale[1],scale[2])
                    // model.position.set(position[0],position[1],position[2]);
                    object.add(model);
                  } else if (this.type2 === "png" || this.type2 === "jpg") {
                    let objectGrop1 = new THREE.Object3D();
                    this.model2 = selectLIst[index + 1][3];
                    this.model = mediaData;
                    console.log(mediaData, "mediaData++", element[0]);
                    objectGrop1.add(this.model);
                    objectGrop1.add(this.model2);

                    objectGrop1.scale.set(scale[0], scale[1], scale[2]);
                    objectGrop1.position.set(
                      position[0] / 10,
                      position[1] / 10,
                      position[2] / 10
                    );
                    objectGrop1.rotation.set(
                      rotation[0],
                      rotation[1],
                      rotation[2]
                    );
                    object.add(objectGrop1);
                  } else {
                    console.log(modelParamList);
                    console.log(position, scale);
                    this.model = mediaData;
                    model = this.getRobot();
                    // model = this.model
                    model.scale.set(scale[0], scale[1], scale[2]);
                    model.position.set(
                      position[0] / 10,
                      position[1] / 10,
                      position[2] / 10
                    );
                    model.rotation.set(rotation[0], rotation[1], rotation[2]);
                    object.add(model);
                  }
                }
              });
              //   if (size && DEBUG_SIZE) {
              //     object = createPlane(size);
              //   } else {
              //     // if (!this.model) {
              //     //   console.warn("this.model 还没加载完成 ！！！！！");
              //     //   return;
              //     // }

              //     object = new THREE.Object3D();
              //     let model;
              //     if (
              //       this.type2 === "obj" ||
              //       this.type2 === "stl" ||
              //       this.type2 === "png" ||
              //       this.type2 === "jpg"
              //     ) {

              //       object.add(this.model2);
              //       model = this.model;
              //       object.add(model);
              //     } else if (this.type2 === "glb" || this.type2 === "fbx") {
              //       model = this.getRobot();
              //       model.rotateX(-45);
              //       model.scale.set(0.05, 0.05, 0.05);
              //       object.add(model);
              //     } else {
              //         return
              //     }
              //   }

              object._id = anchor.id;
              object._size = size;
              updateMatrix(object, anchor.transform);
              this.planeBox.add(object);
              console.log("加载模型2");
              //   this.planeBox.add(this.cube);加载png贴图
            });
          });
          // session.on("updateAnchors", (anchors) => {
          //     console.log('updateAnchors')
          //   const map = anchors.reduce((temp, item) => {
          //     temp[item.id] = item;
          //     return temp;
          //   }, {});
          //   this.planeBox.children.forEach((object) => {
          //     if (object._id && map[object._id]) {
          //       const anchor = map[object._id];
          //       const size = anchor.size;
          //       if (
          //         size &&
          //         DEBUG_SIZE &&
          //         object._size &&
          //         (size.width !== object._size.width ||
          //           size.height !== object._size.height)
          //       ) {
          //           this.planeBox.remove(object);
          //               this.planeBox.add(object)
          //           // if (this.data.type === "png" || this.data.type === "jpg") {
          //           //     this.scene.remove(this.model2);
          //           //     this.scene.add(this.model2);
          //           //   }else {

          //           //   }

          //       }

          //       object._id = anchor.id;
          //       object._size = size;
          //       updateMatrix(object, anchor.transform);
          //     }
          //   });
          // });
          session.on("updateAnchors", (anchors) => {
            const map = anchors.reduce((temp, item) => {
              temp[item.id] = item;
              return temp;
            }, {});
            this.planeBox.children.forEach((object) => {
              if (object._id && map[object._id]) {
                const anchor = map[object._id];
                const size = anchor.size;
                if (
                  size &&
                  DEBUG_SIZE &&
                  object._size &&
                  (size.width !== object._size.width ||
                    size.height !== object._size.height)
                ) {
                  this.planeBox.remove(object);
                  this.planeBox.add(object);
                }

                object._id = anchor.id;
                object._size = size;
                updateMatrix(object, anchor.transform);
              }
            });
          });
          session.on("removeAnchors", (anchors) => {
            console.log("removeAnchors");

            const map = anchors.reduce((temp, item) => {
              temp[item.id] = item;
              return temp;
            }, {});
            console.log("map", map);

            if (this.type3 === "png" || this.type3 === "jpg") {
              this.planeBox.children.children.forEach((object) => {
                if (object._id && map[object._id])
                  this.planeBox.children.remove(object);
              });
            } else {
              this.planeBox.children.forEach((object) => {
                if (object._id && map[object._id]) this.planeBox.remove(object);
              });
            }

            // if (this.type3 === "mp4") {
            //   this.vp = null;
            // //   this.decoder.remove();
            // }
            if (this.type3 === "mp4") {
              clearInterval(this.data.drawimage);
              this.video.pause();
              this.setData({ left: "200vw" });
            }
            // if (this.data.type === "png" || this.data.type === "jpg") {
            //   this.scene.remove(this.model2);
            // }
            // if (this.data.type === "png") {
            //   this.planeBox.remove(this.cube);
            // }
          });

          // 平面集合
          const downLoadMp4 = (data) => {
            return new Promise((resolve, reject) => {
              resolve(data);
            });
          };
          const planeBox = (this.planeBox = new THREE.Object3D());
          planeBox.scale.set(1, 1, 1);
          planeBox.rotation.set(-Math.PI / 2, 0, 0);

          this.scene.add(planeBox);
          const mediaFun = async () => {
            for (let i = 0; i < this.data.obsList.length; i++) {
              let markID = await this.addMarker(this.data.obsList[i].mediaUrl);
              const mediaUrl2 = this.data.mediaList.filter(
                (media) => media.parentCode == this.data.obsList[i].mediaCode
              );
              this.setData({ mediaUrl2 });
              let list = [] as any;
              for (let j = 0; j < mediaUrl2.length; j++) {
                const data = "https:" + mediaUrl2[j].mediaUrl;
                const mediaCode = mediaUrl2[j].mediaCode;
                this.setData({ type: data.slice(data.lastIndexOf(".") + 1) });
                const modelList = this.data.modelParamList.filter(
                  (element) => element.mediaCode == mediaCode
                );
                console.log(modelList, "modelListmodelList");
                if (this.data.type === "mp4") {
                  list = [];
                  const mp4 = await downLoadMp4(data);
                  list.push(mp4, this.data.type, modelList);
                  this.data.selectMediaList.push([markID], list);
                } else {
                  try {
                    list = [];
                    const err = await this.loading(data);
                    console.log(err);
                  } catch (error) {
                    console.log(error);
                  }
                  list.push(this.model, this.data.type, modelList, this.model2);
                  this.data.selectMediaList.push([markID], list);
                }
              }
            }
          };
          await mediaFun();
          console.log("successsuccess!");
          console.log(this.data.selectMediaList);
          this.clock = new THREE.Clock();
          // 逐帧渲染
          this.setData({ isShowScan: true });
          //限制调用帧率
          //   let fps = 30;
          //   let fpsInterval = 1000 / fps;
          //   let last = Date.now();

          // 逐帧渲染
          const onFrame = (timestamp) => {
            // let now = Date.now();
            // const mill = now - last;
            // // 经过了足够的时间
            // if (mill > fpsInterval) {
            //   last = now - (mill % fpsInterval); //校正当前时间
            const frame = session.getVKFrame(canvas.width, canvas.height);

            if (frame) {
              this.render(frame);
            }
            // }

            if (this.vp && this.vp.play) {
              // console.log(this.vp)
              this.vp.play(() => {
                // this.playVideoPlane(this.vp.plane3, videoUrl);
                // this.vp = null;
                this.texture.needsUpdate = true;
              });
            }
            //   this.renderer.render(this.scene, this.camera); //执行渲染操作

            //   this.canvas.requestAnimationFrame(this.render2.bind(this));
            session.requestAnimationFrame(onFrame);
          };
          session.requestAnimationFrame(onFrame);
        });
      },

      initTHREE() {
        const platform = new WechatPlatform(this.canvas);
        this.platform = platform;
        platform.enableDeviceOrientation("game");
        THREE.PLATFORM.set(platform);
        this.THREE = THREE;
        // 相机
        this.camera = new THREE.Camera();
        // this.camera = new THREE.PerspectiveCamera( 45, info.windowWidth / info.windowHeight, 1, 1000 );

        // 场景
        const scene = (this.scene = new THREE.Scene());

        // 光源
        const light = new THREE.AmbientLight(0x404040, 1); // soft white light
        scene.add(light);
        let light1 = new THREE.HemisphereLight(0xffffff, 0x444444); // 半球光
        light1.position.set(0, 0.5, 0);
        scene.add(light1);
        const light2 = new THREE.DirectionalLight(0xffffff, 0.1); // 平行光
        light2.position.set(0, 0.2, 0.1);
        scene.add(light2);
        const light3 = new THREE.DirectionalLight(0xffffff, 0.1); // 平行光
        light2.position.set(0, 0.2, -0.1);
        scene.add(light3);
        const light4 = new THREE.DirectionalLight(0xffffff, 0.2); // 平行光
        light2.position.set(0.1, 0.2, 0);
        scene.add(light4);
        const light5 = new THREE.DirectionalLight(0xffffff, 0.2); // 平行光
        light2.position.set(-0.1, 0.2, 0);
        scene.add(light5);
        const light6 = new THREE.DirectionalLight(0xffffff, 0.2); // 平行光
        light2.position.set(0, 0.1, 0);
        scene.add(light6);
        // 渲染层

        const renderer = (this.renderer = new THREE.WebGL1Renderer({
          antialias: true,
          alpha: true,
          canvas: this.canvas,
        }));
        renderer.outputEncoding = THREE.sRGBEncoding;
        //   this.renderer.outputEncoding = THREE.LinearEncoding;
      },
      updateAnimation() {
        const dt = this.clock.getDelta();
        if (this.mixers) this.mixers.forEach((mixer) => mixer.update(dt));
      },
      copyRobot() {
        const THREE = this.THREE;
        if (this.type2 === "glb") {
          const { scene, animations } = cloneGltf(this.model, THREE);
          scene.scale.set(0.05, 0.05, 0.05);
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
          this.model.scale.set(0.05, 0.05, 0.05);
          return this.model;
        }
      },
      getRobot() {
        const THREE = this.THREE;

        const model = new THREE.Object3D();
        model.add(this.copyRobot());

        this._insertModels = this._insertModels || [];
        this._insertModels.push(model);

        if (this._insertModels.length > 5) {
          const needRemove = this._insertModels.splice(
            0,
            this._insertModels.length - 5
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
      loading(data) {
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
          const ojbFun = async () => {
            const mtlLoader = new MTLLoader();
            const objLoader = new OBJLoader();
            const materials = (await mtlLoader.loadAsync(
              "https://techbrood.com/threejs/examples/models/obj/male02/male02.mtl"
            )) as MTLLoader.MaterialCreator;
            materials.preload();
            const object = (await objLoader
              .setMaterials(materials)
              .loadAsync(
                "https://techbrood.com/threejs/examples/models/obj/male02/male02.obj"
              )) as THREE.Group;
            object.position.y = -95;
            console.log(object);
            this.model = object;
            this.model.scale.set(0.05, 0.05, 0.05);
            this.model.rotateX(-Math.PI / 4);
            resolve(object);
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
                // gltf.scene.traverse((obj) => {
                //   if (obj instanceof THREE.Mesh) {
                //     obj.castShadow = true;
                //     obj.receiveShadow = true;
                //     obj.material.minFilter = THREE.NearestFilter;
                //     obj.material.wrapS = obj.material.wrapT =
                //       THREE.ClampToEdgeWrapping;
                //       obj.material.transparent = true;
                //       obj.material.opacity =1
                //       obj.material.side = THREE.DoubleSide;
                //   }
                // });
                gltf.scene.traverse((obj) => {
                  // @ts-ignore
                  if (obj.isMesh) {
                    if (obj.name.slice(0, 5) == "alpha") {
                      console.log("alpa!!!!");
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
                      obj.material.opacity = 0.7;
                      // @ts-ignore

                      obj.material.depthTest = false;
                    } else {
                      // @ts-ignore
                      obj.material.depthTest = true;

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
                      obj.material.opacity = 1;
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
          const stlFun = () => {
            new STLLoader().load(
              data,
              (stl) => {
                console.log(stl);
                const material = new THREE.MeshPhongMaterial({
                  color: 0xff5533,
                  specular: 0x111111,
                  shininess: 200,
                });
                const mesh = new THREE.Mesh(stl, material);

                mesh.position.set(0, -0.25, 0.6);
                mesh.rotation.set(0, -Math.PI / 2, 0);
                mesh.scale.set(5, 5, 5);

                mesh.castShadow = true;
                mesh.receiveShadow = true;
                stl.center();
                this.model = mesh;
                // this.scene.add(mesh)
                resolve(mesh);
              },
              onProgress,
              onErr
            );
          };
          const fbxFun = async () => {
            console.log(this.data.mediaUrl);
            const loader = new FBXLoader();
            const object = await loader.load(
              data,
              (gltf) => {
                console.log(gltf);
                this.model = gltf;
                this.model.traverse((obj) => {
                  // @ts-ignore
                  if (obj.isMesh) {
                    if (obj.name.slice(0, 5) == "alpha") {
                      console.log("alpa!!!!");
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
                      obj.material.opacity = 0.7;
                      // @ts-ignore

                      obj.material.depthTest = false;
                    } else {
                      // @ts-ignore
                      obj.material.depthTest = true;

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
                      obj.material.opacity = 1;
                      // @ts-ignore
                    }
                  }
                }),
                  resolve(mesh);
              },
              onProgress,
              onErr
            );
          };
          const pngFun = async () => {
            try {
                await wx.getImageInfo({
                      src: data,
                     success: async (res) =>{
                        console.log(res)
                        let p = res.width/res.height
                            this.renderer.outputEncoding = THREE.LinearEncoding;
                        let geometry = new THREE.PlaneGeometry(1*p, 1);
                        let loader = new THREE.TextureLoader();
                        const texture = await loader.loadAsync(data);
                        const material = new THREE.MeshBasicMaterial({
                          side: THREE.DoubleSide,
                          map: texture,
                          transparent: true,
                        });
                        material.map = texture;
                        texture.minFilter = THREE.LinearFilter;
                        texture.flipY = false;
                        texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
                        let model = (this.model = new THREE.Mesh(geometry, material));
                        model.traverse(function (node) {
                          if (node instanceof THREE.Mesh) {
                            node.castShadow = true;
                            node.material.map = texture;
                            node.material.emissiveMap = node.material.map;
                            node.material.transparent = true;
                            node.material.needsUpdate = true;
                          }
                        });
                        model.rotation.set(-Math.PI, 0, 0);
                        // model.position.set(0, 0.2, 0);
                        let image = this.canvas.createImage();
                        image.onload = async () => {
                          let geometry = new THREE.PlaneGeometry(1*p, 1);
                          const texture = new THREE.CanvasTexture(image);
                          const material = new THREE.MeshBasicMaterial({
                            side: THREE.DoubleSide,
                            map: texture,
                            transparent: true,
                          });
                          material.map = texture;
                          texture.minFilter = THREE.LinearFilter;
                          texture.format = THREE.RGBAFormat;
                          texture.flipY = false;
                          texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
                          let model2 = (this.model2 = new THREE.Mesh(geometry, material));
                          model2.traverse(function (node) {
                            if (node instanceof THREE.Mesh) {
                              node.castShadow = true;
                              node.material.map = texture;
                              node.material.emissiveMap = node.material.map;
                              node.material.transparent = true;
                              node.material.needsUpdate = true;
                            }
                          });
                          model2.rotation.set(-Math.PI, 0, 0);
                          //   model2.position.set(0, 0.2, 0);
                          //   image.src = ''
                          resolve(model2);
                        };
                        image.onerror = (err) => {
                          console.log(err, "err2");
                        };
                        image.src = data;
                      }
                    })
              
            } catch (error) {
              console.log(error, "err");
            }
          };
          const jpgFun = async () => {
            try {
               await wx.getImageInfo({
                      src: data,
                     success:async (res)=> {
                        console.log(res)
                        let p = res.width/res.height
              this.renderer.outputEncoding = THREE.LinearEncoding;
              let geometry = new THREE.PlaneGeometry(1*p, 1);
              let loader = new THREE.TextureLoader();
               loader.load(
                data,
                (texture) => {
                  const material = new THREE.MeshBasicMaterial({
                    side: THREE.DoubleSide,
                    map: texture,
                    transparent: true,
                  });
                  material.map = texture;
                  texture.minFilter = THREE.NearestFilter;
                  texture.flipY = false;
                  texture.format = THREE.RGBAFormat;
                  texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
                  let model = (this.model = new THREE.Mesh(geometry, material));
                  model.traverse(function (node) {
                    if (node instanceof THREE.Mesh) {
                      node.castShadow = true;
                      node.material.map = texture;
                      node.material.needsUpdate = true;
                      node.material.emissiveMap = node.material.map;
                      node.material.transparent = true;
                    }
                  });

                  model.rotation.set(-Math.PI, 0, 0);
                  // model.position.set(0, 0.2, 0);
                  let image = this.canvas.createImage();
                  image.onload = async () => {
                    let geometry = new THREE.PlaneGeometry(1*p, 1);
                    const texture = new THREE.CanvasTexture(image);
                    const material = new THREE.MeshBasicMaterial({
                      side: THREE.DoubleSide,
                      map: texture,
                      transparent: true,
                    });
                    material.map = texture;
                    texture.minFilter = THREE.LinearFilter;
                    texture.flipY = false;
                    texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
                    let model2 = (this.model2 = new THREE.Mesh(
                      geometry,
                      material
                    ));
                    model2.traverse(function (node) {
                      if (node instanceof THREE.Mesh) {
                        node.castShadow = true;
                        node.material.map = texture;
                        node.material.needsUpdate = true;
                        node.material.emissiveMap = node.material.map;
                        node.material.transparent = true;
                      }
                    });
                    model2.rotation.set(-Math.PI, 0, 0);
                    //   model2.position.set(0, 0.2, 0);
                    resolve(model2);
                    // this.scene.add(model);
                  };
                  image.onerror = () => {};
                  image.src = data;
                },
                undefined,
                onErr
              );
            }})
            } catch (error) {
              console.log(error, "jpgerr");
            }
          };
          try {
            if (this.data.type === "fbx") {
              fbxFun();
            } else if (this.data.type === "obj") {
              ojbFun();
            } else if (this.data.type === "stl") {
              stlFun();
            } else if (this.data.type === "glb") {
              glbFun();
            } else if (this.data.type === "png") {
              pngFun();
            } else if (this.data.type === "jpg") {
              jpgFun();
            }
          } catch (error) {
            console.log(error);
          }
        });
      },
    },
  });
}
