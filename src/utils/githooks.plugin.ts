import { execSync } from 'child_process';
import chalk from 'chalk';
import { PkgManager } from '@/interfaces';
import Logger from './logger';

export async function addGithooksPlugin(options?: { pkgManager?: PkgManager; cwd?: string }) {
  const { pkgManager, cwd } = {
    pkgManager: 'npm' as PkgManager,
    ...options,
  };
  const loading = Logger.createLoading();
  loading.start(chalk.cyan('开始安装SimpleGitHooks插件'));
  execSync(`${pkgManager} add -D simple-git-hooks`, { stdio: 'inherit', cwd });
  execSync('npm pkg set simple-git-hooks={} --json', { stdio: 'inherit', cwd });
  execSync('npm pkg set scripts.prepare="npx simple-git-hooks"', { stdio: 'inherit', cwd });
  Logger.success(`Installed simple-git-hooks at ${cwd || process.cwd()}`);
  Logger.success(`Set 'simple-git-hooks' field at ${cwd || process.cwd()}/package.json`);
  Logger.success(`Set 'scripts.prepare' field at ${cwd || process.cwd()}/package.json`);

  loading.succeed(
    chalk.green('SimpleGitHooks 插件安装完成\n使用文档参考: https://github.com/toplenboren/simple-git-hooks'),
  );
}

export async function removeGithooksPlugin(options?: { pkgManager?: PkgManager; cwd?: string }) {
  const { pkgManager, cwd } = {
    pkgManager: 'npm' as PkgManager,
    ...options,
  };
  const loading = Logger.createLoading();
  loading.start(chalk.cyan('开始移除SimpleGitHooks插件'));
  execSync(`${pkgManager} remove simple-git-hooks`, { stdio: 'inherit', cwd });
  execSync('npm pkg delete simple-git-hooks', { stdio: 'inherit', cwd });
  execSync('npm pkg delete scripts.prepare', { stdio: 'inherit', cwd });
  Logger.success(`Uninstalled simple-git-hooks at ${cwd || process.cwd()}`);
  Logger.success(`Delete 'simple-git-hooks' field at ${cwd || process.cwd()}/package.json`);
  Logger.success(`Delete 'scripts.prepare' field at ${cwd || process.cwd()}/package.json`);
  loading.succeed(chalk.green('SimpleGitHooks 插件移除完成'));
}
