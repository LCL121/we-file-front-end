<template>
  <form
    class="sign-in"
    @submit.prevent=""
  >
    <p
      v-if="message"
      class="home-message"
    >{{message}}</p>
    <div class="fm-input">
      <label for="email"></label>
      <input
        type="email"
        id="email"
        placeholder="邮箱"
        autocomplete
        required
        ref="email"
        v-model="email"
        @blur="clearMessage"
      >
    </div>
    <div class="fm-input">
      <label for="password"></label>
      <input
        type="password"
        id="password"
        placeholder="密码 8-64位，包含大小写字母、数字"
        pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[^]{8,64}$"
        required
        ref="password"
        autocomplete
        v-model="password"
        @blur="clearMessage"
      >
    </div>
    <div class="fm-button">
      <button @click="signin">登录</button>
    </div>
  </form>
</template>

<script>
import store from '@/store'

export default {
  name: 'SignIn',
  data () {
    return {
      email: '1391436522@qq.com',
      password: '123abcABC',
      message: ''
    }
  },
  methods: {
    emailState () {
      return this.$refs.email.validity.valid
    },
    passwordState () {
      return this.$refs.password.validity.valid
    },
    clearMessage () {
      if (!this.emailState()) {
        this.message = '请输入正确格式的邮箱'
        return false
      } else if (!this.passwordState()) {
        this.message = '请输入正确格式的密码'
        return false
      } else {
        this.message = ''
        return true
      }
    },
    async signin () {
      if (!this.clearMessage()) return
      try {
        const { data, status } = await store.dispatch('user/signIn', {
          email: this.email,
          password: this.password
        })
        if (status === 200 && store.state.user.userId !== '') {
          if (data.message) {
            console.log(data.message)
            this.message = data.message
          } else {
            this.$router.push({ path: '/user' })
          }
        } else {
          const message = JSON.parse(data.message)
          if (message.detail) {
            this.message = data.message.detail
          } else {
            this.message = data.message
          }
        }
      } catch (err) {
        console.log(err)
        this.message = '发生异常错误，请检查网络连通情况'
      }
    }
  }
}
</script>
