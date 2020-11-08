import store from '@/store'
import axios from 'axios'
import { notyf } from '@/utils/message'

const state = {
  currentDirectory: '',
  fileList: [],
  isShowMyProgress: false,
  uploadingList: {},
  uploadCancleList: [],
  downloadingList: {},
  downloadCancleList: []
}

const actions = {
  getFileList ({ commit, state }, data) {
    axios.get(`/api/v1/user/file_list?directory=${state.currentDirectory}`, {
      timeout: 5000
    })
      .then(res => {
        const data = res.data
        console.log(data)
        if (data.message) {
          if (data.message === 'valid session') {
            store.dispatch('user/signOut')
            return
          }
        }
        const fileList = data.files.sort((a, b) => {
          if (a.is_directory && !b.is_directory) return -1
          else return 1
        })
        commit('SET_FILE_LIST', fileList)
      })
      .catch(e => {
        if (e.message.indexOf('timeout') !== -1) {
          notyf.error('目录请求失败')
        } else {
          console.log(e)
          store.dispatch('user/signOut')
        }
      })
  }
}

const mutations = {
  /**
   * 更新 uploadingList
   * @param {object} uploadingItem {key, value}
   */
  SET_UPLOADING_LIST (state, uploadingItem) {
    const newData = JSON.parse(JSON.stringify(state.uploadingList))
    newData[uploadingItem.key] = uploadingItem.value
    state.uploadingList = newData
  },
  /**
   * 删除 uploadingList 中已完成的项目
   * @param {*} key
   */
  DELETE_UPLOADING_LIST (state, key) {
    delete state.uploadingList[key]
  },
  DELETE_ALL_UPLOADING_LIST (state) {
    for (const key of Object.keys(state.uploadingList)) {
      delete state.uploadingList[key]
    }
  },
  /**
   * 更新 downloadingList
   * @param {object} downloadingItem {key, value}
   */
  SET_DOWNLOADING_LIST (state, downloadingItem) {
    const newData = JSON.parse(JSON.stringify(state.downloadingList))
    newData[downloadingItem.key] = downloadingItem.value
    state.downloadingList = newData
  },
  /**
   * 删除 downloadingList 中已完成的项目
   * @param {*} key
   */
  DELETE_DOWNLOADING_LIST (state, key) {
    delete state.downloadingList[key]
  },
  DELETE_ALL_DOWNLOADING_LIST (state) {
    for (const key of Object.keys(state.downloadingList)) {
      delete state.downloadingList[key]
    }
  },
  SET_CURRENT_DIRECTORY (state, directory) {
    state.currentDirectory = directory
  },
  SET_FILE_LIST (state, fileList) {
    state.fileList = fileList
  },
  CHANGE_MY_PROGRESS_STATUS (state, isShowMyProgress) {
    state.isShowMyProgress = isShowMyProgress
  },
  ADD_UPLOAD_CANCLE (state, uploadCancle) {
    state.uploadCancleList.push(uploadCancle)
  },
  DELETE_ALL_UPLOAD_CANCLE (state) {
    while (state.uploadCancleList.length > 0) {
      state.uploadCancleList.pop()
    }
  },
  ADD_DOWNLOAD_CANCLE (state, downloadCancle) {
    state.downloadCancleList.push(downloadCancle)
  },
  DELETE_ALL_DOWNLOAD_CANCLE (state) {
    while (state.downloadCancleList.length > 0) {
      state.downloadCancleList.pop()
    }
  },
  CLEAR_ALL (state) {
    const uploadCancleList = state.uploadCancleList
    const downloadCancleList = state.downloadCancleList
    if (uploadCancleList.length !== 0) {
      for (const uploadCancle of uploadCancleList) {
        uploadCancle()
      }
      // 清理uploadingList
      for (const key of Object.keys(state.uploadingList)) {
        delete state.uploadingList[key]
      }
      state.isShowMyProgress = false
      // 清理uploadCancleList
      while (state.uploadCancleList.length > 0) {
        state.uploadCancleList.pop()
      }
    }
    if (downloadCancleList.length !== 0) {
      for (const downloadCancle of downloadCancleList) {
        downloadCancle()
      }
      // 清理downloadingList
      for (const key of Object.keys(state.downloadingList)) {
        delete state.downloadingList[key]
      }
      state.isShowMyProgress = false
      // 清理downloadCancleList
      while (state.downloadCancleList.length > 0) {
        state.downloadCancleList.pop()
      }
    }

    state.currentDirectory = ''
    // 清理fileList
    while (state.fileList.length > 0) {
      state.fileList.pop()
    }
  }
}

export default {
  namespaced: true,
  state,
  actions,
  mutations
}
