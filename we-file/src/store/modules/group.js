import axios from 'axios'
import store from '@/store'
import { notyf } from '@/utils/message'

const state = {
  groupList: []
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
  }
}

const mutations = {
  SET_GROUP_LIST (state, groupList) {
    state.groupList = groupList
  }
}

export default {
  namespaced: true,
  state,
  actions,
  mutations
}
