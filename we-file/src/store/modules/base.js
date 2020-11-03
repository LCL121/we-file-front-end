import store from '@/store'
import router from '@/router'
import axios from 'axios'

const state = {
  currentDirectory: '',
  uploadingList: {},
  fileList: [],
  isShowUploadProgress: false
}

const getters = {
}

const actions = {
  getFileList ({ commit, state }, data) {
    axios.get(`/api/v1/file_list/${store.state.user.userId}?directory=${state.currentDirectory}`)
      .then(res => {
        const data = res.data
        console.log(data)
        if (data.message) {
          if (data.message === 'valid session') {
            store.dispatch('user/signOut')
            router.push('/')
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
        console.log(e)
        store.dispatch('user/signOut')
        router.push('/')
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
  SET_CURRENT_DIRECTORY (state, directory) {
    state.currentDirectory = directory
  },
  SET_FILE_LIST (state, fileList) {
    state.fileList = fileList
  },
  SET_SHOW_UPLOAD_PROGRESS (state, isShowUploadProgress) {
    state.isShowUploadProgress = isShowUploadProgress
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
