const path = require('path');

const appDirectory = process.cwd(); // node进程执行时的工作目录

// 接受一个相对路径，返回一个从应用目录到目录触发的绝对路径
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

module.exports = {
  appHtml: resolveApp('public/index.html'), // html-webpack-plugin
  appIndexJs: resolveApp('src/index.js'), // 默认的入口文件
  appBuild: resolveApp('build'), // 打包后的输出目录，webpack默认是dist
  appPublic: resolveApp('public'),
  appSrc: resolveApp('src'), // todo
}