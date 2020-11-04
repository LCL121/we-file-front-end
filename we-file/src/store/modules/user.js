import axios from 'axios'
import qs from 'qs'
import store from '@/store'
import router from '@/router'

const state = {
  token: '',
  email: '',
  name: '',
  profile: '',
  roleId: '',
  roleName: '',
  userId: ''
}

const getters = {
}

const actions = {
  // 登录
  signIn ({ commit, state }, data) {
    return new Promise((resolve, reject) => {
      axios.post('/api/v1/user/sign_in', qs.stringify({
        email: data.email,
        password: data.password
      }), {
        timeout: 5000
      })
        .then((res) => {
          console.log(res)
          if (res.status === 200) {
            if (res.data.message) {
              resolve({ data: res.data, status: 200 })
              return
            }
            const data = res.data
            data.user_id = BigInt(data.user_id).toString()
            localStorage.setItem('userInfo', JSON.stringify(data))

            const {
              csrf_token: token,
              email,
              name,
              profile,
              role_id: roleId,
              role_name: roleName,
              user_id: userId
            } = data

            commit('SET_TOKEN', token)
            commit('SET_EMAIL', email)
            commit('SET_NAME', name)
            commit('SET_PROFILE', profile)
            commit('SET_ROLE_ID', roleId)
            commit('SET_ROLE_NAME', roleName)
            commit('SET_USER_ID', userId)

            resolve({ data: res.data, status: 200 })
          } else {
            resolve({ data: res.data, status: res.status })
          }
        })
        .catch(error => {
          console.log(error)
          reject(error)
        })
    })
  },

  // 注册
  signUp ({ commit, state }, data) {
    return new Promise((resolve, reject) => {
      axios.post('/api/v1/user/sign_up', qs.stringify({
        email: data.email,
        name: data.name,
        password: data.password,
        verify_code: data.verify_code
      }), {
        timeout: 5000
      })
        .then((res) => {
          if (res.status === 200) {
            if (res.data.message) {
              resolve({ data: res.data, status: 200 })
              return
            }
            const data = res.data
            data.user_id = BigInt(data.user_id).toString()
            localStorage.setItem('userInfo', JSON.stringify(data))

            const {
              csrf_token: token,
              email,
              name,
              profile,
              role_id: roleId,
              role_name: roleName,
              user_id: userId
            } = res.data

            commit('SET_TOKEN', token)
            commit('SET_EMAIL', email)
            commit('SET_NAME', name)
            commit('SET_PROFILE', profile)
            commit('SET_ROLE_ID', roleId)
            commit('SET_ROLE_NAME', roleName)
            commit('SET_USER_ID', userId)

            resolve({ data: res.data, status: 200 })
          } else {
            resolve({ data: res.data, status: res.status })
          }
        })
        .catch(error => {
          console.log(error)
          reject(error)
        })
    })
  },

  // 退出
  async signOut ({ commit, state }) {
    const uploadCancleList = store.state.base.uploadCancleList
    const downloadCancleList = store.state.base.downloadCancleList
    if (uploadCancleList.length !== 0) {
      for (const uploadCancle of uploadCancleList) {
        uploadCancle()
      }
      store.commit('base/DELETE_ALL_UPLOADING_LIST')
      store.commit('base/CHANGE_MY_PROGRESS_STATUS', false)
      store.commit('base/DELETE_ALL_UPLOAD_CANCLE')
    }
    if (downloadCancleList.length !== 0) {
      for (const downloadCancle of downloadCancleList) {
        downloadCancle()
      }
      store.commit('base/DELETE_ALL_DOWNLOADING_LIST')
      store.commit('base/CHANGE_MY_PROGRESS_STATUS', false)
      store.commit('base/DELETE_ALL_DOWNLOAD_CANCLE')
    }
    localStorage.removeItem('userInfo')
    commit('SET_EMAIL', '')
    commit('SET_NAME', '')
    commit('SET_PROFILE', '')
    commit('SET_ROLE_ID', '')
    commit('SET_ROLE_NAME', '')
    commit('SET_USER_ID', '')
    router.push('/')
  }
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_EMAIL: (state, email) => {
    state.email = email
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_PROFILE: (state, profile) => {
    state.profile = profile
  },
  SET_ROLE_ID: (state, roleId) => {
    state.roleId = roleId
  },
  SET_ROLE_NAME: (state, roleName) => {
    state.roleName = roleName
  },
  SET_USER_ID: (state, userId) => {
    state.userId = userId
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
