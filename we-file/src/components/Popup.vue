<template>
  <div class="popup">
    <div class="center">
      <slot></slot>
      <div class="buttons">
        <button
          class="button-determine"
          @click="determineButton"
        >确定</button>
        <button
          class="button-cancel"
          @click="cancleButton"
        >取消</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Popup',
  props: ['text', 'determineButton', 'cancleButton']
}
</script>

<style scoped lang="scss">
@import "@/style/index.scss";

.popup {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;

  .center {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  cursor: default;
  background: #fff;
  padding: px2rem(10);
  box-sizing: border-box;
  box-shadow: px2rem(-4) px2rem(4) px2rem(6) px2rem(2) rgba(0, 0, 0, 0.05),
    px2rem(4) px2rem(-4) px2rem(6) px2rem(2) rgba(0, 0, 0, 0.05);
  width: px2rem(400);
  height: px2rem(240);
  border-radius: $default-border-radius;

  .buttons {
    display: flex;
    justify-content: space-around;

    button {
      flex: 1;
      max-width: px2rem(100);
      height: px2rem(35);
      border-radius: $default-border-radius;
      cursor: pointer;
      font-size: 14px;
    }

    button:nth-child(1) {
      background: #09aaff;
      color: #fff;
    }
  }
}
}
</style>
