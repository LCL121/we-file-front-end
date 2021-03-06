import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './directive'
import './icon/iconfont'

Vue.config.productionTip = false

if (process.env.VUE_APP_TESTAPI) {
  import('./testFiles/tryAPI')
    .then((module) => {
      console.log('已开启Test API 模式！')
      module.tryAPI()
      // module.tryMultipartUpload()
    })
}

if (process.env.VUE_APP_TESTMOBILE) {
  import('./testFiles/testMobile')
    .then(module => {
      console.log('已开启Test Moble 模式！')
      module.testMobile()
    })
}

// <= 500px 手机; <= 800px 平板; > 800px 电脑端
// <= 800px 通过rem; > 800px 通过媒体查询;
if (document.documentElement.clientWidth > 500) {
  document.documentElement.style.fontSize = '100px'
} else {
  document.documentElement.style.fontSize = document.documentElement.clientWidth / 5 + 'px'
}

// console.log = function (thing) {
//   alert(JSON.stringify(thing))
// }

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
