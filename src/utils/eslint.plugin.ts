import { join } from 'path';
import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import { select } from '@inquirer/prompts';
import chalk from 'chalk';
import { createFileSync, isFileOrFolderExists } from '@compass-aiden/helpers/cjs';
import { ESLINT_PLUGINS } from '@/constants';
import { PkgManager } from '@/interfaces';
import Logger from './logger';
import { deleteFilesSync } from './delete-files-sync';

/**
 * @description 添加eslint插件
 * @param options 配置项
 */
export async function addEslintPlugin(options?: { pkgManager?: PkgManager; cwd?: string }) {
  const { pkgManager, cwd } = {
    pkgManager: 'npm' as PkgManager,
    ...options,
  };
  const execOption = { stdio: 'inherit' as const, cwd };
  const loading = Logger.createLoading();

  const answer = await select({
    message: '请选择项目类型',
    choices: ESLINT_PLUGINS.map((item) => ({ name: item.name, value: item.value })),
  });
  const pluginConfig = ESLINT_PLUGINS.find((plugin) => plugin.value === answer);
  if (!pluginConfig) {
    Logger.error('未知项目类型');
    return;
  }
  loading.start(chalk.cyan('开始安装 Eslint 插件'));
  const eslintFilePath = join(cwd || process.cwd(), '.eslintrc.json');
  let isCreateFile = false;
  if (!isFileOrFolderExists(eslintFilePath)) {
    createFileSync(eslintFilePath, JSON.stringify({}));
    isCreateFile = true;
  }
  const eslintFileDataString = readFileSync(eslintFilePath, 'utf-8');
  const eslintFileData = JSON.parse(eslintFileDataString);
  if (!eslintFileData.parserOptions) {
    eslintFileData.parserOptions = {
      project: ['tsconfig.json', 'tsconfig.*.json'],
    };
  } else if (!eslintFileData.parserOptions.project) {
    eslintFileData.parserOptions.project = ['tsconfig.json', 'tsconfig.*.json'];
  }
  if (!eslintFileData.extends) {
    eslintFileData.extends = [];
  } else if (!Array.isArray(eslintFileData.extends)) {
    eslintFileData.extends = [eslintFileData.extends];
  }
  // 将插件写入eslint extends配置
  if (!eslintFileData.extends.includes(answer)) {
    eslintFileData.extends.push(answer);
    writeFileSync(eslintFilePath, JSON.stringify(eslintFileData, null, 2), 'utf-8');
  }
  // 在package.json内写入lint命令
  execSync(`npm pkg set scripts.lint="${pluginConfig.lint}"`, execOption);
  execSync(
    `${pkgManager} add -D @compass-aiden/eslint-config eslint eslint-plugin-import ${pluginConfig.deps.join(' ')}`,
    execOption,
  );

  Logger.success(`${isCreateFile ? 'Created' : 'Updated'} file at ${eslintFilePath}`);
  Logger.success(
    `Installed @compass-aiden/eslint-config eslint eslint-plugin-import ${pluginConfig.deps.join(' ')} at ${cwd || process.cwd()}`,
  );
  Logger.success(`Set 'scripts.lint' field at ${cwd || process.cwd()}/package.json`);
  loading.succeed(chalk.green('成功安装 Eslint 插件, 可通过以下命令主动校验\n\n\tnpm run lint'));
}

export async function removeEslintPlugin(options?: { pkgManager?: PkgManager; cwd?: string }) {
  const { pkgManager, cwd } = {
    pkgManager: 'npm' as PkgManager,
    ...options,
  };
  const execOption = { stdio: 'inherit' as const, cwd };
  const loading = Logger.createLoading();
  const answer = await select({
    message: '请选择项目类型',
    choices: ESLINT_PLUGINS.map((item) => ({ name: item.name, value: item.value })),
  });
  const pluginConfig = ESLINT_PLUGINS.find((plugin) => plugin.value === answer);
  if (!pluginConfig) {
    Logger.error('未知项目类型');
    return;
  }
  loading.start(chalk.cyan('开始卸载 Eslint 插件'));
  const eslintFilePath = join(cwd || process.cwd(), '.eslintrc.json');
  let isDeleted = false;
  if (isFileOrFolderExists(eslintFilePath)) {
    deleteFilesSync(eslintFilePath);
    isDeleted = true;
  }

  execSync(`npm pkg delete scripts.lint`, execOption);
  execSync(
    `${pkgManager} remove @compass-aiden/eslint-config eslint eslint-plugin-import ${pluginConfig.deps.join(' ')}`,
    execOption,
  );

  Logger.success(
    `Uninstalled @compass-aiden/eslint-config eslint eslint-plugin-import ${pluginConfig.deps.join(' ')} at ${cwd || process.cwd()}`,
  );
  Logger.success(`Deleted 'scripts.lint' field at ${cwd || process.cwd()}/package.json`);
  if (isDeleted) {
    Logger.success(`Deleted file at ${eslintFilePath}`);
  }
  loading.succeed(chalk.green('成功卸载 Eslint 插件'));
}
