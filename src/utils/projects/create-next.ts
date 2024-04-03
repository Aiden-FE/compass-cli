import { execSync } from 'child_process';
import ora from 'ora';
import chalk from 'chalk';

export default async function createNext() {
  const loading = ora();
  loading.start(chalk.cyan('开始创建项目文件\n'));
  const execOptions = { stdio: 'inherit' as const };
  execSync(`npx create-next-app@latest`, execOptions);
  loading.succeed(chalk.green('创建完成'));
}
