const superagent = require('superagent') //发送网络请求获取DOM
const cheerio = require('cheerio') //能够像Jquery一样方便获取DOM节点
const fs = require('fs')
const path = require('path')
const tools = require('./tools')

const URL = `https://quanjing.com/creative/topic/31`

var imgArr = []

const getImg = () => {
  superagent.get(URL).end((err, res) => {
    if (err) {
      console.log(err)
    }
    let $ = cheerio.load(res.text)
    let selectItem = $('#demo2 .item')
    for (let i = 0; i < selectItem.length; i++) {
      imgArr.push(
        $(selectItem[i])
          .find('img')
          .attr('src')
      )
    }
    for (let j = 0; j < imgArr.length; j++) {
      tools.downloadImg(
        imgArr[j],
        path.resolve(__dirname, `download/img${j}.jpg`),
        () => {
          console.log(`get ${i}`)
        }
      )
    }
  })
}
getImg()
