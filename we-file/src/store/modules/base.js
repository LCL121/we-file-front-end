const state = {
  uploadingList: {}
}

const getters = {
}

const actions = {
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
  DELETE_UPLOADING_LIST (state, key) {
    delete state.uploadingList[key]
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
