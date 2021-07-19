const webpack = require('webpack');

// 1. 设置环境变量
process.env.NODE_ENV = 'development';

// 2. 得到一个配置工厂
const configFactory = require('../config/webpack.config');
const config = configFactory('production');

// 3. 创建 compiler
const compiler = webpack(config);

// 4. 获取 webpackDevServer 配置项
const webpackDevServerConfig = require('../config/webpackDevServer.config')();
const webpackDevServer = require('webpack-dev-server');

// 内部启动 compiler 编译
// 启动本地服务器并返回编译结果
const devServer = new webpackDevServer(compiler, webpackDevServerConfig);

// 5. 启动http开发服务器，监听端口
devServer.listen(3000, () => {
  console.log(chalk.cyan('Starting the development server ...'))
});
