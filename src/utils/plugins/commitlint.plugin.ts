import { execSync } from 'child_process';
import { join } from 'path';
import chalk from 'chalk';
import { confirm } from '@inquirer/prompts';
import { createFileSync } from '@compass-aiden/helpers/cjs';
import { PkgManager } from '@/interfaces';
import Logger from '../logger';
import { addGithooksPlugin } from './githooks.plugin';
import { deleteFilesSync } from '../delete-files-sync';

const COMMITLINT_CONFIG_FILE = `module.exports = {
  extends: ['@commitlint/config-conventional'],
};
`;

export async function addCommitlintPlugin(options?: { pkgManager?: PkgManager; cwd?: string }) {
  const { pkgManager, cwd } = {
    pkgManager: 'npm' as PkgManager,
    ...options,
  };
  const execOption = { stdio: 'inherit' as const, cwd };
  const loading = Logger.createLoading();
  loading.start(chalk.cyan('开始安装 Commitlint 插件'));

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
    loading.start(chalk.cyan('开始安装 Commitlint 插件'));
  }

  execSync(`${pkgManager} add -D @commitlint/cli @commitlint/config-conventional`, execOption);
  execSync('npm pkg set simple-git-hooks.commit-msg="npx --no -- commitlint --edit \\$1"', execOption);
  createFileSync('commitlint.config.js', COMMITLINT_CONFIG_FILE, { cwd });
  execSync('npx simple-git-hooks', execOption);

  Logger.success(`Installed @commitlint/cli @commitlint/config-conventional at ${cwd || process.cwd()}`);
  Logger.success(`Set 'simple-git-hooks.commit-msg' field at ${cwd || process.cwd()}/package.json`);
  Logger.success(`Created file at ${cwd || process.cwd()}/commitlint.config.js`);
  Logger.success(`Ran 'npx simple-git-hooks' to update hooks at ${cwd || process.cwd()}`);
  loading.succeed(chalk.green('成功安装 Commitlint 插件,将在每次Commit提交时验证提交信息'));
}

export async function removeCommitlintPlugin(options?: { pkgManager?: PkgManager; cwd?: string }) {
  const { pkgManager, cwd } = {
    pkgManager: 'npm' as PkgManager,
    ...options,
  };
  const execOption = { stdio: 'inherit' as const, cwd };
  const loading = Logger.createLoading();
  loading.start(chalk.cyan('开始卸载 Commitlint 插件'));

  execSync(`${pkgManager} remove @commitlint/cli @commitlint/config-conventional`, execOption);
  execSync('npm pkg delete simple-git-hooks.commit-msg', execOption);
  deleteFilesSync(join(cwd || './', 'commitlint.config.js'));
  execSync('npx simple-git-hooks', execOption);

  Logger.success(`Uninstalled @commitlint/cli @commitlint/config-conventional at ${cwd || process.cwd()}`);
  Logger.success(`Deleted 'simple-git-hooks.commit-msg' field at ${cwd || process.cwd()}/package.json`);
  Logger.success(`Deleted file at ${cwd || process.cwd()}/commitlint.config.js`);
  Logger.success(`Ran 'npx simple-git-hooks' to update hooks at ${cwd || process.cwd()}`);

  loading.succeed(chalk.green('成功卸载 Commitlint 插件'));
}
