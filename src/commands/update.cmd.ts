import { execSync } from 'child_process';
import { Command } from 'commander';
import ora from 'ora';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { compareVersion } from '@compass-aiden/helpers/cjs';
import { getRepoInfoFromNpm } from '@/http';
import { version, name } from '../../package.json';

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
      const releases = await getRepoInfoFromNpm(name);
      if (!releases?.['dist-tags']?.latest) {
        loading.fail(chalk.red('获取更新信息失败'));
        return;
      }
      const latestVersion = releases['dist-tags'].latest;
      if (compareVersion(version, latestVersion) >= 0) {
        loading.succeed(chalk.green('当前已是最新版本'));
        return;
      }
      loading.warn(chalk.yellow(`发现新版本: ${latestVersion}`));
      inquirer
        .prompt([
          {
            type: 'confirm',
            name: 'isUpdate',
            message: '是否立即更新',
            default: true,
          },
        ])
        .then((options) => {
          if (!options.isUpdate) return;
          inquirer
            .prompt([
              {
                type: 'list',
                name: 'commandType',
                message: '请选择对应工具更新',
                choices: [
                  { name: 'npm', value: 'npm' },
                  { name: 'pnpm', value: 'pnpm' },
                  { name: 'yarn', value: 'yarn' },
                ],
              },
            ])
            .then((opts) => {
              const updateLoading = ora();
              updateLoading.start(chalk.cyan('开始更新Compass CLI'));
              switch (opts.commandType) {
                case 'yarn':
                  execSync(`yarn global add ${name}`, { stdio: 'inherit' });
                  break;
                case 'pnpm':
                  execSync(`pnpm up ${name} --latest --global`, { stdio: 'inherit' });
                  break;
                case 'npm':
                default:
                  execSync(`npm install -g ${name}`, { stdio: 'inherit' });
                  break;
              }
              updateLoading.succeed(chalk.green('更新成功,当前已是最新版本.'));
              execSync(`compass -v`, { stdio: 'inherit' });
            });
        });
    });
};
