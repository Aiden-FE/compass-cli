import { Command } from 'commander';
import inquirer from 'inquirer';
import { createTurbo, selectPkgManager } from '@/utils';

interface CommandOptions {
  projectType?: 'turboMonorepo' | string;
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
    .description('快速创建项目')
    .option('-T, --project-type [projectType]', '需要创建的项目类型')
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
                  name: 'Turbo monorepo',
                  value: 'turboMonorepo',
                },
              ],
            },
          ]);
      if (projectType === 'turboMonorepo') {
        const manager = await selectPkgManager();
        await createTurbo({ pkgManager: manager });
      }
    });
};
