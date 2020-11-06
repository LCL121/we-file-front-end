<template>
  <div class="user">
    <header class="user-title">
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
    </header>
    <div class="user-main">
      <transition name="nav-transition">
        <nav
          class="user-nav"
          v-show="navShow"
        >
          <router-link
            :to="`/user/user-home?path=${userHomePath}`"
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
            @click.native="judgeisSignOut"
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
    <popup
      v-if="isShowSignOutSlot"
      :determineButton="() => { signOut() }"
      :cancleButton="() => { this.isShowSignOutSlot = false }"
    >
      <p class="popup-name">有文件正在上传/下载中，如果退出任务将会停止</p>
    </popup>
  </div>
</template>

<script>
import store from '@/store'
import { mapState } from 'vuex'
import popup from '@/components/Popup'

export default {
  name: 'User',
  components: {
    popup
  },
  data () {
    return {
      index: 0,
      navShow: false,
      isShowSignOutSlot: false
    }
  },
  computed: {
    userHomePath () {
      return store.state.base.currentDirectory
    }
  },
  methods: {
    changeSeleted (item) {
      this.index = item
      store.commit('base/CHANGE_MY_PROGRESS_STATUS', false)
      if (document.documentElement.clientWidth < 800) this.navShow = false
    },
    showNav () {
      this.navShow = true
    },
    hiddenNav () {
      this.navShow = false
    },
    judgeisSignOut () {
      if (Object.keys(store.state.base.uploadingList).length === 0 &&
        Object.keys(store.state.base.downloadingList).length === 0) {
        store.dispatch('user/signOut')
      } else {
        this.isShowSignOutSlot = true
      }
    },
    signOut () {
      this.isShowSignOutSlot = false
      store.commit('base/CHANGE_MY_PROGRESS_STATUS', false)
      store.dispatch('user/signOut')
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

.popup-name {
  font-size: 15px;
  text-align: center;
}

.user {
  min-height: 100vh;
}
</style>
