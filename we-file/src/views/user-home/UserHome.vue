<template>
  <div class="user-home">
    <div class="user-home-nav">user home</div>
    <div class="user-home-list">
      <br>
      <br>
      <br>
      <br>
      <br>
      <br>
      <br>
      <br>
      <br>
      <br>
      <br>
      <br>
      <br>
      <br>
      <br>
      <br>
      <br>
      <br>
      <br>
      <br>
      <br>
      <br>
      <br>
      <br>
      <br>
      <br>
      <br>
      <br>
      <br>
      <br>
      <br>
      <br>
      <br>
      <br>
      <br>
      <br>
      <br>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserHome',
  data () {
    return {
    }
  }
}
</script>

<style scoped lang="scss">
@import "@/style/index.scss";

$nav-height: px2rem(100);

.user-home {
  height: 100%;
  .user-home-nav {
    height: $nav-height;
  }
  .user-home-list {
    height: calc(100% - #{$nav-height});
    overflow-y: auto;
  }
}
</style>
