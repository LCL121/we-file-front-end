import axios from 'axios'

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
      axios.get('/api/v1/user/sign_in')
        .then((res) => {
          if (res.status === 200) {
            const {
              email,
              name,
              profile,
              role_id: roleId,
              role_name: roleName,
              user_id: userId
            } = res.data

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
          reject(error)
        })
    })
  },
  // 注册
  signUp ({ commit, state }, data) {
    return new Promise((resolve, reject) => {
      axios.get('/api/v1/user/sign_up')
        .then((res) => {
          if (res.status === 200) {
            const {
              email,
              name,
              profile,
              role_id: roleId,
              role_name: roleName,
              user_id: userId
            } = res.data

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
          reject(error)
        })
    })
  },
  // 退出
  signOut ({ commit, state }) {
    commit('SET_EMAIL', '')
    commit('SET_NAME', '')
    commit('SET_PROFILE', '')
    commit('SET_ROLE_ID', '')
    commit('SET_ROLE_NAME', '')
    commit('SET_USER_ID', '')
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
