#!/usr/bin/env node

// 开启子进程
const spawn = require('cross-spawn');

// 获取命令行参数
const args = process.argv.slice(2);
const script = args[0]; // build

spawn.sync(
  process.execPath, // node 可执行文件路径
  [require.resolve('../scripts/' + script)],
  { stdio: 'inherit' } // 父子进程共享输入输出
);
