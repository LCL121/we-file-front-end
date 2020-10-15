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
      downloadAuthorization = res.data.authorization
    })

  // 测试获取上传地址接口
  // let downloadAddress = ''
  // let downloadAuthorization = ''
  // await axios.get(`/api/v1/upload_address/${userId}?file_name=${file1.file_name}&directory=${directory.directory}`)
  //   .then(res => {
  //     console.log(res)
  //     downloadAddress = res.data.address
  //     downloadAuthorization = res.data.authorization
  //   })

  await axios.request({
    url: downloadAddress,
    method: 'GET',
    headers: {
      authorization: downloadAuthorization
    }
  })
}

tryAPI()
