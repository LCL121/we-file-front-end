<template>
  <form class="sign-in">
    <div class="fm-input">
      <label for="email"></label>
      <input
        type="email"
        id="email"
        v-focus
        placeholder="邮箱"
        autocomplete
        required
        ref="email"
        v-model="email"
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
      >
    </div>
    <div class="fm-button">
      <button
        type="submit"
        @click="signin"
      >登录</button>
    </div>
  </form>
</template>

<script>
import axios from 'axios'
import store from '@/store'

export default {
  name: 'SignIn',
  data () {
    return {
      email: '1391436522@qq.com',
      password: '123abcABC'
    }
  },
  methods: {
    emailState () {
      return this.$refs.email.validity.valid
    },
    passwordState () {
      return this.$refs.password.validity.valid
    },
    async signin () {
      if (
        !this.emailState() ||
        !this.passwordState()
      ) {
        return
      }
      try {
        const { data, status } = await store.dispatch('user/signIn', {
          email: this.email,
          password: this.password
        })
        if (status === 200) {
          this.$router.push({ path: '/user' })
        }
      } catch (err) {
        console.log(err)
      }
    }
  }
}
</script>
