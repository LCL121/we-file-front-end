<template>
  <div class="home">
    <h1>WeFile</h1>
    <div class="main">
      <div class="center">
        <nav>
          <router-link
            to="/signin"
            :class="{selected: index === 0}"
            @click.native="changeSeleted(0)"
          >登录</router-link>
          <router-link
            to="/signup"
            @click.native="changeSeleted(1)"
            :class="{selected: index === 1}"
          >注册</router-link>
        </nav>
        <router-view />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home',
  data () {
    return {
      index: 0
    }
  },
  methods: {
    changeSeleted (item) {
      this.index = item
    }
  },
  mounted () {
    const fullPath = this.$route.fullPath
    if (fullPath === '/signin') {
      this.index = 0
    } else if (fullPath === '/signup') {
      this.index = 1
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/style/index.scss";

$homeCenter: px2rem(380);

.selected {
  border-bottom: 2px black solid;
}

.home {
  background: gray;
  min-height: 100vh;
  display: flex;
  flex-direction: column;

  h1 {
    margin: 0;
    padding-top: px2rem(20);
    cursor: default;
    @include textCenter(px2rem(60));
  }

  .main {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    .center {
      height: $homeCenter;
      width: $homeCenter;
      padding: px2rem(25);
      box-sizing: border-box;
      background: hsla(0, 0%, 100%, 0.7);

      nav {
        display: flex;
        margin-bottom: px2rem(20);

        a {
          flex: 1;
          margin: 0 px2rem(20);
          font-weight: 700;
          box-sizing: border-box;
          @include textCenter(px2rem(40));
        }
      }
    }
  }
}
</style>
