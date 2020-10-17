importScripts('./sha256.min.js')

// 计算切片ArrayBuffer 类型的hash
self.addEventListener('message', function(e) {
  self.postMessage(sha256(e.data))
})
