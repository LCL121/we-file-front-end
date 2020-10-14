const path = require('path')
const axios = require('axios')
const bodyParser = require('body-parser')
const qs = require('qs')

module.exports = {
  publicPath: process.env.VUE_APP_BASE_API,
  devServer: {
    before: function (app, server, compiler) {
      app.use(bodyParser.urlencoded({ extended: false }))

      app.all(/^\/api\/v1\/.*/, (req, res) => {
        console.log(`${req.method} to: http://www.wefile.com:8080${req.url}`)

        if (req.method === 'OPTIONS') {
          res.sendStatus(200);
        } else if (req.method === 'GET') {
          axios.get(`http://www.wefile.com:8080${req.url}`)
            .then((tempRes) => {
              const data = tempRes.data
              res.send(data)
            })
            .catch(e => {
              console.log('get 出错！')
              const data = e.response.data
              console.log(data)
              res.send(data)
            })
        } else if (req.method === 'POST') {
          console.log(req.body)
          axios.post(`http://www.wefile.com:8080${req.url}`, qs.stringify(req.body))
            .then(tempRes => {
              const data = tempRes.data
              console.log(data)
              res.send(data)
            })
            .catch(e => {
              console.log('post 出错！')
              const data = e.response.data
              console.log(data)
              res.send(data)
            })
        }
      })
    }
  },
  chainWebpack: (config) => {
    config
      .plugin('html')
      .tap((args) => {
        args[0].title = 'WeFile'
        return args
      })

    if (process.env.NODE_ENV === 'development') {
      config.module
        .rule('eslint')
        .use('eslint-loader')
        .loader('eslint-loader')
        .tap(options => {
          options.fix = true
          return options
        })
    }
  },
  configureWebpack: {
    resolve: {
      alias: {
        assets: path.join(__dirname, 'src/assets'),
        utils: path.join(__dirname, 'src/utils'),
        style: path.join(__dirname, 'src/style')
      }
    }
  }
}
