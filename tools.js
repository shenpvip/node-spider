const fs = require('fs')
const path = require('path')
const superagent = require('superagent')

// 创建文件夹
const createFolder = to => {
  const sep = path.sep
  const folders = path.dirname(to).split(sep)
  let p = ''
  while (folders.length) {
    p += folders.shift() + sep
    if (!fs.existsSync(p)) {
      fs.mkdirSync(p)
    }
  }
}

// 下载图片
const downloadImg = (src, dest, callback) => {
  superagent.get(src).end((err, res) => {
    if (err) {
      console.log(err)
    }
    createFolder(dest)
    const ws = fs.createWriteStream(dest)
    ws.write(res.body, function(err) {
      if (err) {
        return console.log(err)
      }
    })
    ws.on('finish', () => {
      callback && callback()
    })
  })
}

module.exports = {
  createFolder,
  downloadImg
}
