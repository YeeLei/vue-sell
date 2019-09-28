const path = require('path')
const appData = require('./data.json')
const seller = appData.seller
const goods = appData.goods
const ratings = appData.ratings

function resolve (dir) {
  return path.join(__dirname, dir)
}
module.exports = {
  devServer: {
    before (app) {
      app.get('/api/seller', (req, res) => {
        res.json({
          error: 0,
          data: seller
        })
      })
      app.get('/api/goods', (req, res) => {
        res.json({
          error: 0,
          data: goods
        })
      })
      app.get('/api/ratings', (req, res) => {
        res.json({
          error: 0,
          data: ratings
        })
      })
    }
  },
  chainWebpack (config) {
    config.resolve.alias
      .set('components', resolve('src/components'))
      .set('common', resolve('src/common'))
      .set('api', resolve('src/api'))
  }
}
