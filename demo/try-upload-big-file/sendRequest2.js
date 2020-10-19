const WAIT = 'wait'
const START = 'start'
const ERROR = 'error'
const END = 'end'

const sendRequest2 = (chunks, max = 4) => {
  return new Promise((resolve, reject) => {
    const len = chunks.length
    let counter = 0
    // 保存FormData，及其状态
    const forms = new Array(len)
    // >= 0 && <= 3 重发，== 4 报错，不再重发
    const retryArr = new Array(len).fill(0)

    chunks.forEach((chunk, index) => {
      forms[index] = {
        form: new FormData(),
        status: WAIT
      }
      forms[index].form.append('file', chunk)
    })

    const start = () => {
      while (counter < len && max > 0) {
        const idx = forms.findIndex(item => item.status === WAIT)
        if (idx === -1) return
        forms[idx].status = START
        max--
        console.log(`第${idx}切片开始发送`)
        let url = 'https://mimg.127.net/p/font/js6/v1/neteasefont-regular.woff'
        if (Math.random() > 0.3) {
          url = 'https://mimg.127.net/p/font/js6/v1/neteasefont-regular.wff'
        }
        fetch(url, {
          method: 'GET'
        })
          .then(res => {
            counter++
            console.log(res, idx)
            forms[idx].status = END
          })
          .catch(e => {
            console.log(e, idx)
            if (retryArr[idx] < 4) {
              forms[idx].status = WAIT
              retryArr[idx]++
            } else {
              forms[idx].status = ERROR
              counter++
              console.log(`第${idx}切片停止重传`)
              reject()
            }
          })
          .finally(() => {
            max++
            if (counter === len) {
              if (forms.every(item => item.status === END)) {
                resolve()
              } else {
                reject()
              }
            } else {
              // 有一个状态为ERROR就取消重传
              if (forms.every(item => item.status !== ERROR)) {
                start()
              }
            }
          })
      }
    }
    start()
  })
} 