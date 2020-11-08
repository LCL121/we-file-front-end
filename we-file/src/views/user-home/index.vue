<template>
  <div class="user-home">
    <div class="user-home-nav">
      <div class="user-home-buttons">
        <button
          v-for="(item, index) in buttonList"
          :key="index"
          class="user-home-button-item"
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
        <router-link
          :to="`/user/user-home?path=${item.path}`"
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
    <div class="user-home-list">
      <div
        class="user-home-item"
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
              :to="`/user/user-home?path=${directory}${addSep()}${item.file_name}`"
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
        <span class="item-span">{{getFileSize(item.is_directory, item.file_size)}}</span>
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
import { uploadRequest, multipartUpload } from './js/request'
import { notyf } from '@/utils/message'
import { getFileTime, getBigInt } from '@/utils/utils'

const CancelToken = axios.CancelToken

export default {
  name: 'UserHome',
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
      return store.state.base.currentDirectory
    },
    fileList () {
      return store.state.base.fileList
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
            name: '全部文件'
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
    getFileIcon (isDirectory, fileName) {
      if (isDirectory) {
        return '<use xlink:href="#icon-file"></use>'
      } else {
        const suffix = /.*\.(.*)/.exec(fileName)[1]
        switch (suffix) {
          case 'xlsx':
            return '<use xlink:href="#icon-file"></use>'
          case 'ppt':
            return '<use xlink:href="#icon-ppt"></use>'
          case 'doc':
          case 'docx':
            return '<use xlink:href="#icon-word"></use>'
          case 'mp3':
          case 'wav':
            return '<use xlink:href="#icon-music"></use>'
          case 'html':
            return '<use xlink:href="#icon-html"></use>'
          case 'zip':
          case 'rar':
            return '<use xlink:href="#icon-zip"></use>'
          case 'mp4':
          case 'avi':
            return '<use xlink:href="#icon-video"></use>'
          case 'txt':
            return '<use xlink:href="#icon-txt"></use>'
          case 'ios':
            return '<use xlink:href="#icon-ios"></use>'
          case 'exe':
            return '<use xlink:href="#icon-exe"></use>'
          case 'psd':
            return '<use xlink:href="#icon-psd"></use>'
          case 'png':
          case 'jpg':
          case 'gif':
            return '<use xlink:href="#icon-image"></use>'
          case 'pdf':
            return '<use xlink:href="#icon-pdf"></use>'
          default:
            return '<use xlink:href="#icon-undefined"></use>'
        }
      }
    },
    getFileSize (isDirectory, fileSize) {
      if (isDirectory) return '-'
      const suffix = ['Byte', 'KB', 'M', 'G', 'T']
      let num = 0
      while (fileSize >= 1024) {
        fileSize /= 1024
        num++
      }
      return `${Math.round(fileSize * 10) / 10}${suffix[num]}`
    },
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
        await axios.get(`/api/v1/user/upload_address?file_name=${file.name}&directory=${this.directory}`, {
          timeout: 5000
        })
          .then(res => {
            console.log(res)
            uploadAddress = res.data.address
            uploadAuthorization = res.headers.authorization
          })
          .catch(e => {
            if (e.message.indexOf('timeout') !== -1) {
              notyf.error('上传地址请求失败')
            }
            store.commit('base/DELETE_UPLOADING_LIST', `${file.name}-${currentPath}`)
            if (Object.keys(store.state.base.uploadingList).length === 0) {
              store.commit('base/CHANGE_MY_PROGRESS_STATUS', false)
            }
          })

        // 快传url
        const fastUrl = `${uploadAddress}/api/v1/upload/try_fast`
        // upload url
        const uploadUrl = `${uploadAddress}/api/v1/upload`
        // 全量hash
        let allHash = ''

        // 监听发送
        const objNums = { nums: 0 }
        const watchNums = new Proxy(objNums, {
          get: (obj, prop) => {
            return obj[prop]
          },
          set: (obj, prop, value) => {
            if (prop === 'nums') {
              obj[prop] = value
              if (value === 2) {
                console.log('开始发送全量hash', allHash)
                axios.post(fastUrl, qs.stringify({
                  file_hash: allHash
                }), {
                  headers: {
                    authorization: uploadAuthorization
                  }
                })
                  .then(res => {
                    console.log(res)
                    store.commit('base/SET_UPLOADING_LIST', {
                      key: `${file.name}-${currentPath}`,
                      value: {
                        fileName: file.name,
                        fileSize: file.size,
                        path: currentPath,
                        currentValue: file.size,
                        maxValue: file.size
                      }
                    })
                    store.commit('base/DELETE_UPLOADING_LIST', `${file.name}-${currentPath}`)
                    if (Object.keys(store.state.base.uploadingList).length === 0) {
                      store.commit('base/CHANGE_MY_PROGRESS_STATUS', false)
                    }
                    store.dispatch('base/getFileList')
                  })
                  .catch((e) => {
                    const data = e.response.data
                    console.log(data)
                    if (data.message === 'conflict error') {
                      console.log('该目录已经有该文件')
                      notyf.error('该目录已经有该文件')
                      store.commit('base/DELETE_UPLOADING_LIST', `${file.name}-${currentPath}`)
                      if (Object.keys(store.state.base.uploadingList).length === 0) {
                        store.commit('base/CHANGE_MY_PROGRESS_STATUS', false)
                      }
                    } else if (data.message === 'file not found') {
                      // 发送文件
                      console.log('开始发送文件')
                      if (file.size < 104857600) {
                        console.log('upload')
                        uploadRequest(uploadAddress, uploadAuthorization, param, file.name, file.size, currentPath)
                      } else {
                        console.log('分块上传')
                        multipartUpload(uploadAddress, uploadAuthorization, file, file.size, file.name, currentPath)
                      }
                    } else {
                      notyf.error('文件上传失败')
                      store.commit('base/DELETE_UPLOADING_LIST', `${file.name}-${currentPath}`)
                      if (Object.keys(store.state.base.uploadingList).length === 0) {
                        store.commit('base/CHANGE_MY_PROGRESS_STATUS', false)
                      }
                    }
                  })
              }
            }
            return true
          }
        })

        // 计算全量hash
        const fileAllHashWorker = new HashWorker()
        fileAllHashWorker.postMessage(file)
        fileAllHashWorker.onmessage = (e) => {
          allHash = e.data
          console.log('全量hash: ', allHash)
          watchNums.nums++
        }

        // 计算抽样hash
        console.log('开始抽样hash 计算')
        const fileSize = file.size
        const offset = 5 * 1024 * 1024
        const chunks = []
        let cur = 0
        while (cur < fileSize) {
          // 最后一块全部
          if (cur + offset >= fileSize) {
            chunks.push(file.slice(cur, fileSize))
          } else {
            // 前面部分前后各10字节
            const end = cur + offset
            chunks.push(file.slice(cur, cur + 10))
            chunks.push(file.slice(end - 10, end))
          }
          cur += offset
        }

        const fileReader2 = new FileReader()
        fileReader2.readAsArrayBuffer(new Blob(chunks))
        fileReader2.onload = async function () {
          const fileSamplingHash = sha256(fileReader2.result)
          console.log('抽样hash: ', fileSamplingHash)

          // 快速上传接口
          console.log('快速上传：', fastUrl, uploadAuthorization)
          axios.post(fastUrl, qs.stringify({
            file_sampling_hash: fileSamplingHash
          }), {
            headers: {
              authorization: uploadAuthorization
            }
          })
            .then(res => {
              console.log(res)
              if (res.data.message === 'find sampling hash, need file total hash') {
                // 发送全量hash
                console.log('准备发送全量hash')
                watchNums.nums++
              }
            })
            .catch((e) => {
              const data = e.response.data
              console.log(data)
              if (data.message === 'file not found') {
                // 发送文件
                console.log('开始发送文件')
                if (file.size < 104857600) {
                  console.log('upload')
                  uploadRequest(uploadAddress, uploadAuthorization, param, file.name, file.size, currentPath)
                } else {
                  console.log('分块上传')
                  multipartUpload(uploadAddress, uploadAuthorization, file, file.size, file.name, currentPath)
                }
              } else {
                notyf.error('文件上传失败')
              }
            })
        }
      }
    },
    downloadFileByA (name, blob) {
      const a = document.createElement('a')
      a.download = name
      a.href = blob
      a.click()
    },
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
      await axios.get(`/api/v1/user/download_address?file_id=${getBigInt(fileId)}&file_name=${fileName}&directory=${this.directory}`, {
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
      axios.post('/api/v1/user/file_list', qs.stringify({
        csrf_token: this.token,
        directory: this.directory,
        name: this.inputFileName
      }), {
        timeout: 5000
      })
        .then(res => {
          console.log(res)
          store.dispatch('base/getFileList')
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
      await axios.delete(`/api/v1/user/file_list?name=${this.deleteFileName}&directory=${this.directory}&csrf_token=${this.token}`, {
        timeout: 5000
      })
        .then(res => {
          console.log(res)
          store.dispatch('base/getFileList')
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
      const path = to.query.path
      if (path) {
        store.commit('base/SET_CURRENT_DIRECTORY', path)
      } else {
        store.commit('base/SET_CURRENT_DIRECTORY', '/')
      }
      store.dispatch('base/getFileList')
      this.initFileInput()
    }
  },
  mounted () {
    const path = this.$route.query.path
    if (path) {
      store.commit('base/SET_CURRENT_DIRECTORY', path)
    } else {
      store.commit('base/SET_CURRENT_DIRECTORY', '/')
    }
    store.dispatch('base/getFileList')
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

.user-home {
  height: 100%;
  .user-home-nav {
    display: flex;
    flex-direction: column;
    color: $nav-color;
    font-size: 12px;
    cursor: default;

    .user-home-buttons {
      @include buttonList();

      .user-home-button-item:nth-child(1) {
        @include buttonItem1();
      }

      .user-home-button-item:nth-child(n + 2) {
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
      }

      a:nth-child(n + 2)::before {
        content: ">";
        position: absolute;
        left: px2rem(4);
      }
    }
  }

  .user-home-list {
    overflow-y: auto;
    color: $nav-color;
    font-size: 12px;
    cursor: default;
    display: flex;
    flex-direction: column;

    .user-home-item {
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
