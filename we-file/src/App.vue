<template>
  <div id="app" ref="app">
    <router-view />
  </div>
</template>

<script>
import axios from 'axios'
import qs from 'qs'

axios.get('/api/v1/role/all')
  .then(res => {
    console.log(res)
  })

axios.post('/api/v1/user/sign_in', qs.stringify({
  email: 'we@qq.com',
  password: '123456789'
}))
  .then(res => {
    console.log(res.data)
  })

axios.post('/api/v1/user/sign_up', qs.stringify({
  email: 'string',
  name: 'string',
  password: 'stringst',
  verify_code: 'string'
}))
  .then(res => {
    console.log(res.data)
  })

export default {

}
</script>

<style lang="scss">
@import 'style/index.scss';

#app {
  min-height: 100vh;
}
</style>
