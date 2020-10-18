const sendRequest = (chunks, max = 4) => {
  return new Promise((resolve, reject) => {
    const len = chunks.length
    let idx = 0
    let counter = 0

    const start = () => {
      while (idx < len && max > 0) {
        max--
        console.log(`第${idx}切片开始发送`)
        const form = new FormData()
        form.append('file', chunks[idx])
        // console.log(form.get('file'))
        idx++
        fetch('https://mimg.127.net/p/font/js6/v1/neteasefont-regular.woff', {
          method: 'GET'
        })
          .then(res => {
            console.log(res)
          })
          .catch(e => {
            console.log(e)
          })
          .finally(() => {
            max++
            counter++
            if (counter === len) {
              resolve()
            } else {
              start()
            }
          })
      }
    }
    start()
  })
} 