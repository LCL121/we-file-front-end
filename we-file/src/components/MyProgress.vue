<template>
  <div class="my-progress">
    <header class="my-progress-header">
      <div class="header-left">{{progressTitle}}</div>
      <svg
        class="icon header-right"
        aria-hidden="true"
        @click="hiddenMyProgress"
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
    <ul class="show-list">
      <li
        class="show-item"
        v-for="(item, key) in showList"
        :key="key"
      >
        <span>{{item.fileName}}</span>
        <span>{{getFileSize(item.fileSize)}}</span>
        <span @click="changeDirectory(item.path)">{{getPathName(item.path)}}</span>
        <span>{{getFileStatus(item.currentValue, item.maxValue)}}</span>
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
import { getFileSize } from '@/utils/utils'

export default {
  name: 'MyProgress',
  props: ['hiddenMyProgress', 'progressTitle', 'showList'],
  data () {
    return {
      menuList: ['文件名', '大小', '目录', '状态']
    }
  },
  methods: {
    getFileSize,
    getFileStatus (current, max) {
      if (current === 0) {
        return '等待中'
      } else {
        return `${Math.round(current / max * 10000) / 100}%`
      }
    },
    getPathName (path) {
      if (path === '/') {
        return '全部文件'
      } else {
        const arr = /.*\/(.*)/.exec(path)
        return arr[1]
      }
    },
    changeDirectory (directory) {
      const currentDirectory = this.$route.query.path || '/'
      if (currentDirectory !== directory) {
        this.$router.push(`/user/user-home?path=${directory}`)
      }
      store.commit('base/CHANGE_MY_PROGRESS_STATUS', false)
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

@media screen and (min-width: 801px) {
  .my-progress {
    width: px2rem(600);
    margin-right: px2rem(50);
  }
}

@media screen and (max-width: 800px) {
  .my-progress {
    width: px2rem(450);
  }
}

.my-progress {
  position: fixed;
  bottom: 0;
  right: 0;
  height: px2rem(400);
  z-index: 100;
  background: #fff;
  box-shadow: 0 0 10px #ccc;
  display: flex;
  flex-direction: column;
  border-radius: $default-border-radius $default-border-radius 0 0;
  font-size: 12px;
  color: #666;
  cursor: default;

  .my-progress-header {
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

  .show-list {
    .show-item {
      position: relative;
      display: flex;
      @include heightAndBottom(50);

      span {
        flex: 1;
        padding-left: px2rem(16);
        box-sizing: border-box;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      span:nth-child(1) {
        min-width: px2rem(200);
      }

      span:nth-child(3) {
        cursor: pointer;
        color: #5d9cff;
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
