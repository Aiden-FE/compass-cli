import { Command } from 'commander';

/**
 * @description 创建项目
 * @example
 * ```bash
 * compass create <path> [options]
 * ```
 */
export default (program: Command) => {
  program
    .command('create <project_path>')
    .description('快速创建项目')
    .action(async (projectPath, options) => {
      console.log('debug: ', projectPath, options);
    });
};
