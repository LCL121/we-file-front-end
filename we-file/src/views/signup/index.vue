<template>
  <form
    class="sign-up"
    @submit.prevent=""
  >
    <p
      v-if="message"
      class="home-message"
    >{{message}}</p>
    <div class="fm-input">
      <label for="name"></label>
      <input
        type="text"
        id="name"
        placeholder="用户名"
        pattern=".{1,64}"
        autocomplete
        required
        ref="name"
        v-model="name"
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
        autocomplete
        required
        ref="password"
        v-model="password"
        @blur="clearMessage"
      >
    </div>
    <div class="fm-input">
      <label for="mailbox"></label>
      <input
        type="email"
        id="mailbox"
        placeholder="邮箱"
        autocomplete
        required
        ref="email"
        v-model="email"
        @blur="clearMessage"
      >
    </div>
    <div class="fm-input code-input" v-if="false">
      <label for="code"></label>
      <input
        type="text"
        id="code"
        placeholder="验证码"
        autocomplete
        ref="code"
        v-model="code"
        @blur="clearMessage"
      >
      <button class="code-button">获取验证码</button>
    </div>
    <div class="fm-button">
      <button @click="signUp">注册</button>
    </div>
  </form>
</template>

<script>
import store from '@/store'

export default {
  name: 'SignUp',
  data () {
    // return {
    //   name: 'lcl',
    //   password: '123abcABC',
    //   email: '1391436522@qq.com',
    //   code: '',
    //   message: ''
    // }
    return {
      name: '',
      password: '',
      email: '',
      code: '',
      message: ''
    }
  },
  methods: {
    nameState () {
      return this.$refs.name.validity.valid
    },
    passwordState () {
      return this.$refs.password.validity.valid
    },
    emailState () {
      return this.$refs.email.validity.valid
    },
    codeState () {
      return true
      // return this.$refs.code.validity.valid
    },
    clearMessage () {
      if (!this.nameState()) {
        this.message = '请输入正确格式的用户名'
        return false
      } else if (!this.emailState()) {
        this.message = '请输入正确格式的邮箱'
        return false
      } else if (!this.passwordState()) {
        this.message = '请输入正确格式的密码'
        return false
      } else if (!this.codeState()) {
        this.message = '请输入正确格式的验证码'
        return false
      } else {
        this.message = ''
        return true
      }
    },
    async signUp () {
      if (!this.clearMessage()) return
      try {
        const { data, status } = await store.dispatch('user/signUp', {
          email: this.email,
          name: this.name,
          password: this.password,
          verify_code: this.code
        })
        if (status === 200 && store.state.user.userId !== '') {
          if (data.message) {
            console.log(data.message)
            this.message = data.message
          } else {
            this.$router.push({ path: '/user' })
          }
        } else {
          this.message = data.message
        }
      } catch (err) {
        console.log(err)
        this.message = '发生异常错误，请检查网络连通情况'
      }
    }
  }
}
</script>

<style scoped lang="scss">
@import "@/style/index.scss";

.code-input {
  .code-button {
    position: absolute;
    @include textCenter(px2rem(38));
    transform: translateX(-120%);
    background: #f9f9f9;
    top: px2rem(1);
    font-size: 13px;
    color: #6c6c6c;
    cursor: pointer;
  }
}
</style>
