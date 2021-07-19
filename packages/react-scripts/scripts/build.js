const fs = require('fs-extra');
const chalk = require('chalk');
const webpack = require('webpack');
const paths = require('../config/paths');

// 1. 设置环境变量
process.env.NODE_ENV = 'production';

// 2. 获取webpack配置
const configFactory = require('../config/webpack.config');
const config = configFactory('production');

// 3. 清空 build 目录
fs.emptyDirSync(paths.appBuild);

// 4. 拷贝 public 静态资源到 build 目录
copyPublicFolder();

// 5. 编译
build();

function build() {
  const compiler = webpack(config);
  // compiler.run: 进行编译
  compiler.run((err, stats) => {
    if (err) {
      console.error(err.stack || err);
      return;
    }
    // stats 描述对象，描述本次打包的结果
    const info = stats.toJson();
    if (stats.hasErrors()) {
      console.error(info.errors);
    }
    console.log(chalk.green('Compiled successfully!'));
  });
};

function copyPublicFolder() {
  fs.copySync(paths.appPublic, paths.appBuild, {
    // index.html 交由webpack插件处理，不需要拷贝
    filter: src => src !== paths.appHtml, 
  })
};