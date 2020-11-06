import { sha256 } from 'js-sha256'

self.addEventListener('message', function (e) {
  console.log('开始全量hash 计算')
  const file = e.data
  const fileReader1 = new FileReader()
  fileReader1.readAsArrayBuffer(file)
  fileReader1.onload = () => {
    const fileAllArrayBuffer = fileReader1.result
    self.postMessage(sha256(fileAllArrayBuffer))
  }
})
