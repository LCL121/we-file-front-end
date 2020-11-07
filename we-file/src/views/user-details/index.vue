<template>
  <div class="user-details">
    <div class="user-item" v-for="item in userInfo" :key="item.text">
      <span>{{item.text}}</span>
      <span>{{item.value}}</span>
    </div>
  </div>
</template>

<script>
import store from '@/store'

export default {
  name: 'UserDetails',
  computed: {
    userInfo () {
      return [
        {
          text: '邮箱',
          value: store.state.user.email
        },
        {
          text: '昵称',
          value: store.state.user.name
        },
        {
          text: '权限',
          value: store.state.user.roleName
        },
        {
          text: '用户ID',
          value: store.state.user.userId
        }
      ]
    }
  }
}
</script>

<style scoped lang="scss">
@import "@/style/index.scss";

.user-details {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate3d(-50%, -50%, 0);
  cursor: default;
  min-width: px2rem(350);

  .user-item{
    height: px2rem(40);
    line-height: px2rem(40);

    span:nth-child(1) {
      display: inline-block;
      width: px2rem(80);
    }
  }
}
</style>
