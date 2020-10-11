const state = {
  isMobileView: false
}

const getters = {
}

const actions = {
}

const mutations = {
  SET_IS_MODILE_VIEW: (state, isMobileView) => {
    state.isMobileView = isMobileView
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
