import axios from 'axios'
import store from '@/store'
import { notyf } from '@/utils/message'

const defaultGroupRoute = '/user/user-group'

const state = {
  groupList: [],
  groupRoute: defaultGroupRoute,
  currentDirectory: '',
  fileList: []
}

const actions = {
  getGroupList ({ commit, state }, data) {
    axios.get('/api/v1/user/group_list', {
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
        commit('SET_GROUP_LIST', data)
      })
      .catch(e => {
        if (e.message.indexOf('timeout') !== -1) {
          notyf.error('目录请求失败')
        } else {
          console.log(e)
          store.dispatch('user/signOut')
        }
      })
  },
  getFileList ({ commit, state }, groupId) {
    axios.get(`/api/v1/user/group/file_list?group_id=${groupId}&directory=${state.currentDirectory}`, {
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
        console.log(data)
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
  SET_GROUP_LIST (state, groupList) {
    state.groupList = groupList
  },
  SET_GROUP_ROUTE (state, groupRoute) {
    state.groupRoute = groupRoute
  },
  SET_CURRENT_DIRECTORY (state, directory) {
    state.currentDirectory = directory
  },
  SET_FILE_LIST (state, fileList) {
    state.fileList = fileList
  },
  CLEAR_FILE_LIST (state) {
    while (state.fileList.length > 0) {
      state.fileList.pop()
    }
  },
  CLEAR_ALL (state) {
    state.groupRoute = defaultGroupRoute
    state.currentDirectory = ''
    while (state.fileList.length > 0) {
      state.fileList.pop()
    }
    while (state.groupList.length > 0) {
      state.groupList.pop()
    }
  }
}

export default {
  namespaced: true,
  state,
  actions,
  mutations
}
