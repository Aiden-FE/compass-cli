import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';
import { createFileSync, isFileOrFolderExists } from '@compass-aiden/helpers/cjs';
import { PkgManager } from '@/interfaces';
import Logger from '../logger';
import { deleteFilesSync } from '../delete-files-sync';

const PRETTIERRC_DATA = `{
  "printWidth": 120,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "quoteProps": "as-needed",
  "jsxSingleQuote": false,
  "trailingComma": "all",
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "always",
  "endOfLine": "lf"
}
`;

const PRETTIERIGNORE_DATA = `# TypeScript v1 declaration files
typings/
types/

# Output
dist
coverage
*.tgz
.next
.nuxt
tmp
out-tsc
stats.html

# lockfile
pnpm-lock.yaml
yarn.lock
package-lock.json

# Cache
.npm
.eslintcache
temp
node_modules
`;

export async function addPrettierPlugin(options?: { pkgManager?: PkgManager; cwd?: string }) {
  const { pkgManager, cwd } = {
    pkgManager: 'npm' as PkgManager,
    ...options,
  };
  const execOption = { stdio: 'inherit' as const, cwd };
  const loading = Logger.createLoading();
  loading.start(chalk.cyan('开始安装 Prettier 插件'));

  const hasEslint = execSync('npm pkg get devDependencies.eslint', { cwd }).toString().trim();
  const isHasEslint = !(hasEslint === '{}' || hasEslint === '');
  execSync(
    `${pkgManager} add -D prettier${isHasEslint ? ' eslint-config-prettier eslint-plugin-prettier' : ''}`,
    execOption,
  );
  execSync('npm pkg set scripts.format="prettier --write src"', execOption);
  createFileSync('.prettierrc.json', PRETTIERRC_DATA, { cwd });
  createFileSync('.prettierignore', PRETTIERIGNORE_DATA, { cwd });
  const eslintFilePath = join(cwd || process.cwd(), '.eslintrc.json');
  let isModifiedOfEslint = false;
  if (isHasEslint && isFileOrFolderExists(eslintFilePath)) {
    const eslintFileDataString = readFileSync(eslintFilePath, 'utf-8');
    const eslintFileData = JSON.parse(eslintFileDataString);
    if (!eslintFileData.extends) {
      eslintFileData.extends = [];
    } else if (!Array.isArray(eslintFileData.extends)) {
      eslintFileData.extends = [eslintFileData.extends];
    }
    if (!eslintFileData.extends.includes('plugin:prettier/recommended')) {
      eslintFileData.extends?.push('plugin:prettier/recommended');
      writeFileSync(eslintFilePath, JSON.stringify(eslintFileData, null, 2), 'utf-8');
      isModifiedOfEslint = true;
    }
  }
  Logger.success(
    `Installed prettier${isHasEslint ? ' eslint-config-prettier eslint-plugin-prettier' : ''} at ${cwd || process.cwd()}`,
  );
  Logger.success(`Set 'scripts.format' field at ${cwd || process.cwd()}/package.json`);
  if (isModifiedOfEslint) {
    Logger.success(`Modified file at ${eslintFilePath}`);
  }
  Logger.success(`Created file at ${cwd || process.cwd()}/.prettierrc.json`);
  Logger.success(`Created file at ${cwd || process.cwd()}/.prettierignore`);
  if (isHasEslint && !isModifiedOfEslint) {
    Logger.warn(
      '找到Eslint相关依赖,但未找到.eslintrc.json配置文件,请手动在.eslintrc相关配置文件中的extends字段加入"plugin:prettier/recommended"配置',
    );
  }
  loading.succeed(chalk.green('成功安装 Prettier 插件,可通过以下命令主动执行格式化:\n\n\tnpm run format'));
}

export async function removePrettierPlugin(options?: { pkgManager?: PkgManager; cwd?: string }) {
  const { pkgManager, cwd } = {
    pkgManager: 'npm' as PkgManager,
    ...options,
  };
  const execOption = { stdio: 'inherit' as const, cwd };
  const loading = Logger.createLoading();
  loading.start(chalk.cyan('开始移除 Prettier 插件'));

  const hasEslint = execSync('npm pkg get devDependencies.eslint', { cwd }).toString().trim();
  const isHasEslint = !(hasEslint === '{}' || hasEslint === '');
  const eslintFilePath = join(cwd || process.cwd(), '.eslintrc.json');
  let isModifiedOfEslint = false;
  if (isHasEslint && isFileOrFolderExists(eslintFilePath)) {
    const eslintFileDataString = readFileSync(eslintFilePath, 'utf-8');
    const eslintFileData = JSON.parse(eslintFileDataString);
    if (eslintFileData.extends?.length && eslintFileData.extends.includes('plugin:prettier/recommended')) {
      eslintFileData.extends = eslintFileData.extends.filter((item: string) => item !== 'plugin:prettier/recommended');
      writeFileSync(eslintFilePath, JSON.stringify(eslintFileData, null, 2), 'utf-8');
      isModifiedOfEslint = true;
    }
  }
  execSync(
    `${pkgManager} remove prettier${isHasEslint ? ' eslint-config-prettier eslint-plugin-prettier' : ''}`,
    execOption,
  );
  execSync('npm pkg delete scripts.format', execOption);
  deleteFilesSync([join(cwd || './', '.prettierrc.json'), join(cwd || './', '.prettierignore')]);

  Logger.success(
    `Uninstalled prettier${isHasEslint ? ' eslint-config-prettier eslint-plugin-prettier' : ''} at ${cwd || process.cwd()}`,
  );
  Logger.success(`Deleted 'scripts.format' field at ${cwd || process.cwd()}/package.json`);
  Logger.success(`Deleted file at ${cwd || process.cwd()}/.prettierrc.json`);
  Logger.success(`Deleted file at ${cwd || process.cwd()}/.prettierignore`);
  if (isModifiedOfEslint) {
    Logger.success(`Modified file at ${eslintFilePath}`);
  }
  if (isHasEslint && !isModifiedOfEslint) {
    Logger.warn(
      '找到Eslint相关依赖,但未找到.eslintrc.json配置文件,请手动在.eslintrc相关配置文件中的extends字段移除"plugin:prettier/recommended"配置',
    );
  }
  loading.succeed(chalk.green('成功移除 Prettier 插件'));
}
