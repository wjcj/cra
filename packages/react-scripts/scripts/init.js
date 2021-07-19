const execSync = require('child_process').execSync;
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const spawn = require('cross-spawn');
const os = require('os');

module.exports = function init(appPath, appName) {
  // 1. 修改 package.json，合并 cra-template 中 packageJson 的字段
  const templateName = 'cra-template';
  // appPackageJson
  const appPackage = require(path.join(appPath, 'package.json'));

  // 创建 yarn.lock
  fs.existsSync(path.join(appPath, 'yarn.lock'));

  const templatePath = path.dirname(
    require.resolve(`cra-template/package.json`, { paths: [appPath] })
  );

  // cra-template packageJson 配置
  const templateJsonPath = path.join(templatePath, 'template.json');
  
  appPackage.dependencies = appPackage.dependencies || {};
  const templatePackage = require(templateJsonPath).package;

  appPackage.scripts = Object.assign(
    {
      start: 'react-scripts start',
      build: 'react-scripts build',
      test: 'react-scripts test',
      eject: 'react-scripts eject',
    },
    templatePackage.scripts || {},
  );

  appPackage.eslintConfig = {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  };

  appPackage.browserslist = {
    production: [
      '>0.2%',
      'not dead',
      'not op_mini all'
    ],
    development: [
      'last 1 chrome version',
      'last 1 firefox version',
      'last 1 safari version'
    ]
  };

  // 写入 package.json 到 app
  fs.writeFileSync(
    path.join(appPath, 'package.json'),
    JSON.stringify(appPackage, null, 2) + os.EOL
  );

  // 2. 拷贝模板。模板文件目录 cra-template/template
  const templateDir = path.join(templatePath, 'template');
  if (fs.existsSync(templateDir)) {
    fs.copySync(templateDir, appPath);
  } else {
    console.error(
      `Could not locate supplied template: ${chalk.green(templateDir)}`
    );
    return;
  }

  // 3. 创建 git 仓库
  // 将 gitignore 重命名为 `.gitignore`
  // https://github.com/npm/npm/issues/1862
  fs.moveSync(
    path.join(appPath, 'gitignore'),
    path.join(appPath, '.gitignore'),
    []
  );

  initializedGit = false;
  if (tryGitInit()) {
    initializedGit = true;
    console.log('Initialized a git repository.');
  }

  // 4. 安装模板所需依赖
  let remove = 'remove';
  let args = ['add'];
  const dependenciesToInstall = Object.entries({
    ...templatePackage.dependencies,
    ...templatePackage.devDependencies,
  });
  if (dependenciesToInstall.length) {
    args = args.concat(
      dependenciesToInstall.map(([dependency, version]) => {
        return `${dependency}@${version}`;
      })
    );
  }

  if ((!isReactInstalled(appPackage) || templateName) && args.length > 1) {
    console.log(`Installing template dependencies using yarnpkg...`);
 
    const proc = spawn.sync('yarnpkg', args, { stdio: 'inherit' });
    if (proc.status !== 0) {
      console.error(`yarnpkg \`${args.join(' ')}\` failed`);
      return;
    }
  }
  

  // 5. 删除模板
  const proc = spawn.sync('yarnpkg', [remove, templateName], {
    stdio: 'inherit',
  });
  if (proc.status !== 0) {
    console.error(`yarnpkg \`${args.join(' ')}\` failed`);
    return;
  }

  // 6. 提交
  if (initializedGit && tryGitCommit(appPath)) {
    console.log();
    console.log('Created git commit.');
  }

  console.log(chalk.cyan('  cd'), appName);
  console.log(`  ${chalk.cyan(`yarn start`)}`);
}

function tryGitInit() {
  try {
    execSync('git init', { stdio: 'ignore' });
    return true;
  } catch (e) {
    console.warn('Git repo not initialized', e);
    return false;
  }
};

function tryGitCommit(appPath) {
  try {
    execSync('git add -A', { stdio: 'ignore' });
    execSync('git commit -m "Initialize project using Create React App"', {
      stdio: 'ignore',
    });
    return true;
  } catch (e) {
    console.warn('Git commit not created', e);
    console.warn('Removing .git directory...');
    try {
      fs.removeSync(path.join(appPath, '.git'));
    } catch (removeErr) {
      // Ignore.
    }
    return false;
  }
};

function isReactInstalled(appPackage) {
  const dependencies = appPackage.dependencies || {};

  return (
    typeof dependencies.react !== 'undefined' &&
    typeof dependencies['react-dom'] !== 'undefined'
  );
};