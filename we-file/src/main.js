import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './directive'
import './icon/iconfont'

if (process.env.VUE_APP_TESTAPI) {
  import('./utils/tryAPI')
    .then((module) => {
      console.log('已开启Test API 模式！')
      module.tryAPI()
    })
}

Vue.config.productionTip = false

// width 500px 为准 并以其区分mobile 和 pc
if (document.documentElement.clientWidth > 500) {
  document.documentElement.style.fontSize = '100px'
} else {
  document.documentElement.style.fontSize = document.documentElement.clientWidth / 5 + 'px'
  store.commit('base/SET_IS_MODILE_VIEW', true)
}

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
