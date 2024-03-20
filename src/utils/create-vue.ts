import { execSync } from 'child_process';
import ora from 'ora';
import chalk from 'chalk';

export default async function createVue() {
  const loading = ora();
  loading.start(chalk.cyan('开始创建项目文件\n'));
  const execOptions = { stdio: 'inherit' as const };
  execSync(`npm create vue@latest`, execOptions);
  loading.succeed(chalk.green('创建完成'));
}
