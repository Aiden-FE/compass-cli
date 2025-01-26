import { execSync } from 'child_process';
import ora from 'ora';
import chalk from 'chalk';
import inquirer from 'inquirer';

export default async function createFastify() {
  const { projectPath } = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectPath',
      message: '请指定项目路径',
      default: 'new-project',
    },
  ]);
  const loading = ora();
  loading.start(chalk.cyan('开始创建项目文件\n'));
  const execOptions = { stdio: 'inherit' as const };
  execSync(`npx -y fastify-cli@latest generate ${projectPath} --esm --lang=ts`, execOptions);
  loading.succeed(chalk.green('创建完成'));
}
