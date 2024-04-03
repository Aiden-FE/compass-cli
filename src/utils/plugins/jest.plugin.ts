import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import chalk from 'chalk';
import { isFileOrFolderExists } from '@compass-aiden/helpers/cjs';
import { confirm } from '@inquirer/prompts';
import { PkgManager } from '@/interfaces';
import Logger from '../logger';
import { deleteFilesSync } from '../delete-files-sync';
import batchCompileTemplates from '../batch-compile-templates';

// 获取当前模块的绝对路径
// eslint-disable-next-line @typescript-eslint/naming-convention, no-underscore-dangle
const __filename = fileURLToPath(import.meta.url);
// 获取当前模块所在目录的绝对路径
// eslint-disable-next-line @typescript-eslint/naming-convention, no-underscore-dangle
const __dirname = dirname(__filename);
const jestConfigFileTempPath = join(__dirname, '../templates/jest.config.js.handlebars');

interface JestPluginProps {
  pkgManager?: PkgManager;
  cwd?: string;
}

export async function addJestPlugin(options?: JestPluginProps) {
  const { pkgManager, cwd } = {
    pkgManager: 'npm' as PkgManager,
    ...options,
  };
  const execOption = { stdio: 'inherit' as const, cwd };
  const loading = Logger.createLoading();
  const isTsEnv = await confirm({
    message: '是否为Typescript环境?这将为您采用ts-jest相关配置',
    default: true,
  });
  loading.start(chalk.cyan('开始安装 Jest 插件'));

  execSync(`${pkgManager} add -D jest ${isTsEnv ? 'ts-jest @types/jest' : ''}`, execOption);
  execSync(`npm pkg set scripts.test="jest"`, execOption);

  await batchCompileTemplates([[jestConfigFileTempPath, join(cwd || process.cwd(), 'jest.config.js')]], {
    enabledTypescript: isTsEnv,
  });

  Logger.success(`Installed jest ${isTsEnv ? 'ts-jest @types/jest' : ''} at ${cwd || process.cwd()}`);
  Logger.success(`Set 'scripts.test' field at ${join(cwd || process.cwd(), 'package.json')}`);
  Logger.success(`Created file at ${join(cwd || process.cwd(), 'jest.config.js')}`);
  Logger.info('友情提示:');
  Logger.info('如果您的项目存在路径别名请参考 https://kulshekhar.github.io/ts-jest/docs/getting-started/paths-mapping');
  if (isTsEnv) {
    Logger.info(
      `\n如果您的tsconfig文件识别异常,可以在配置文件中自定义配置,例如:
const { defaults: tsjPreset } = require('ts-jest/presets');
module.exports = {
  transform: {
    ...tsjPreset.transform,
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.test.json' }],
  },
}\n`,
    );
  }
  Logger.info('更多帮助信息请查看配置文件注释或Jest相关文档');
  loading.succeed(chalk.green('成功安装 Jest 插件,可通过以下命令进行单元测试\n\n\tnpm run test'));
}

export async function removeJestPlugin(options?: JestPluginProps) {
  const { pkgManager, cwd } = {
    pkgManager: 'npm' as PkgManager,
    ...options,
  };
  const execOption = { stdio: 'inherit' as const, cwd };
  const loading = Logger.createLoading();
  const isTsEnv = await confirm({
    message: '是否为Typescript环境?这将为您移除ts-jest相关配置',
    default: true,
  });
  loading.start(chalk.cyan('开始卸载 Jest 插件'));
  const jestJsConfigFilePath = join(cwd || process.cwd(), 'jest.config.js');

  execSync(`${pkgManager} remove jest ${isTsEnv ? ' ts-jest @types/jest' : ''}`, execOption);
  execSync(`npm pkg delete scripts.test`, execOption);

  let isDeleted = false;
  if (isFileOrFolderExists(jestJsConfigFilePath)) {
    deleteFilesSync(jestJsConfigFilePath);
    isDeleted = true;
  }

  Logger.success(`Uninstalled jest ${isTsEnv ? 'ts-jest @types/jest' : ''} at ${cwd || process.cwd()}`);
  Logger.success(`Deleted 'scripts.test' field at ${join(cwd || process.cwd(), 'package.json')}`);
  if (isDeleted) {
    Logger.success(`Deleted file at ${join(cwd || process.cwd(), 'jest.config.js')}`);
  }
  loading.succeed(chalk.green('成功卸载 Jest 插件'));
}
