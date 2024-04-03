import { execSync } from 'child_process';
import chalk from 'chalk';
import { confirm } from '@inquirer/prompts';
import { PkgManager } from '@/interfaces';
import Logger from '../logger';
import { addGithooksPlugin } from './githooks.plugin';
import { addPrettierPlugin } from './prettier.plugin';

export async function addPrettyQuickPlugin(options?: { pkgManager?: PkgManager; cwd?: string }) {
  const { pkgManager, cwd } = {
    pkgManager: 'npm' as PkgManager,
    ...options,
  };
  const execOption = { stdio: 'inherit' as const, cwd };
  const loading = Logger.createLoading();
  loading.start(chalk.cyan('开始安装 PrettyQuick 插件'));

  const hasGithooks = execSync('npm pkg get devDependencies.simple-git-hooks', { cwd }).toString().trim();
  const isHasGithooks = !(hasGithooks === '{}' || hasGithooks === '');
  if (!isHasGithooks) {
    loading.stop();

    const confirmInstall = await confirm({
      message: '未发现前置Githooks插件,是否现在安装?',
      default: true,
    });

    if (!confirmInstall) {
      Logger.error(chalk.red('❌ 缺少前置插件安装失败'));
      return;
    }
    await addGithooksPlugin(options);
    loading.start(chalk.cyan('开始安装 PrettyQuick 插件'));
  }

  const hasPrettier = execSync('npm pkg get devDependencies.prettier', { cwd }).toString().trim();
  const isHasPrettier = !(hasPrettier === '{}' || hasPrettier === '');
  if (!isHasPrettier) {
    loading.stop();

    const confirmInstall = await confirm({
      message: '未发现前置Prettier插件,是否现在安装?',
      default: true,
    });

    if (!confirmInstall) {
      Logger.error(chalk.red('❌ 缺少前置插件安装失败'));
      return;
    }
    await addPrettierPlugin(options);
    loading.start(chalk.cyan('开始安装 PrettyQuick 插件'));
  }

  execSync(`${pkgManager} add -D pretty-quick`, execOption);
  execSync('npm pkg set simple-git-hooks.pre-commit="npx pretty-quick --staged"', execOption);
  execSync('npx simple-git-hooks', execOption);

  Logger.success(`Installed pretty-quick at ${cwd || process.cwd()}`);
  Logger.success(`Set 'simple-git-hooks.pre-commit' field at ${cwd || process.cwd()}/package.json`);
  Logger.success(`Ran 'npx simple-git-hooks' to install hooks at ${cwd || process.cwd()}`);
  loading.succeed(chalk.green('成功安装 PrettyQuick 插件,将在每次commit前格式化变更文件'));
}

export async function removePrettyQuickPlugin(options?: { pkgManager?: PkgManager; cwd?: string }) {
  const { pkgManager, cwd } = {
    pkgManager: 'npm' as PkgManager,
    ...options,
  };
  const execOption = { stdio: 'inherit' as const, cwd };
  const loading = Logger.createLoading();
  loading.start(chalk.cyan('开始移除 PrettyQuick 插件'));
  execSync(`${pkgManager} remove pretty-quick`, execOption);
  execSync('npm pkg delete simple-git-hooks.pre-commit', execOption);
  execSync('npx simple-git-hooks', execOption);

  Logger.success(`Uninstalled pretty-quick at ${cwd || process.cwd()}`);
  Logger.success(`Deleted 'simple-git-hooks.pre-commit' field at ${cwd || process.cwd()}/package.json`);
  Logger.success(`Ran 'npx simple-git-hooks' to update hooks at ${cwd || process.cwd()}`);
  loading.succeed(chalk.green('成功移除 PrettyQuick 插件'));
}
