
const HtmlWebpackPlugin = require('html-webpack-plugin');
const paths = require('./paths');

module.exports = function(webpackEnv) {
  const isEnvDevelopment = webpackEnv === 'development';
  const isEnvProduction = webpackEnv === 'production';

  return {
    mode: isEnvProduction ? 'production' : isEnvDevelopment && 'development',
    entry: paths.appIndexJs,
    output: {
      path: paths.appBuild,
      publicPath: '/'
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          include: paths.appSrc, // 只编译src目录
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: ['@babel/preset-react'] // 预设，插件集合
              }
            }
          ]
        }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        inject: true,
        template: paths.appHtml,
      })
    ]
  }
};
