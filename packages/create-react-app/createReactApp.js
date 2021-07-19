const chalk = require('chalk');
const { Command } = require('commander');
const fs = require('fs-extra');
const path = require('path');
const spawn = require('cross-spawn'); // 跨平台开子进程

const packageJson = require('./package.json');

let projectName;

async function init() {
  const program = new Command(packageJson.name)
    .version(packageJson.version)
    .arguments('<project-dicectory>')
    .usage(`${chalk.green('<project-dicectory>')}`)
    .action(name => {
      projectName = name;
    })
    .parse(process.argv); // 解析命令行参数 [node完整路径, 当前node脚本路径, ...其他参数]
    console.log('projectName: ', projectName)

    await createApp(projectName);
}

async function createApp(appName) {
  const root = path.resolve(appName); // 生成项目的绝对路劲
  fs.ensureDirSync(appName); // 确保目录存在，否则创建

  console.log(`Creating a new React app in ${chalk.green(root)}.`);

  const packageJson = {
    name: appName,
    version: '0.1.0',
    private: true,
  };

  fs.writeFileSync(
    path.join(root, 'package.json'),
    JSON.stringify(packageJson, null, 2) // JSON.stringify(value[, replacer [, space]])
  );

  const originalDirectory = process.cwd(); // 保存node 当前工作目录（项目目录的父目录）
  process.chdir(root); // 改变当前工作目录只

  await run(root, appName, originalDirectory);
};

async function run(root, appName, originalDirectory) {

  const scriptName = 'react-scripts';
  const templateName = 'cra-template';

  const allDependencies = ['react', 'react-dom', scriptName, templateName];
  console.log('Installing packages. This might take a couple of minutes.');

  // log: Installing react, react-dom, and react-scripts with cra-template...
  console.log(
    `Installing ${chalk.cyan('react')}, ${chalk.cyan(
      'react-dom'
    )}, and ${chalk.cyan(scriptName)}${` with ${chalk.cyan(templateName)}`}...`
  );

  await install(root, allDependencies);
  
  // root：项目根目录；appName：项目名称；verbose：是否显示详细内容；originalDirectory：原始目录；
  // templateName：模板
  const data = [root, appName, true, originalDirectory, templateName];

  // todo: 替换成自己写的包
  const source = `
    var init = require('react-scripts/scripts/init.js');
    init.apply(null, JSON.parse(process.argv[1]));
  `;
  
  // 拷贝模板文件到项目目录
  await executeNodeScript({ cwd: process.cwd() }, data, source);
  console.log('Done.');
  process.exit();
};

async function install(root, allDependencies) {
  return new Promise((resolve, reject) => {
    const command = 'yarnpkg';
    const args = ['add', '--exact', ...allDependencies, '--cwd', root];

    const child = spawn(command, args, { stdio: 'inherit' }); // inherit：子进程与父进程共享输出
    child.on('close', resolve);
  })
};

async function executeNodeScript({ cwd }, data, source) {
  return new Promise((resolve, reject) => {
    // node -e "console.log(process.argv[1])" -- abc   =>  输出 abc
    const child = spawn(
      process.execPath, // node 可执行路径
      ['-e', source, '--', JSON.stringify(data)],
      { cwd, stdio: 'inherit' },
    );
    child.on('close', resolve);
  })
};

module.exports = {
  init,
}