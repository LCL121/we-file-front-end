import axios from 'axios'
import qs from 'qs'

const tryAPI = async () => {
  // 测试role/all 接口
  // await axios.get('/api/v1/role/all')
  //   .then(res => {
  //     console.log(res)
  //   })

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

  // 测试注册接口
  // await axios.post('/api/v1/user/sign_up', qs.stringify({
  //   email: 'string',
  //   name: 'string',
  //   password: 'stringst',
  //   verify_code: 'string'
  // }))
  //   .then(res => {
  //     console.log(res.data)
  //   })

  // 测试获取目录接口
  let directory = null
  await axios.get(`/api/v1/file_list/${userId}?directory=/`)
    .then(res => {
      console.log(res)
      directory = res.data
    })

  const file1 = directory.files[0]

  // 测试获取下载地址接口
  let downloadAddress = ''
  let downloadAuthorization = ''
  await axios.get(`/api/v1/download_address/${userId}?file_id=${file1.file_id}&file_name=${file1.file_name}&directory=${directory.directory}`)
    .then(res => {
      console.log(res)
      downloadAddress = res.data.address
      downloadAuthorization = res.headers.authorization
    })

  // 测试下载功能
  await axios.request({
    url: downloadAddress,
    method: 'GET',
    headers: {
      authorization: downloadAuthorization
    }
  })
    .then(res => {
      console.log(res.data)
    })

  // 测试上传功能
  const inputDom = document.createElement('input')
  inputDom.accept = 'image/png,image/gif,image/jpeg,txt'
  inputDom.type = 'file'
  inputDom.onchange = async function (e) {
    const file = e.target.files[0]
    const param = new FormData() // 创建form对象
    param.append('file', file)// 通过append向form对象添加数据
    console.log(param.get('file')) // FormData私有类对象，访问不到，通过get判断值是否传进去

    // 测试获取上传地址接口
    let uploadAddress = ''
    let uploadAuthorization = ''
    await axios.get(`/api/v1/upload_address/${userId}?file_name=${file.name}&directory=/`)
      .then(res => {
        console.log(res)
        uploadAddress = res.data.address
        uploadAuthorization = res.headers.authorization
      })

    const url = `${uploadAddress}/api/v1/upload`
    console.log(url, uploadAuthorization)
    axios.request({
      url,
      method: 'POST',
      headers: {
        authorization: uploadAuthorization,
        'Content-Type': 'multipart/form-data'
      },
      data: param
    })
      .then(res => {
        console.log(res)
      })
  }
  document.body.appendChild(inputDom)
}

tryAPI()
