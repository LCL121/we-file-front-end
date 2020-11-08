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
          <router-link :to="`/user/group-home?groupId=${getBigInt(item.group_id)}&path=/`">{{item.name}}</router-link>
          <svg
            class="icon user-group-item-icon2"
            aria-hidden="true"
            @click="enterGroupDetails(getBigInt(item.group_id))"
          >
            <use xlink:href="#icon-xiangqing"></use>
          </svg>
        </div>
      </div>
    </div>
    <!-- 创建小组 -->
    <popup
      v-if="isShowCreateGroup"
      :determineButton="() => { this.createDetermine() }"
      :cancleButton="() => { this.createCancle() }"
    >
      <form @click.prevent="">
        <div class="fm-input">
          <label for="createName"></label>
          <input
            type="text"
            id="createName"
            v-focus
            placeholder="组名"
            pattern="^.{1,64}$"
            autocomplete
            required
            ref="createName"
            v-model="createName"
          >
        </div>
        <div class="fm-input">
          <label for="createPassword"></label>
          <input
            type="password"
            id="createPassword"
            placeholder="密码 8-64位，包含大小写字母、数字"
            pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[^]{8,64}$"
            required
            ref="createPassword"
            autocomplete
            v-model="createPassword"
          >
        </div>
      </form>
    </popup>
    <!-- 加入小组 -->
    <popup
      v-if="isShowJoinGroup"
      :determineButton="() => { this.joinDetermine() }"
      :cancleButton="() => { this.joinCancle() }"
    >
      <form @click.prevent="">
        <div class="fm-input">
          <label for="joinGroupId"></label>
          <input
            type="text"
            id="joinGroupId"
            v-focus
            placeholder="小组ID"
            pattern="^.{1,64}$"
            autocomplete
            required
            ref="joinGroupId"
            v-model="joinGroupId"
          >
        </div>
        <div class="fm-input">
          <label for="joinPassword"></label>
          <input
            type="password"
            id="joinPassword"
            placeholder="密码 8-64位，包含大小写字母、数字"
            pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[^]{8,64}$"
            required
            ref="joinPassword"
            autocomplete
            v-model="joinPassword"
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
import { getBigInt } from '@/utils/utils'

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
          click: () => {
            this.isShowJoinGroup = true
          }
        }
      ],
      // 创建小组
      createName: '',
      createPassword: '',
      isShowCreateGroup: false,
      // 加入小组
      joinGroupId: '',
      joinPassword: '',
      isShowJoinGroup: false
    }
  },
  computed: {
    groupList () {
      return store.state.group.groupList
    }
  },
  methods: {
    createDetermine () {
      if (
        this.$refs.createPassword.validity.valid &&
        this.$refs.createName.validity.valid
      ) {
        axios.post('/api/v1/user/group', qs.stringify({
          csrf_token: store.state.user.token,
          name: this.createName,
          password: this.createPassword
        }))
          .then(res => {
            console.log(res)
            store.dispatch('group/getGroupList')
          })
          .catch(e => {
            notyf.error('创建请求失败')
          })
        this.createName = ''
        this.createPassword = ''
        this.isShowCreateGroup = false
      } else {
        notyf.error('请按正确格式填写')
      }
    },
    createCancle () {
      this.createName = ''
      this.createPassword = ''
      this.isShowCreateGroup = false
    },
    joinDetermine () {
      console.log('determine join')
      if (
        this.$refs.joinPassword.validity.valid &&
        this.$refs.joinGroupId.validity.valid
      ) {
        axios.post('/api/v1/user/group_list', qs.stringify({
          csrf_token: store.state.user.token,
          group_id: this.joinGroupId,
          password: this.joinPassword
        }))
          .then(res => {
            console.log(res)
            store.dispatch('group/getGroupList')
          })
          .catch(e => {
            notyf.error('加入请求失败')
          })
        this.joinGroupId = ''
        this.joinPassword = ''
        this.isShowJoinGroup = false
      } else {
        notyf.error('请按正确格式填写')
      }
    },
    joinCancle () {
      console.log('cancle join')
      this.joinGroupId = ''
      this.joinPassword = ''
      this.isShowJoinGroup = false
    },
    enterGroupDetails (id) {
      console.log(id)
      this.$router.push(`/user/group-details?groupId=${id}`)
    },
    getBigInt
  },
  mounted () {
    store.commit('group/SET_GROUP_ROUTE', this.$route.fullPath)
    store.dispatch('group/getGroupList')
  }
}
</script>

<style scoped lang="scss">
@import "@/style/index.scss";

$user-group-item-height-pc: px2rem(44);
$user-group-item-height-mobile: px2rem(70);
$menu-height: px2rem(33);

@media screen and (max-width: 800px) {
  .user-group-item {
    line-height: $user-group-item-height-mobile;
    height: $user-group-item-height-mobile;
    .user-group-item-icon2 {
      line-height: $user-group-item-height-mobile;
      height: $user-group-item-height-mobile;
    }
  }
}

@media screen and (min-width: 801px) {
  .user-group-item {
    line-height: $user-group-item-height-pc;
    height: $user-group-item-height-pc;
    .user-group-item-icon2 {
      line-height: $user-group-item-height-pc;
      height: $user-group-item-height-pc;
    }
  }
}

.user-group {
  height: 100%;
  cursor: default;
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
      font-size: 14px;
      color: #888;
      box-sizing: border-box;
      @include borderBottom();

      div {
        min-width: $list-first-width;
        max-width: px2rem(500);
        padding-left: px2rem(16);

        .user-group-item-icon1 {
          margin-right: px2rem(16);
        }

        a {
          color: #888;
        }

        .user-group-item-icon2 {
          float: right;
          margin-right: px2rem(40);
          padding: 0 px2rem(10);
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
