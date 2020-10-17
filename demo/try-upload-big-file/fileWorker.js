importScripts('./sha256.min.js')

// 算File 类型的hash
self.addEventListener('message', function(e) {
  // 抽样hash
  const file = e.data
  const fileSize = file.size
  const offset = 5 * 1024 * 1024
  const chunks = [file.slice(0, offset)] // 前5M
  let cur = offset
  while (cur < fileSize) {
    // 最后一块
    if (cur + offset >= fileSize) {
      chunks.push(file.slice(cur, cur + offset))
    } else {
      // 中间前后各10字节
      const end = cur + offset
      chunks.push(file.slice(cur, cur + 10))
      chunks.push(file.slice(end - 10, end))
    }
    cur += offset
  }
  const fileReader1 = new FileReader()
  fileReader1.readAsArrayBuffer(new Blob(chunks))
  fileReader1.onload = function() {
    self.postMessage({
      hash: sha256(fileReader1.result),
      need: fileSize >= 100 * 1024 * 1024
    })
  }
})


// importScripts('worker1.js')

// self.addEventListener('message', function(e) {
//   console.log(e)
//   self.postMessage('worker')
// }, false)