import axios from 'axios'
import store from '@/store'
import qs from 'qs'
import { notyf } from '@/utils/message'

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
      store.commit('base/DELETE_UPLOADING_LIST', `${fileName}-${currentPath}`)
      if (Object.keys(store.state.base.uploadingList).length === 0) {
        store.commit('base/CHANGE_MY_PROGRESS_STATUS', false)
      }
    })
}

export const multipartUpload = async (
  uploadAddress,
  uploadAuthorization,
  file,
  fileSize,
  fileName,
  currentPath
) => {
  // uploading list
  const uploadingItem = {
    key: `${fileName}-${currentPath}`,
    value: {
      fileName,
      fileSize,
      path: currentPath,
      currentValue: 0,
      maxValue: fileSize
    }
  }

  // 监听上传的进度
  // 格式：chunkIndex: currentLoaded
  const watchHttps = new Proxy([], {
    get: (arr, idx) => {
      return arr[idx]
    },
    set: (arr, idx, value) => {
      if (arr[idx] === value) return
      arr[idx] = value
      const current = arr.reduce((pre, cur) => pre + cur)
      uploadingItem.value.currentValue = current > fileSize ? fileSize : current
      store.commit('base/SET_UPLOADING_LIST', uploadingItem)
      return true
    }
  })

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
    .catch(e => {
      notyf.error('文件上传失败')
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

  const len = allChunks.length
  let idx = 0
  let counter = 0
  const startSend = () => {
    while (idx < len && max > 0) {
      const index = idx++
      max--
      console.log(`第${index}切片开始发送`)
      const url = `${uploadAddress}/api/v1/multipart_upload`
      const param = new FormData()
      param.append('file', allChunks[index])
      param.append('chunk_index', index + 1)
      param.append('upload_id', multiUploadId)
      axios.post(url, param, {
        headers: {
          authorization: uploadAuthorization,
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (event) => {
          watchHttps[index] = event.loaded
        },
        cancelToken: new CancelToken((c) => {
          store.commit('base/ADD_UPLOAD_CANCLE', c)
        })
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
                store.commit('base/DELETE_UPLOADING_LIST', `${fileName}-${currentPath}`)
                if (Object.keys(store.state.base.uploadingList).length === 0) {
                  store.commit('base/CHANGE_MY_PROGRESS_STATUS', false)
                }
                store.dispatch('base/getFileList')
              })
              .catch(e => {
                console.log(e)
                console.log(e.response)
                console.log(e.response.data)
                notyf.error('文件上传失败')
              })
          } else {
            startSend()
          }
        })
        .catch(e => {
          if (e.toString() !== 'Cancel') {
            console.log(e)
            console.log(e.response)
            store.dispatch('user/signOut')
          }
        })
    }
  }
  startSend()
}
