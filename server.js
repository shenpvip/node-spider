#!/usr/bin/env node
const http = require('http')
const url = require('url')
const fs = require('fs')
const path = require('path')
const zlib = require('zlib')

const item = (name, parentPath) => {
  let path = (parentPath = `${parentPath}/${name}`.slice(1))
  return `<div><a href="${path}">${name}</a></div>`
}

const list = (arr, parentPath) => {
  return arr.map(name => item(name, parentPath)).join('')
}

const server = http.createServer((req, res) => {
  let _path = url.parse(req.url).pathname //去掉search
  let parentPath = _path
  //__dirname是当前文件的目录地址，process.cwd()返回的是脚本执行的路径
  _path = path.join(process.cwd(), _path)
  console.log(_path)
  try {
    //拿到路径所对应的文件描述对象
    let stats = fs.statSync(_path)
    if (stats.isFile()) {
      //是文件，返回文件内容
      //在createServer时传入的回调函数被添加到了"request"事件上，回调函数的两个形参req和res
      //分别为http.IncomingMessage对象和http.ServerResponse对象
      //并且它们都实现了流接口
      //增加判断文件是否有改动，没有改动返回304的逻辑

      //从请求头获取modified时间
      let IfModifiedSince = req.headers['if-modified-since']
      //获取文件的修改日期——时间戳格式
      let mtime = stats.mtime
      //如果服务器上的文件修改时间小于等于请求头携带的修改时间，则认定文件没有变化
      if (IfModifiedSince && mtime <= new Date(IfModifiedSince).getTime()) {
        //返回304
        res.writeHead(304, 'not modify')
        return res.end()
      }
      //第一次请求或文件被修改后，返回给客户端新的修改时间
      res.setHeader('last-modified', new Date(mtime).toString())
      res.setHeader('content-encoding', 'gzip')
      let reg = /\.html$/
      //不同的文件类型设置不同的cache-control
      if (reg.test(_path)) {
        //我们对html文件执行每次必须向服务器验证资源有效性的策略
        res.setHeader('cache-control', 'no-cache')
      } else {
        //我们对其余的静态资源文件采取强缓存策略，一个月内无需向服务器索取
        res.setHeader('cache-control', `max-age=${1 * 60 * 60 * 24 * 30}`)
      }

      //执行gzip压缩
      const gzip = zlib.createGzip()
      let readStream = fs.createReadStream(_path)
      readStream.pipe(gzip).pipe(res)
    } else if (stats.isDirectory()) {
      //是目录，返回目录列表，让用户可以继续点击
      let dirArray = fs.readdirSync(_path)
      res.end(list(dirArray, parentPath))
    } else {
      res.end()
    }
  } catch (err) {
    res.writeHead(404, 'Not Found')
    res.end()
  }
})

const config = {
  //从命令行中获取端口号，如果未设置采用默认
  port: process.argv[2] || 2234,
  hostname: '127.0.0.1'
}
const exec = require('child_process').exec
server.listen(config.port, config.hostname, () => {
  console.log(`server is running on http://${config.hostname}:${config.port}`)
  exec(`open http://${config.hostname}:${config.port}`)
})
