<template>
  <div class="group-home">
    <div class="group-home-nav">
      <div class="group-home-buttons">
        <button
          v-for="(item, index) in buttonList"
          :key="index"
          class="group-home-button-item"
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
        <input
          ref="input"
          type="file"
          style="display: none;"
        >
      </div>
      <div class="bread-crumb">
        <router-link to="/user/user-group">返回小组列表</router-link>
        <router-link
          :to="`/user/group-home?groupId=${groupId}&path=${item.path}`"
          v-for="item in getBreadCrumb()"
          :key="item.path"
        >{{item.name}}</router-link>
      </div>
      <div class="menu-list">
        <span
          v-for="item in menuList"
          :key="item"
        >{{item}}</span>
      </div>
    </div>
    <div class="group-home-list">
      <div
        class="group-home-item"
        v-for="item in fileList"
        :key="`${item.file_id}_${item.file_name}`"
      >
        <span class="item-span">
          <span class="item-left">
            <svg
              class="icon file-icon"
              aria-hidden="true"
              v-html="getFileIcon(item.is_directory, item.file_name)"
            ></svg>
            <router-link
              :to="`/user/group-home?groupId=${groupId}&path=${directory}${addSep()}${item.file_name}`"
              class="file-name"
              v-if="item.is_directory"
            >{{item.file_name}}</router-link>
            <span
              class="file-name"
              v-else
            >{{item.file_name}}</span>
          </span>
          <span class="item-right">
            <svg
              class="icon"
              aria-hidden="true"
              @click="downloadFile(item.file_id, item.file_name, item.file_size)"
              v-if="!item.is_directory"
            >
              <use xlink:href="#icon-xiazai"></use>
            </svg>
            <svg
              class="icon"
              aria-hidden="true"
              @click="() => {beforeDelete(item.file_name)}"
            >
              <use xlink:href="#icon-shanchu-blue"></use>
            </svg>
          </span>
        </span>
        <span class="item-span">{{getFileSize(item.file_size, item.is_directory)}}</span>
        <span class="item-span">{{getFileTime(item.upload_at)}}</span>
      </div>
    </div>
    <!-- 新建文件夹popup -->
    <popup
      v-if="isShowInputFileNameSlot"
      :determineButton="() => { determineButton(createFolder) }"
      :cancleButton="() => { cancleButton() }"
    >
      <div class="popup-slot fm-input">
        <p class="popup-name">请输入文件夹名称</p>
        <form @submit.prevent="">
          <label for="input-file-name"></label>
          <input
            id="input-file-name"
            type="text"
            v-focus
            v-model="inputFileName"
            placeholder="不能为空"
            pattern=".{1,64}"
            autocomplete
            required
          >
        </form>
      </div>
    </popup>
    <!-- 删除文件/文件夹popup -->
    <popup
      v-if="isShowDeleteSlot"
      :determineButton="() => { determineButton(deleteFile) }"
      :cancleButton="() => { cancleButton() }"
    >
      <p class="popup-name delete-popup">是否确定删除该文件/文件夹</p>
    </popup>
    <transition name="progress-transition">
      <my-progress
        v-show="isShowMyProgress"
        :hiddenMyProgress="() => {changeMyProgressStatus(false)}"
        :progressTitle="progressTitle"
        :showList="showWhat ? uploadingList : downloadingList"
      ></my-progress>
    </transition>
  </div>
</template>

<script>
import store from '@/store'
import axios from 'axios'
import qs from 'qs'
import Popup from '@/components/Popup'
import MyProgress from '@/components/MyProgress'
import HashWorker from '@/utils/hash.worker.js'
import { sha256 } from 'js-sha256'
import { notyf } from '@/utils/message'
import {
  getFileTime,
  getBigInt,
  getFileIcon,
  getFileSize,
  downloadFileByA
} from '@/utils/utils'

const CancelToken = axios.CancelToken

export default {
  name: 'GroupHome',
  components: {
    Popup,
    MyProgress
  },
  data () {
    return {
      buttonList: [
        {
          svg: '<use xlink:href="#icon-shangchuan"></use>',
          text: '上传',
          click: this.upload
        },
        {
          svg: '<use xlink:href="#icon-xinjianwenjianjia"></use>',
          text: '新建文件夹',
          click: this.beforeCreateFolder
        },
        {
          svg: '<use xlink:href="#icon-liebiao"></use>',
          text: '上传列表',
          click: () => {
            this.changeMyProgressStatus(true, () => {
              this.progressTitle = '上传列表'
              this.showWhat = true
            })
          }
        },
        {
          svg: '<use xlink:href="#icon-liebiao"></use>',
          text: '下载列表',
          click: () => {
            this.changeMyProgressStatus(true, () => {
              this.progressTitle = '下载列表'
              this.showWhat = false
            })
          }
        }
      ],
      menuList: ['文件名', '大小', '修改日期'],
      userId: store.state.user.userId,
      token: store.state.user.token,
      groupId: '',
      // popup
      isShowInputFileNameSlot: false,
      isShowDeleteSlot: false,
      inputFileName: '',
      deleteFileName: '',
      // my progress
      progressTitle: '上传列表',
      showWhat: true
    }
  },
  computed: {
    directory () {
      return store.state.group.currentDirectory
    },
    fileList () {
      return store.state.group.fileList
    },
    // my progress
    isShowMyProgress () {
      return store.state.base.isShowMyProgress
    },
    uploadingList () {
      return store.state.base.uploadingList
    },
    downloadingList () {
      return store.state.base.downloadingList
    }
  },
  methods: {
    upload () {
      console.log('upload')
      this.$refs.input.click()
    },
    getBreadCrumb () {
      const temp = this.directory.split('/').filter(item => item !== '')
      temp.unshift('')
      const arr = []
      const len = temp.length
      for (let i = 0; i < len; i++) {
        if (i === 0) {
          arr[0] = {
            path: '/',
            name: this.groupName
          }
        } else {
          arr[i] = {
            path: temp.slice(0, i + 1).join('/'),
            name: temp[i]
          }
        }
      }
      return arr
    },
    addSep () {
      return this.directory === '/' ? '' : '/'
    },
    getFileTime,
    getFileIcon,
    getFileSize,
    initFileInput () {
      this.$refs.input.onchange = async (e) => {
        // 当前目录
        const currentPath = this.directory

        const file = e.target.files[0]

        if (`${file.name}-${currentPath}` in store.state.base.uploadingList) {
          console.log('该文件正在上传中')
          notyf.error('该文件正在上传中')
          return
        }

        const param = new FormData() // 创建form对象
        param.append('file', file)// 通过append向form对象添加数据

        // 显示上传列表
        if (file) {
          this.changeMyProgressStatus(true, () => {
            this.progressTitle = '上传列表'
            this.showWhat = true
          })
          store.commit('base/SET_UPLOADING_LIST', {
            key: `${file.name}-${currentPath}`,
            value: {
              fileName: file.name,
              fileSize: file.size,
              path: currentPath,
              currentValue: 0,
              maxValue: file.size
            }
          })
        }

        // 获取上传地址接口
        let uploadAddress = ''
        let uploadAuthorization = ''
        await axios.get(`/api/v1/user/group/upload_address?group_id=${this.groupId}&file_name=${file.name}&directory=${this.directory}`)
          .then(res => {
            console.log(res)
            uploadAddress = res.data.address
            uploadAuthorization = res.headers.authorization
          })
        const url = `${uploadAddress}/api/v1/upload`
        console.log(url, uploadAuthorization)
        this.changeMyProgressStatus(true, () => {
          this.progressTitle = '上传列表'
          this.showWhat = true
        })
        store.commit('base/SET_UPLOADING_LIST', {
          key: `${file.name}-${currentPath}`,
          value: {
            fileName: file.name,
            fileSize: file.size,
            path: currentPath,
            currentValue: 0,
            maxValue: file.size
          }
        })
        axios.request({
          url,
          method: 'POST',
          headers: {
            authorization: uploadAuthorization,
            'Content-Type': 'multipart/form-data'
          },
          data: param,
          onUploadProgress: (event) => {
            store.commit('base/SET_UPLOADING_LIST', {
              key: `${file.name}-${currentPath}`,
              value: {
                fileName: file.name,
                fileSize: file.size,
                path: currentPath,
                currentValue: event.loaded,
                maxValue: event.total
              }
            })
          },
          cancelToken: new CancelToken((c) => {
            store.commit('base/ADD_UPLOAD_CANCLE', c)
          })
        })
          .then(res => {
            console.log(res)
            store.commit('base/DELETE_UPLOADING_LIST', `${file.name}-${currentPath}`)
            if (Object.keys(store.state.base.uploadingList).length === 0) {
              store.commit('base/CHANGE_MY_PROGRESS_STATUS', false)
            }
            store.dispatch('group/getFileList', this.groupId)
          })
          .catch(e => {
            if (e.toString() !== 'Cancel') {
              console.log(e)
              console.log(e.response)
              store.dispatch('user/signOut')
            }
          })
      }
    },
    downloadFileByA,
    async downloadFile (fileId, fileName, fileSize) {
      // 显示下载列表
      const currentPath = this.directory

      if (`${getBigInt(fileId)}-${currentPath}` in store.state.base.downloadingList) {
        console.log('该文件正在下载中')
        notyf.error('该文件正在下载中')
        return
      }

      this.changeMyProgressStatus(true, () => {
        this.progressTitle = '下载列表'
        this.showWhat = false
      })
      store.commit('base/SET_DOWNLOADING_LIST', {
        key: `${getBigInt(fileId)}-${currentPath}`,
        value: {
          fileName,
          fileSize: fileSize,
          path: currentPath,
          currentValue: 0,
          maxValue: fileSize
        }
      })

      // 获取下载地址接口
      let downloadAddress = ''
      let downloadAuthorization = ''
      await axios.get(`/api/v1/user/group/download_address?group_id=${this.groupId}&file_id=${getBigInt(fileId)}&file_name=${fileName}&directory=${this.directory}`, {
        timeout: 5000
      })
        .then(res => {
          console.log(res)
          downloadAddress = res.data.address
          downloadAuthorization = res.headers.authorization
        })
        .catch(e => {
          console.log(e)
          if (e.message.indexOf('timeout') !== -1) {
            notyf.error('下载地址请求失败')
          }
          store.commit('base/DELETE_DOWNLOADING_LIST', `${getBigInt(fileId)}-${currentPath}`)
          if (Object.keys(store.state.base.downloadingList).length === 0) {
            store.commit('base/CHANGE_MY_PROGRESS_STATUS', false)
          }
        })

      console.log(downloadAuthorization)

      // 使用axios
      await axios.request({
        url: `${downloadAddress}/api/v1/download?file_id=${getBigInt(fileId)}`,
        method: 'GET',
        headers: {
          authorization: downloadAuthorization
        },
        onDownloadProgress: (event) => {
          store.commit('base/SET_DOWNLOADING_LIST', {
            key: `${getBigInt(fileId)}-${currentPath}`,
            value: {
              fileName,
              fileSize: fileSize,
              path: currentPath,
              currentValue: event.loaded,
              maxValue: event.total
            }
          })
        },
        cancelToken: new CancelToken((c) => {
          store.commit('base/ADD_DOWNLOAD_CANCLE', c)
        }),
        responseType: 'blob'
      })
        .then(res => {
          console.log(res)
          store.commit('base/DELETE_DOWNLOADING_LIST', `${getBigInt(fileId)}-${currentPath}`)
          if (Object.keys(store.state.base.downloadingList).length === 0) {
            store.commit('base/CHANGE_MY_PROGRESS_STATUS', false)
          }
          const blob = new Blob([res.data])
          const blobURL = window.URL.createObjectURL(blob)
          this.downloadFileByA(fileName, blobURL)
        })
        .catch(e => {
          if (e.toString() !== 'Cancel') {
            console.log(e)
            console.log(e.response)
            store.dispatch('user/signOut')
          }
          store.commit('base/DELETE_DOWNLOADING_LIST', `${getBigInt(fileId)}-${currentPath}`)
          if (Object.keys(store.state.base.downloadingList).length === 0) {
            store.commit('base/CHANGE_MY_PROGRESS_STATUS', false)
          }
        })
    },
    beforeCreateFolder () {
      this.isShowInputFileNameSlot = true
    },
    determineButton (callBack) {
      console.log('determine')
      callBack()
    },
    cancleButton () {
      console.log('cancle')
      this.isShowInputFileNameSlot = false
      this.isShowDeleteSlot = false
      this.inputFileName = ''
      this.deleteFileName = ''
    },
    async createFolder () {
      console.log('create folder')
      if (this.inputFileName === '') return
      axios.post('/api/v1/user/group/file_list', qs.stringify({
        csrf_token: this.token,
        directory: this.directory,
        group_id: this.groupId,
        name: this.inputFileName
      }), {
        timeout: 5000
      })
        .then(res => {
          console.log(res)
          store.dispatch('group/getFileList', this.groupId)
        })
        .catch((e) => {
          if (e.message.indexOf('timeout') !== -1) {
            notyf.error('创建文件夹请求失败')
          }
        })
      this.isShowInputFileNameSlot = false
      this.inputFileName = ''
    },
    beforeDelete (name) {
      this.isShowDeleteSlot = true
      this.deleteFileName = name
    },
    async deleteFile () {
      console.log('delete file')
      console.log(this.deleteFileName, this.directory, this.token)
      await axios.delete(`/api/v1/user/group/file_list?group_id=${this.groupId}&name=${this.deleteFileName}&directory=${this.directory}&csrf_token=${this.token}`, {
        timeout: 5000
      })
        .then(res => {
          console.log(res)
          store.dispatch('group/getFileList', this.groupId)
        })
        .catch((e) => {
          if (e.message.indexOf('timeout') !== -1) {
            notyf.error('删除请求失败')
          }
        })
      this.isShowDeleteSlot = false
      this.deleteFileName = ''
    },
    changeMyProgressStatus (status, callBack = null) {
      if (callBack) {
        callBack()
      }
      store.commit('base/CHANGE_MY_PROGRESS_STATUS', status)
    }
  },
  watch: {
    $route (to, from) {
      // console.log(to.path)
      // if (to.path === '/user/group-home') {
      store.commit('group/SET_GROUP_ROUTE', this.$route.fullPath)
      const path = to.query.path
      this.groupId = to.query.groupId
      if (path) {
        store.commit('group/SET_CURRENT_DIRECTORY', path)
      } else {
        store.commit('group/SET_CURRENT_DIRECTORY', '/')
      }
      store.dispatch('group/getFileList', this.groupId)
      this.initFileInput()
      // }
    }
  },
  mounted () {
    store.commit('group/SET_GROUP_ROUTE', this.$route.fullPath)
    const path = this.$route.query.path
    this.groupId = this.$route.query.groupId
    this.groupName = this.$route.query.groupName
    if (path) {
      store.commit('group/SET_CURRENT_DIRECTORY', path)
    } else {
      store.commit('group/SET_CURRENT_DIRECTORY', '/')
    }
    store.dispatch('group/getFileList', this.groupId)
    this.initFileInput()
  }
}
</script>

<style scoped lang="scss">
@import "@/style/index.scss";
@import "./style/pc.scss";
@import "./style/mobile.scss";
@import "./style/transition.scss";
@import "./style/variables.scss";

.popup-slot {
  height: 50%;

  .popup-name {
    font-size: 15px;
  }

  input:invalid {
    border: 1px solid #f00;
  }

  input:focus {
    background: #fff;
  }
}

.delete-popup {
  margin: 0 auto;
  font-size: 15px;
}

.group-home {
  height: 100%;
  .group-home-nav {
    display: flex;
    flex-direction: column;
    color: $nav-color;
    font-size: 12px;
    cursor: default;

    .group-home-buttons {
      @include buttonList();

      .group-home-button-item:nth-child(1) {
        @include buttonItem1();
      }

      .group-home-button-item:nth-child(n + 2) {
        @include buttonItem2();
      }
    }

    .bread-crumb {
      height: $bread-height;
      line-height: $bread-height;
      padding-right: px2rem(16);
      @include borderBottom();

      a {
        color: $nav-color;
        padding-left: px2rem(16);
        position: relative;
        font-size: 13.5px;
      }

      a:nth-child(n + 2)::before {
        content: ">";
        position: absolute;
        left: px2rem(4);
      }
    }
  }

  .group-home-list {
    overflow-y: auto;
    color: $nav-color;
    font-size: 12px;
    cursor: default;
    display: flex;
    flex-direction: column;

    .group-home-item {
      @include borderBottom();
      box-sizing: border-box;

      .item-span:nth-child(1) {
        .item-left {
          .file-icon {
            font-size: 30px;
            vertical-align: middle;
          }

          .file-name {
            padding-left: px2rem(16);
          }
        }

        .item-right {
          font-size: 15px;
          vertical-align: middle;
          padding-right: px2rem(16);
          margin-left: px2rem(16);
          opacity: 0;
          box-sizing: border-box;

          svg {
            cursor: pointer;
          }

          svg:nth-child(2) {
            margin-left: px2rem(10);
          }
        }
      }

      .item-span:hover {
        background: #f4fbff;
        border-color: #cbedff;

        .item-right {
          opacity: 1;
        }
      }
    }
  }
}
</style>
