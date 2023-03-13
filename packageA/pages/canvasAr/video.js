const sleep = time => new Promise(resolve => setTimeout(resolve, time))
export default class VideoPlayer {
  constructor(component){
    this.decoder = wx.createVideoDecoder()
    this.component = component
    this.dataUriList = []
  }
  getCanvasNode(id) {
    return new Promise((resolve) => {
      wx.createSelectorQuery()
        .select('#' + id)
        .node(res => resolve(res.node))
        .exec();
    });
  }
  async downLoad(url){
   return new Promise(resolve=>{

    wx.downloadFile({
      url,
      success:res=>{
        wx.compressVideo({
          quality:'low',
              bitrate: 4032,
            fps: 24,
            resolution:0.5,
          src:res.tempFilePath,
          success:result=>{
            resolve(result.tempFilePath)
          },fail:()=>{
            resolve(url)
          }
        })
       
      },
      fail:()=>{
        resolve(url)
      }
    })
   }) 
  }
  async playVideo(id,videoUrl,cb){
    const canvas = await this.getCanvasNode(id)

    const path = await this.downLoad(videoUrl)
    const context = canvas.getContext('2d')

    const render = ({ data, width, height }) => {
      canvas.height = height
      canvas.width = width
      const imageData = canvas.createImageData(data, width, height)
      context.putImageData(imageData, 0, 0)
      let dataURL = canvas.toDataURL()
      if(dataURL){
        cb && cb(dataURL)
      }
      
    }
    console.log('d1')

    let decoder = wx.createVideoDecoder()

    const d = await decoder.start({
      source:path ||videoUrl,
    })

    return Promise.resolve({
      decoder,
      start:true,
      i:0,
      dataUriList:[],
      stop(){
        return decoder.remove()
      },
      play(finish){  
        let imageData = decoder.getFrameData()
        console.log(imageData,'imageData')
        if (imageData){
          this.start = true
          render(imageData)
        } else{
            return
          this.start = false
  
          if(this.decoder){
           this.decoder.remove().then(async () =>{
               console.log('remove')
              finish && finish()
            })
          }
        }
       
       
      }
    }) 

    // await decoder.remove()
  }

}