// 大文件
// 跨域
// jwt
const input = document.querySelector('input')
const fileWorker = new Worker('./fileWorker.js')
let file = null

input.onchange = function (e) {
  file = e.target.files[0]
  fileWorker.postMessage(file)
}

fileWorker.onmessage = function (e) {
  const { hash, need } = e.data
  console.log(`抽样全文件的hash：${hash}`)
  if (need) {
    const chunks = []
    const fileSize = file.size
    const piece = 1024 * 1024 * 5
    let start = 0
    let end = piece
    while (start < fileSize) {
      end = Math.min(fileSize, end)
      const chunk = file.slice(start, end)
      chunks.push(chunk)
      start = end
      end = end + piece
    }

    // chunks.forEach(() => {
    //   fetch('https://mimg.127.net/p/font/js6/v1/neteasefont-regular.woff')
    //     .then(res => {
    //       console.log(res)
    //     })
    // })

    // sendRequest(chunks)
    //   .then(() => {
    //     console.log('结束')
    //   })
    //   .catch(() => {
    //     console.log('有问题，结束')
    //   })

    sendRequest2(chunks)
      .then(() => {
        console.log('结束')
      })
      .catch(() => {
        console.error('有问题，结束')
      })
  } else {
    console.log('不需要切片')
  }
}

// const fileReader = new FileReader()
// fileReader.readAsArrayBuffer(chunk)
// fileReader.onload = function() {
//   const data = fileReader.result
//   const arrayBufferWorker = new Worker('./arrayBufferWorker.js')
//   arrayBufferWorker.postMessage(data, [data])
//   arrayBufferWorker.onmessage = function(e) {
//     console.log(`切片${index}的hash：${e.data}`)
//     arrayBufferWorker.terminate()
//   }
// }

// arrayBufferWorker.onmessage = function(e) {
//   const data = e.data
//   console.log(`切片${data.index}hash：${data.hash}`)
// }

// const worker = new Worker('worker.js')
// // 发送东西给子线程
// ArrayBuffer，MessagePort或ImageBitmap的实例对象
// worker.postMessage('father')

// // 接收子线程发回来的东西
// worker.onmessage = function(e) {
//   console.log(e)
//   worker.terminate()
// }

// // 监听错误
// worker.onmessageerror = function(e) {
//   console.log(e)
// }