import { execSync } from 'child_process';
import { join } from 'path';
import inquirer from 'inquirer';
import ora from 'ora';
import chalk from 'chalk';
import { isFileOrFolderExists } from '@compass-aiden/helpers/cjs';

export default async function createUniapp() {
  const { projectPath } = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectPath',
      message: '请指定项目路径',
      default: './new-project',
    },
  ]);
  const loading = ora();
  loading.start(chalk.cyan('开始创建项目文件\n'));
  const runCwdPath = join(process.cwd(), projectPath);
  const execOptions = { stdio: 'inherit' as const };
  if (isFileOrFolderExists(runCwdPath)) {
    loading.fail(chalk.red('目标路径已经存在'));
    return;
  }
  execSync(`npx degit dcloudio/uni-preset-vue#vite-ts ${projectPath}`, execOptions);
  loading.succeed(chalk.green('创建完成'));
}
