import axios from 'axios'
import store from '@/store'
import qs from 'qs'

const CancelToken = axios.CancelToken

export const uploadRequest = (
  uploadAddress,
  uploadAuthorization,
  param,
  fileName,
  fileSize,
  currentPath
) => {
  const url = `${uploadAddress}/api/v1/upload`
  axios.request({
    url,
    method: 'POST',
    headers: {
      authorization: uploadAuthorization,
      'Content-Type': 'multipart/form-data'
    },
    data: param,
    onUploadProgress: (event) => {
      store.commit('base/SET_UPLOADING_LIST', {
        key: `${fileName}-${currentPath}`,
        value: {
          fileName,
          fileSize,
          path: currentPath,
          currentValue: event.loaded,
          maxValue: event.total
        }
      })
    },
    cancelToken: new CancelToken((c) => {
      store.commit('base/ADD_UPLOAD_CANCLE', c)
    })
  })
    .then(res => {
      console.log(res)
      store.commit('base/DELETE_UPLOADING_LIST', `${fileName}-${currentPath}`)
      if (Object.keys(store.state.base.uploadingList).length === 0) {
        store.commit('base/CHANGE_MY_PROGRESS_STATUS', false)
      }
      store.dispatch('base/getFileList')
    })
    .catch(e => {
      if (e.toString() !== 'Cancel') {
        console.log(e)
        console.log(e.response)
        store.dispatch('user/signOut')
      }
    })
}

export const multipartUpload = async (
  uploadAddress,
  uploadAuthorization,
  fileSize,
  file
) => {
  // 分块上传初始化接口
  let multiChunkCount = 0
  let multiChunkSize = 0
  let multiFileSize = 0
  let multiUploadId = ''
  const url = `${uploadAddress}/api/v1/multipart_upload/init`
  console.log('分块上传初始化：', url, uploadAuthorization, fileSize)
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

  // 分块上传接口
  const num = 0
  const allChunks = []
  let start = 0
  while (start < multiFileSize) {
    allChunks.push(file.slice(start, start + multiChunkSize))
    start += multiChunkSize
  }

  let max = 4

  return new Promise(resolve => {
    const len = allChunks.length
    let idx = 0
    let counter = 0
    const start = () => {
      while (idx < len && max > 0) {
        max--
        console.log(`第${idx}切片开始发送`)
        const url = `${uploadAddress}/api/v1/multipart_upload`
        const param = new FormData()
        param.append('file', allChunks[idx])
        param.append('chunk_index', idx + 1)
        param.append('upload_id', multiUploadId)
        idx++
        axios.post(url, param, {
          headers: {
            authorization: uploadAuthorization,
            'Content-Type': 'multipart/form-data'
          }
        })
          .then(res => {
            console.log(res)
            max++
            counter++
            if (counter === len) {
              console.log('发送合并')
              const url = `${uploadAddress}/api/v1/multipart_upload/complete`
              axios.post(url, qs.stringify({
                upload_id: multiUploadId
              }), {
                headers: {
                  authorization: uploadAuthorization
                }
              })
                .then(res => {
                  console.log(res)
                  console.log('合并结束')
                })
                .catch(e => {
                  console.log(e)
                  console.log(e.response)
                  console.log(e.response.data)
                })
              resolve()
            } else {
              start()
            }
          })
      }
    }
    start()
  })
}
