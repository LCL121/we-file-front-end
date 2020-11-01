<template>
  <div class="user-home">
    <div class="user-home-nav">
      <div class="user-home-buttons">
        <button
          v-for="(item, index) in buttonsIcon"
          :key="index"
          class="user-home-button-icon"
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
        <span>
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
          <svg
            class="icon file-download"
            aria-hidden="true"
            @click="downloadFile(item.file_id, item.file_name)"
            v-if="!item.is_directory"
          >
            <use xlink:href="#icon-xiazai"></use>
          </svg>
        </span>
        <span>{{getFileSize(item.is_directory, item.file_size)}}</span>
        <span>{{getFileTime(item.upload_at)}}</span>
      </div>
    </div>
  </div>
</template>

<script>
import store from '@/store'
import axios from 'axios'
import qs from 'qs'

export default {
  name: 'UserHome',
  data () {
    return {
      buttonsIcon: [
        {
          svg: '<use xlink:href="#icon-shangchuan"></use>',
          text: '上传',
          click: this.upload
        },
        {
          svg: '<use xlink:href="#icon-xinjianwenjianjia"></use>',
          text: '新建文件夹',
          click: this.beforeCreateFolder
        }
      ],
      fileList: [],
      menuList: ['文件名', '大小', '修改日期'],
      directory: '/',
      userId: store.state.user.userId
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
    signOut () {
      store.dispatch('user/signOut')
      this.$router.push('/')
    },
    getFileTime (orignTime) {
      const arr = /(.*)T(.*)\+(.*)/g.exec(orignTime)
      return `${arr[1]} ${arr[2]}`
    },
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
    getFileList () {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'))
      axios.get(`/api/v1/file_list/${this.userId}?directory=${this.directory}`)
        .then(res => {
          const data = res.data
          console.log(data)
          if (data.message) {
            if (data.message === 'valid session') {
              this.signOut()
              return
            }
          }
          this.fileList = data.files.sort((a, b) => {
            if (a.is_directory && !b.is_directory) return -1
            else return 1
          })
        })
        .catch(e => {
          console.log(e)
          this.signOut()
        })
    },
    initFileInput () {
      this.$refs.input.onchange = async (e) => {
        const file = e.target.files[0]
        const param = new FormData() // 创建form对象
        param.append('file', file)// 通过append向form对象添加数据
        console.log(param.get('file')) // FormData私有类对象，访问不到，通过get判断值是否传进去

        // 获取上传地址接口
        let uploadAddress = ''
        let uploadAuthorization = ''
        await axios.get(`/api/v1/upload_address/${this.userId}?file_name=${file.name}&directory=${this.directory}`)
          .then(res => {
            console.log(res)
            uploadAddress = res.data.address
            uploadAuthorization = res.headers.authorization
          })

        const url = `${uploadAddress}/api/v1/upload`
        console.log(url, uploadAuthorization)
        axios.request({
          url,
          method: 'POST',
          headers: {
            authorization: uploadAuthorization,
            'Content-Type': 'multipart/form-data'
          },
          data: param
        })
          .then(res => {
            console.log(res)
            this.getFileList()
          })
          .catch((e) => {
            console.log(e)
            console.log(e.response)
            this.signOut()
          })
      }
    },
    downloadFileByA (name, blob) {
      const a = document.createElement('a')
      a.download = name
      a.href = blob
      a.click()
    },
    async downloadFile (fileId, fileName) {
      // 获取下载地址接口
      let downloadAddress = ''
      let downloadAuthorization = ''
      await axios.get(`/api/v1/download_address/${this.userId}?file_id=${BigInt(fileId)}&file_name=${fileName}&directory=${this.directory}`)
        .then(res => {
          console.log(res)
          downloadAddress = res.data.address
          downloadAuthorization = res.headers.authorization
        })

      console.log(downloadAuthorization)
      // 使用axios
      await axios.request({
        url: `${downloadAddress}/api/v1/download`,
        method: 'GET',
        headers: {
          authorization: downloadAuthorization
        },
        responseType: 'blob'
      })
        .then(res => {
          const blob = new Blob([res.data])
          const blobURL = window.URL.createObjectURL(blob)
          this.downloadFileByA(fileName, blobURL)
        })
    },
    beforeCreateFolder () {
      const name = prompt('请输入文件名字', '新建文件夹')
      if (name) {
        this.createFolder(name)
      }
    },
    createFolder (name) {
      axios.post(`/api/v1/file_list/${this.userId}`, qs.stringify({
        csrf_token: store.state.user.token,
        directory: this.directory,
        name
      }))
        .then(res => {
          console.log(res)
          this.getFileList()
        })
        .catch((e) => {
          console.log(e)
          console.log(e.response)
          this.signOut()
        })
    }
  },
  watch: {
    $route (to, from) {
      const path = to.query.path
      if (path) {
        this.directory = path
      }
      this.getFileList()
      this.initFileInput()
    }
  },
  mounted () {
    const path = this.$route.query.path
    if (path) {
      this.directory = path
    }
    this.getFileList()
    this.initFileInput()
  }
}
</script>

<style scoped lang="scss">
@import "@/style/index.scss";
@import "./style/pc.scss";

.user-home {
  height: 100%;
  .user-home-list {
    height: calc(100% - #{$nav-height});
    overflow-y: auto;
  }
}
</style>
