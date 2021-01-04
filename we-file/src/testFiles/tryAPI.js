import axios from 'axios'
import qs from 'qs'
import FileWorker from './tryFileWorker.worker.js'

const downloadFile = (name, blob) => {
  const a = document.createElement('a')
  a.download = name
  a.href = blob
  a.click()
}

// 第一波：基本API测试
export const tryAPI = async () => {
  console.log('开始调用 tryAPI 函数')

  // // 测试role/all 接口
  // await axios.get('/api/v1/role/all')
  //   .then(res => {
  //     console.log(res)
  //   })

  // 测试注册接口
  // await axios.post('/api/v1/user/sign_up', qs.stringify({
  //   email: '1391436522@qq.com',
  //   name: 'string',
  //   password: '123abcABC',
  //   verify_code: 'string'
  // }))
  //   .then(res => {
  //     console.log(res.data)
  //   })

  // 测试登录接口
  let userId = 0
  await axios.post('/api/v1/user/sign_in', qs.stringify({
    email: '1391436522@qq.com',
    password: '123abcABC'
  }))
    .then(res => {
      console.log(res.data)
      userId = BigInt(res.data.user_id)
    })

  // 测试获取目录接口
  let directory = null
  await axios.get(`/api/v1/user/file_list/${userId}?directory=/`)
    .then(res => {
      console.log(res)
      directory = res.data
    })
  console.log(directory)

  const file1 = directory.files[1]
  console.log('fileId: ', BigInt(file1.file_id))

  // 测试获取下载地址接口
  let downloadAddress = ''
  let downloadAuthorization = ''
  await axios.get(`/api/v1/user/download_address/${userId}?file_id=${BigInt(file1.file_id)}&file_name=${file1.file_name}&directory=${directory.directory}`)
    .then(res => {
      console.log(res)
      downloadAddress = res.data.address
      downloadAuthorization = res.headers.authorization
    })

  console.log(downloadAuthorization)

  // // 测试下载功能
  // 使用fetch
  await fetch(`${downloadAddress}/api/v1/download`, {
    method: 'GET',
    headers: {
      authorization: downloadAuthorization
    }
  })
    .then(res => res.blob())
    .then(data => {
      const blobURL = window.URL.createObjectURL(data)
      downloadFile(file1.file_name, blobURL)
    })

  // 使用axios
  // await axios.request({
  //   url: `${downloadAddress}/api/v1/download`,
  //   method: 'GET',
  //   headers: {
  //     authorization: downloadAuthorization
  //   },
  //   responseType: 'blob'
  // })
  //   .then(res => {
  //     // console.log(res)
  //     // console.log(res.headers)
  //     // console.log(res.data)
  //     const blob = new Blob([res.data])
  //     const blobURL = window.URL.createObjectURL(blob)
  //     downloadFile(file1.file_name, blobURL)
  //   })

  // // 测试上传功能
  // const inputDom = document.createElement('input')
  // inputDom.accept = 'image/png,image/gif,image/jpeg,.txt'
  // inputDom.type = 'file'
  // document.body.appendChild(inputDom)
  // inputDom.onchange = async function (e) {
  //   const file = e.target.files[0]
  //   const param = new FormData() // 创建form对象
  //   param.append('file', file)// 通过append向form对象添加数据
  //   console.log(param.get('file')) // FormData私有类对象，访问不到，通过get判断值是否传进去

  //   // 测试获取上传地址接口
  //   let uploadAddress = ''
  //   let uploadAuthorization = ''
  //   await axios.get(`/api/v1/user/upload_address/${userId}?file_name=${file.name}&directory=/`)
  //     .then(res => {
  //       console.log(res)
  //       uploadAddress = res.data.address
  //       uploadAuthorization = res.headers.authorization
  //     })

  //   const url = `${uploadAddress}/api/v1/upload`
  //   console.log(url, uploadAuthorization)
  //   axios.request({
  //     url,
  //     method: 'POST',
  //     headers: {
  //       authorization: uploadAuthorization,
  //       'Content-Type': 'multipart/form-data'
  //     },
  //     data: param
  //   })
  //     .then(res => {
  //       console.log(res)
  //     })
  //     .catch((e) => {
  //       const data = e.response.data
  //       console.log(JSON.stringify(data))
  //     })
  // }
}

// 第二波：大文件分块上传API测试
export const tryMultipartUpload = async () => {
  console.log('开始调用 tryMultipartUpload 函数')

  // 测试登录接口
  let userId = 0
  await axios.post('/api/v1/user/sign_in', qs.stringify({
    email: 'we@qq.com',
    password: '123456789'
  }))
    .then(res => {
      console.log(res.data)
      userId = BigInt(res.data.user_id)
    })

  const inputDom = document.createElement('input')
  inputDom.accept = 'image/png,image/gif,image/jpeg,.zip,.txt,.mp4'
  inputDom.type = 'file'
  document.body.appendChild(inputDom)
  inputDom.onchange = async function (e) {
    const file = e.target.files[0]
    const fileWorker = new FileWorker()
    const param = new FormData() // 创建form对象
    param.append('file', file)// 通过append向form对象添加数据
    console.log(param.get('file')) // FormData私有类对象，访问不到，通过get判断值是否传进去

    // 测试获取上传地址接口
    let uploadAddress = ''
    let uploadAuthorization = ''
    await axios.get(`/api/v1/user/upload_address/${userId}?file_name=${file.name}&directory=/`)
      .then(res => {
        console.log(res)
        uploadAddress = res.data.address
        uploadAuthorization = res.headers.authorization
      })

    fileWorker.postMessage({ file, uploadAddress, uploadAuthorization })
  }
}
