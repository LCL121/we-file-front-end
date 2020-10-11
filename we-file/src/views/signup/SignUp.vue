<template>
  <form class="sign-up">
    <div class="fm-input">
      <label for="name"></label>
      <input
        type="text"
        id="name"
        placeholder="用户名"
        pattern=".{1,64}"
        autocomplete
        required
        v-focus
        ref="name"
        v-model="name"
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
      >
    </div>
    <div class="fm-input code-input">
      <label for="code"></label>
      <input
        type="text"
        id="code"
        placeholder="验证码"
        autocomplete
        ref="code"
        v-model="code"
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
    return {
      name: 'lcl',
      password: '123abcABC',
      email: '1391436522@qq.com',
      code: ''
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
    async signUp () {
      if (
        !this.nameState() ||
        !this.emailState() ||
        !this.passwordState() ||
        !this.codeState()
      ) {
        return
      }
      try {
        const { data, status } = await store.dispatch('user/signUp', {
          email: this.email,
          name: this.name,
          password: this.password,
          verify_code: this.code
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
