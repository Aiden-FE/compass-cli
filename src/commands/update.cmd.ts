import { Command } from 'commander';
import ora from 'ora';
import chalk from 'chalk';
import { getRepoReleasesFromNpm } from '@/http';
import { version } from '../../package.json';

/**
 * @description 检查Compass CLI是否存在新版本内容
 * @example
 * ```bash
 * compass update # 执行更新自检
 * ```
 */
export default (program: Command) => {
  program
    .command('update')
    .description('检查是否存在新版本CLI')
    .action(async () => {
      const loading = ora();
      loading.start(chalk.cyan('正在检查版本信息'));
      const releases = await getRepoReleasesFromNpm();
      const latestVersion = releases['dist-tags'].latest;
      loading.stop();
      console.log(`Current version: ${version}, latest is ${latestVersion}`);
    });
};
