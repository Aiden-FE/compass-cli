import { Command } from 'commander';
import inquirer from 'inquirer';
import {
  createNext,
  createElectron,
  createNest,
  createReact,
  createTurbo,
  createUniapp,
  createVue,
  selectPkgManager,
  createAngular,
} from '@/utils';
import { PkgManager } from '@/interfaces';

interface CommandOptions {
  projectType?: 'turboMonorepo' | 'uniapp' | 'vue' | 'react' | 'electron' | 'nest' | 'next' | 'angular' | string;
  pkgManager?: PkgManager;
}

/**
 * @description 创建项目
 * @example
 * ```bash
 * compass create <path> [options]
 * ```
 */
export default (program: Command) => {
  program
    .command('create')
    .description('快速创建官方标准项目')
    .option(
      '-T, --project-type [projectType]',
      '需要创建的项目类型\n\t\t\t\t\t- vue\tVue项目\n\t\t\t\t\t- react\tReact项目\n\t\t\t\t\t- angular\tAngular项目\n\t\t\t\t\t- next\tNext SSR项目\n\t\t\t\t\t- turboMonorepo\tTurbo monorepo项目\n\t\t\t\t\t- uniapp\tUniapp跨端项目\n\t\t\t\t\t- electron\tElectron桌面端项目\n\t\t\t\t\t- nest\tNest后端项目',
    )
    .option('-M, --pkg-manager [pkgManager]', '指定npm管理器. npm,yarn,pnpm')
    .action(async (options: CommandOptions) => {
      const { projectType } = options.projectType
        ? { projectType: options.projectType }
        : await inquirer.prompt([
            {
              type: 'list',
              name: 'projectType',
              message: '请选择模板',
              choices: [
                {
                  name: 'Vue 项目',
                  value: 'vue',
                },
                {
                  name: 'React 项目',
                  value: 'react',
                },
                {
                  name: 'Angular 项目',
                  value: 'angular',
                },
                {
                  name: 'Next SSR项目',
                  value: 'next',
                },
                {
                  name: 'Turbo monorepo项目',
                  value: 'turboMonorepo',
                },
                {
                  name: 'Uniapp 跨端项目',
                  value: 'uniapp',
                },
                {
                  name: 'Electron 桌面端项目',
                  value: 'electron',
                },
                {
                  name: 'Nest 后端项目',
                  value: 'nest',
                },
              ],
            },
          ]);
      if (projectType === 'turboMonorepo') {
        const manager = options.pkgManager || (await selectPkgManager());
        await createTurbo({ pkgManager: manager });
      }
      if (projectType === 'uniapp') {
        await createUniapp();
      }
      if (projectType === 'vue') {
        await createVue();
      }
      if (projectType === 'react') {
        await createReact();
      }
      if (projectType === 'electron') {
        await createElectron();
      }
      if (projectType === 'nest') {
        await createNest();
      }
      if (projectType === 'next') {
        await createNext();
      }
      if (projectType === 'angular') {
        await createAngular();
      }
    });
};
