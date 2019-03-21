const superagent = require('superagent') //发送网络请求获取DOM
const cheerio = require('cheerio') //能够像Jquery一样方便获取DOM节点
const fs = require('fs')
const path = require('path')
const Koa = require('koa')
const Router = require('koa-router')
const app = new Koa()
const router = new Router()

let currentPage = 1
const URL = `https://cnodejs.org/?tab=all&page=`
let arr

const getNew = page => {
  console.log(page)
  superagent.get(URL + page).end((err, res) => {
    if (err) {
      console.log(err)
    }
    let $ = cheerio.load(res.text)
    let selectItem = $('#topic_list .cell')
    let itemContent = $(selectItem)
      .find('.topic_title_wrapper .topic_title')
      .text()
    createFolder(path.resolve(__dirname, `download/content${page}.txt`))
    const ws = fs.createWriteStream(
      path.resolve(__dirname, `download/content${page}.txt`)
    )
    ws.write(itemContent, function(err) {
      if (err) {
        return console.log(err)
      }
      if (page < 10) {
        currentPage++
        getNew(currentPage)
      }
    })
    return itemContent
  })
}

const createFolder = to => {
  //文件写入
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
router.get('/', async (ctx, next) => {
  superagent.get(URL + 1).end((err, res) => {
    if (err) {
      console.log(err)
    }
    let $ = cheerio.load(res.text)
    let selectItem = $('#topic_list .cell')
    arr = []
    $(selectItem).each((i, item) => {
      arr.push({
        title: $(item)
          .find('.topic_title')
          .text(),
        src: $(item)
          .find('.topic_title')
          .attr('href')
      })
      // arr.push(
      //   `<div><a href="${$(item)
      //     .find('.topic_title')
      //     .attr('href')}">${$(item)
      //     .find('.topic_title')
      //     .text()}</a></div>`
      // )
    })
  })
  ctx.body = arr
  await next()
})
app.use(router.routes()).use(router.allowedMethods())
app.listen(3000, () => {
  console.log('starting at port 3000')
})
