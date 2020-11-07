<template>
  <div class="user-group">
    <div class="user-group-buttons">
      <button
        v-for="(item, index) in buttonList"
        :key="index"
        class="user-group-buttons-item"
        @click="item.click"
      >
        <svg
          class="icon"
          aria-hidden="true"
          v-html="item.svg"
        >
        </svg>
        {{item.text}}
      </button>
    </div>
    <div class="user-group-menu">
      小组名
    </div>
    <div class="user-group-list">
      <div
        class="user-group-item"
        v-for="item in groupList"
        :key="getBigInt(item.group_id)"
      >
        <div>
          <svg
            class="icon user-group-item-icon1"
            aria-hidden="true"
          >
            <use xlink:href="#icon-xiaozu"></use>
          </svg>
          {{item.name}}
          <svg
            class="icon user-group-item-icon2"
            aria-hidden="true"
          >
            <use xlink:href="#icon-xiangqing"></use>
          </svg>
        </div>
      </div>
    </div>
    <!-- 创建小组 -->
    <popup
      v-if="isShowCreateGroup"
      :determineButton="() => { this.determine() }"
      :cancleButton="() => { this.cancle() }"
    >
      <form @click.prevent="">
        <div class="fm-input">
          <label for="name"></label>
          <input
            type="text"
            id="name"
            v-focus
            placeholder="组名"
            pattern="^.{1,64}$"
            autocomplete
            required
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
            required
            ref="password"
            autocomplete
            v-model="password"
          >
        </div>
      </form>
    </popup>
  </div>
</template>

<script>
import axios from 'axios'
import qs from 'qs'
import store from '@/store'
import popup from '@/components/Popup'
import { notyf } from '@/utils/message'

export default {
  name: 'UserGroup',
  components: {
    popup
  },
  data () {
    return {
      buttonList: [
        {
          svg: '<use xlink:href="#icon-chuangjian"></use>',
          text: '新建小组',
          click: () => {
            this.isShowCreateGroup = true
          }
        },
        {
          svg: '<use xlink:href="#icon-jiaru"></use>',
          text: '加入小组',
          click: () => { console.log('join group') }
        }
      ],
      name: '',
      password: '',
      isShowCreateGroup: false
    }
  },
  computed: {
    groupList () {
      return store.state.group.groupList
    }
  },
  methods: {
    determine () {
      if (
        this.$refs.password.validity.valid &&
        this.$refs.name.validity.valid
      ) {
        axios.post('/api/v1/user/group', qs.stringify({
          csrf_token: store.state.user.token,
          name: this.name,
          password: this.password
        }))
          .then(res => {
            console.log(res)
            store.dispatch('group/getGroupList')
          })
          .catch(e => {
            notyf.error('创建请求失败')
          })
        this.isShowCreateGroup = false
      } else {
        notyf.error('请按正确格式填写')
      }
    },
    cancle () {
      this.isShowCreateGroup = false
    },
    getBigInt (num) {
      return `${BigInt(num)}`
    }
  },
  mounted () {
    store.dispatch('group/getGroupList')
  }
}
</script>

<style scoped lang="scss">
@import "@/style/index.scss";

$user-group-item-height: px2rem(44);
$menu-height: px2rem(33);

.user-group {
  height: 100%;
  .user-group-buttons {
    @include buttonList();

    .user-group-buttons-item {
      @include buttonItem2();
    }
  }

  .user-group-menu {
    margin-left: px2rem(16);
    font-size: 14px;
    color: #888;
    line-height: $menu-height;
    height: $menu-height;
    @include borderBottom();
  }

  .user-group-list {
    height: calc(100% - #{$buttons-height});
    overflow-y: auto;

    .user-group-item {
      margin-left: px2rem(16);
      line-height: $user-group-item-height;
      height: $user-group-item-height;
      font-size: 14px;
      color: #888;
      cursor: default;
      @include borderBottom();

      div {
        min-width: $list-first-width;
        max-width: px2rem(500);

        .user-group-item-icon1 {
          margin-right: px2rem(16);
        }

        .user-group-item-icon2 {
          float: right;
          line-height: $user-group-item-height;
          height: $user-group-item-height;
          padding-right: px2rem(16);
          cursor: pointer;
          opacity: 0;
        }

        &:hover {
          background: #f4fbff;
          border-color: #cbedff;

          .user-group-item-icon2 {
            opacity: 1;
          }
        }
      }
    }
  }
}
</style>
