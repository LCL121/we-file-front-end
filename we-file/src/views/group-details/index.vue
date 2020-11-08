<template>
  <div class="group-details">
    <div
      class="group-back"
      @click="groupBack"
    >
      <svg
        class="icon group-icon"
        aria-hidden="true"
      >
        <use xlink:href="#icon-fanhui"></use>
      </svg>
      返回
    </div>
    <div
      class="group-delete"
      @click="dealGroup"
    >
      <svg
        class="icon group-icon"
        aria-hidden="true"
      >
        <use xlink:href="#icon-shanchu-red"></use>
      </svg>
      {{deleteText}}
    </div>
    <div class="group-center">
      <div class="group-info-list">
        <div
          class="group-info-item"
          v-for="item in groupInfo"
          :key="item.text"
        >
          <span>{{item.text}}</span>
          <span>{{item.value}}</span>
        </div>
      </div>
      <div class="group-number-title">小组成员</div>
      <div class="group-numger-list-menu">
        <span>成员邮箱</span>
        <span>成员昵称</span>
      </div>
      <div class="group-number-list">
        <div
          class="group-number-item"
          v-for="item in groupNumber"
          :key="item.email"
        >
          <span>{{item.email}}</span>
          <span>{{item.name}}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import qs from 'qs'
import { getFileTime, getBigInt } from '@/utils/utils'
import store from '@/store'
import { notyf } from '@/utils/message'

export default {
  name: 'GroupDetails',
  data () {
    return {
      groupInfo: [],
      groupNumber: [],
      deleteText: '',
      groupId: '',
      ownerId: ''
    }
  },
  methods: {
    getFileTime,
    groupBack () {
      this.$router.push('/user/user-group')
    },
    isOwner () {
      return getBigInt(this.ownerId) === store.state.user.userId
    },
    dealGroup () {
      console.log('deal group')
      if (this.isOwner()) {
        this.deleteGroup()
      } else {
        this.quitGroup()
      }
    },
    deleteGroup () {
      console.log('delete group')
      axios.delete(`/api/v1/user/group?group_id=${this.groupId}&csrf_token=${store.state.user.token}`)
        .then(res => {
          console.log(res)
          this.$router.push('/user/user-group')
        })
        .catch(e => {
          console.log(e)
          notyf.error('删除小组失败')
        })
    },
    quitGroup () {
      console.log('quit group')
      axios.delete(`/api/v1/user/group_list?group_id=${this.groupId}&csrf_token=${store.state.user.token}`)
        .then(res => {
          console.log(res)
          this.$router.push('/user/user-group')
        })
        .catch(e => {
          console.log(e)
          notyf.error('退出小组失败')
        })
    }
  },
  mounted () {
    store.commit('group/SET_GROUP_ROUTE', this.$route.fullPath)
    axios.get(`/api/v1/user/group?group_id=${this.$route.query.groupId}`)
      .then(res => {
        const data = res.data
        this.groupId = getBigInt(data.group_id)
        this.ownerId = getBigInt(data.owner_id)
        this.deleteText = this.isOwner() ? '删除小组' : '退出小组'
        this.groupInfo.push({
          text: '小组名称',
          value: data.name
        }, {
          text: '小组ID',
          value: this.groupId
        }, {
          text: '创建时间',
          value: this.getFileTime(data.created_at)
        })
      })
      .catch(e => {
        notyf.error('请求小组详情失败')
      })
    axios.get(`/api/v1/user/group/member_list?group_id=${this.$route.query.groupId}`)
      .then(res => {
        console.log(res)
        res.data.forEach(item => {
          this.groupNumber.push({
            name: item.name,
            email: item.email
          })
        })
      })
      .catch(e => {
        notyf.error('请求小组成员失败')
      })
  }
}
</script>

<style scoped lang="scss">
@import "@/style/index.scss";

@mixin groupNavButton {
  cursor: pointer;
  vertical-align: middle;
  margin: px2rem(20);
  text-align: center;
  height: px2rem(35);
  line-height: px2rem(35);
}

@mixin itemHeight {
  height: px2rem(40);
  line-height: px2rem(40);
}

@media screen and (max-width: 800px) {
  .group-icon {
    font-size: 14px;
  }
}

@media screen and (min-width:801px) {
  .group-icon {
    font-size: 18px;
  }
}

.group-details {
  height: 100%;
  position: relative;

  .group-back {
    width: px2rem(85);
    float: left;
    @include groupNavButton();
  }

  .group-delete {
    width: px2rem(135);
    color: #f00;
    float: right;
    border: 1px solid #f00;
    box-sizing: border-box;
    border-radius: $default-border-radius;
    @include groupNavButton();
  }

  .group-center {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate3d(-50%, -50%, 0);
    cursor: default;
    min-width: px2rem(400);

    .group-info-list {
      .group-info-item {
        @include itemHeight();

        span:nth-child(1) {
          display: inline-block;
          width: px2rem(100);
        }
      }
    }

    .group-number-title {
      @include itemHeight();
    }

    .group-numger-list-menu {
      display: flex;
      @include itemHeight();

      span:nth-child(1) {
        flex: 2;
      }

      span:nth-child(2) {
        flex: 1;
      }
    }

    .group-number-list {
      overflow-y: auto;
      max-height: calc(100vh - #{px2rem(500)});

      .group-number-item {
        display: flex;
        @include itemHeight();

        span:nth-child(1) {
          flex: 2;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }

        span:nth-child(2) {
          flex: 1;
        }
      }
    }
  }
}
</style>
