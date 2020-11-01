<template>
  <div class="user">
    <div class="user-title">
      <div
        class="nav-button"
        @click="showNav"
      >
        <svg
          class="icon"
          aria-hidden="true"
        >
          <use xlink:href="#icon-daohang"></use>
        </svg>
      </div>
      WeFile
    </div>
    <div class="user-main">
      <transition name="nav-transition">
        <nav
          class="user-nav"
          v-show="navShow"
        >
          <router-link
            to="/user/user-home"
            :class="{selected: index === 0}"
            @click.native="changeSeleted(0)"
          >我的云盘</router-link>
          <router-link
            to="/user/user-details"
            :class="{selected: index === 1}"
            @click.native="changeSeleted(1)"
          >个人中心</router-link>
          <router-link
            to=""
            @click.native="signOut"
          >退出登录</router-link>
        </nav>
      </transition>
      <div class="user-main-view">
        <router-view />
      </div>
    </div>
    <div
      class="user-mask"
      v-show="navShow"
      @click="hiddenNav"
    ></div>
  </div>
</template>

<script>
import store from '@/store'
import { mapState } from 'vuex'

export default {
  name: 'User',
  data () {
    return {
      index: 0,
      navShow: true
    }
  },
  methods: {
    changeSeleted (item) {
      this.index = item
      this.navShow = false
    },
    showNav () {
      this.navShow = true
    },
    hiddenNav () {
      this.navShow = false
    },
    signOut () {
      store.dispatch('user/signOut')
      this.$router.push('/')
    }
  },
  beforeRouteEnter (to, from, next) {
    if (store.state.user.userId === '') {
      next('/signin')
    }
    next()
  }
}
</script>

<style scoped lang="scss">
@import "./style/transition.scss";
@import "./style/pc.scss";
@import "./style/mobile.scss";

.user {
  min-height: 100vh;
}
</style>
