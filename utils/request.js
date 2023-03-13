const baseUrl = "https://www.arsnowslide.com/";
// const baseUrl = "http://192.168.1.8:8081/";

function request(method, url, data) {
  return new Promise((resolve, reject) => {
    let header = {
      "content-type": "application/json",
    };

    wx.request({
      url: baseUrl + url,
      method: method,
      header: header,
      data: method === "POST" ? JSON.stringify(data) : data,
      success: (res) => {
        if (res.data.code === 1000) {
            // wx.hideToast()
          resolve(res.data.data);
        } else {
          wx.showToast({
            title: `${res.data.status}${res.data.error}`,
            icon:'error'
          })
          reject(res);
        }
      },
      fail: (err) => {
        wx.showToast({
            title: `${err.data.status}${err.data.error}`,
            icon:'error'
          })
        reject(err);
      },
    });
  });
}
const code = wx.getStorageSync("userCode");
const API = {
  selProjects: (data) =>
    request("POST", "brounche/resource/selAllProjectsOnWx", data),
  selMediaApps: (data) =>
    request("POST", "brounche/resource/selMediaApps", data),
    selProjectsOnName: (data) =>
    request("POST", `brounche/resource/selProjectsOnName?${data}`),
    selProjectsOnNameByPage: (data) =>
    request("POST", `brounche/resource/selProjectsOnNameByPage?${data}`),
    selProjectsOnCompanyNameByPage: (data) =>
    request("POST", `brounche/resource/selProjectsOnCompanyNameByPage?${data}`),
    getPhone: (data) =>
    request("POST", `brounche/WxUser/getPhone?${data}`),
    sendMsg: (data) =>
    request("POST", `brounche/msg/sms/send?${data}`),
    login: (data) =>
    request("POST", 'brounche/WxUser/login',data),
};
module.exports = {
  API,
};
