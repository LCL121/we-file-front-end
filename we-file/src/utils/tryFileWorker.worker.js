import axios from 'axios'
import qs from 'qs'
import { sha256 } from 'js-sha256'

// 算File 类型的hash
self.addEventListener('message', function (e) {
  // 抽样hash
  console.log('开始抽样hash 计算')
  const { file, uploadAddress, uploadAuthorization } = e.data
  const fileSize = file.size
  const offset = 5 * 1024 * 1024
  const chunks = []
  let cur = 0
  while (cur < fileSize) {
    // 最后一块全部
    if (cur + offset >= fileSize) {
      chunks.push(file.slice(cur, fileSize))
    } else {
      // 前面部分前后各10字节
      const end = cur + offset
      chunks.push(file.slice(cur, cur + 10))
      chunks.push(file.slice(end - 10, end))
    }
    cur += offset
  }
  console.log(chunks)

  const fileReader1 = new FileReader()
  fileReader1.readAsArrayBuffer(new Blob(chunks))
  fileReader1.onload = async function () {
    const fileSamplingHash = sha256(fileReader1.result)
    console.log('抽样hash: ', fileSamplingHash)

    // // 测试快速上传接口
    // const url = `${uploadAddress}/api/v1/upload/try_fast`
    // console.log('快速上传：', url, uploadAuthorization)
    // axios.post(url, qs.stringify({
    //   file_sampling_hash: fileSamplingHash
    // }), {
    //   headers: {
    //     authorization: uploadAuthorization
    //     // 'Content-Type': 'application/x-www-form-urlencoded'
    //   }
    // })
    //   .then(res => {
    //     console.log(res)
    //   })
    //   .catch((e) => {
    //     const data = e.response.data
    //     console.log(data)
    //   })

    // 测试分块上传初始化接口
    let multiChunkCount = 0
    let multiChunkSize = 0
    let multiFileSize = 0
    let multiUploadId = ''
    const url = `${uploadAddress}/api/v1/multipart_upload/init`
    console.log('快速上传：', url, uploadAuthorization, fileSize)
    await axios.post(url, qs.stringify({
      file_size: fileSize.toString()
    }), {
      headers: {
        authorization: uploadAuthorization
      }
    })
      .then(res => {
        console.log(res)
        const data = res.data
        multiChunkCount = data.chunk_count
        multiChunkSize = data.chunk_size
        multiFileSize = data.file_size
        multiUploadId = data.upload_id
      })

    console.log(multiChunkCount, multiChunkSize, multiFileSize, multiUploadId)

    // 测试分块上传接口
    let num = 0
    const allChunks = []
    let start = 0
    while (start < multiFileSize) {
      allChunks.push(file.slice(start, start + multiChunkSize))
      start += multiChunkSize
    }
    if (allChunks.length === multiChunkCount) {
      allChunks.forEach((chunk, index) => {
        const url = `${uploadAddress}/api/v1/multipart_upload`
        const param = new FormData()
        param.append('file', chunk)
        param.append('chunk_index', index + 1)
        param.append('upload_id', multiUploadId)
        axios.post(url, param, {
          headers: {
            authorization: uploadAuthorization,
            'Content-Type': 'multipart/form-data'
          }
        })
          .then(res => {
            console.log(res.data)
            num++
            if (num === multiChunkCount) {
              const url = `${uploadAddress}/api/v1/multipart_upload/complete`
              axios.post(url, qs.stringify({
                upload_id: multiUploadId
              }), {
                headers: {
                  authorization: uploadAuthorization
                }
              })
                .then(res => {
                  console.log('之前的authorization: ', uploadAuthorization)
                  console.log(res.headers)
                })
                .catch(e => {
                  console.log(e)
                  console.log(e.response)
                  console.log(e.response.data)
                })
            }
          })
      })
    }
  }
})
