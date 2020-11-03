<template>
  <div class="upload-progress">
    <header class="upload-progress-header">
      <div class="header-left">上传列表</div>
      <svg
        class="icon header-right"
        aria-hidden="true"
        @click="hiddenUploadProgress"
      >
        <use xlink:href="#icon-guanbi"></use>
      </svg>
    </header>
    <ul class="menu-list">
      <li
        v-for="item in menuList"
        :key="item"
      >{{item}}</li>
    </ul>
    <ul class="uploading-list">
      <li
        class="uploading-item"
        v-for="item in uploadList"
        :key="item.fileName"
      >
        <span>{{item.fileName}}</span>
        <span>{{getFileSize(item.fileSize)}}</span>
        <span>{{item.path}}</span>
        <span>{{`${Math.round(item.currentValue / item.maxValue * 10000) / 100}%`}}</span>
        <div
          class="progress"
          :style="{width: `${item.currentValue / item.maxValue * 100}%`}"
        ></div>
      </li>
    </ul>

  </div>
</template>

<script>
import store from '@/store'

export default {
  name: 'UploadProgress',
  props: ['hiddenUploadProgress'],
  data () {
    return {
      menuList: ['文件名', '大小', '上传目录', '状态']
    }
  },
  computed: {
    uploadList () {
      return store.state.base.uploadingList
    }
  },
  methods: {
    getFileSize (fileSize) {
      const suffix = ['Byte', 'KB', 'M', 'G', 'T']
      let num = 0
      while (fileSize >= 1024) {
        fileSize /= 1024
        num++
      }
      return `${Math.round(fileSize * 10) / 10}${suffix[num]}`
    }
  }
}
</script>

<style scoped lang="scss">
@import "@/style/index.scss";

@mixin heightAndBottom($h) {
  height: px2rem($h);
  line-height: px2rem($h);
  border-bottom: 1px solid #f2f6fd;
}

.upload-progress {
  position: fixed;
  bottom: 0;
  right: 0;
  height: px2rem(400);
  width: px2rem(600);
  margin-right: px2rem(50);
  z-index: 100;
  background: #fff;
  box-shadow: 0 0 10px #ccc;
  display: flex;
  flex-direction: column;
  border-radius: $default-border-radius $default-border-radius 0 0;
  font-size: 12px;
  color: #666;
  cursor: default;

  .upload-progress-header {
    font-size: 14px;
    display: flex;
    @include heightAndBottom(44);
    justify-content: space-between;

    .header-left {
      margin-left: px2rem(16);
    }

    .header-right {
      height: px2rem(44);
      line-height: px2rem(44);
      margin-right: px2rem(16);
      vertical-align: middle;
      cursor: pointer;
    }
  }

  .menu-list {
    display: flex;
    @include heightAndBottom(35);

    li {
      flex: 1;
      padding-left: px2rem(16);
      box-sizing: border-box;
    }

    li:nth-child(1) {
      min-width: px2rem(200);
    }
  }

  .uploading-list {
    .uploading-item {
      position: relative;
      display: flex;
      @include heightAndBottom(50);

      span {
        flex: 1;
        padding-left: px2rem(16);
        box-sizing: border-box;
      }

      span:nth-child(1) {
        min-width: px2rem(200);
      }

      .progress {
        position: absolute;
        background: #e2eeff;
        height: px2rem(50);
        z-index: -1;
      }
    }
  }
}
</style>
