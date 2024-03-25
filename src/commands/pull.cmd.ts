import { Command } from 'commander';
import { input, select } from '@inquirer/prompts';
import { join, dirname } from 'path';
import { isFileOrFolderExists } from '@compass-aiden/helpers/cjs';
import { SELECT_TEMPLATE } from '@/constants';
import { Logger, pullUtilsTemplate } from '@/utils';

export default (program: Command) => {
  program
    .command('pull')
    .description('通过拉取模板来创建项目')
    .option('-N, --name [name]', '项目路径, 如: new-project, ./temp/new-project')
    .option('-T, --template-type [tempType]', '需要拉取的模板类型\n\t\t\t\t\t- utils\tUtils实用程序工具库模板')
    .action(async (options) => {
      const tempType =
        options.templateType ||
        (await select({
          message: '请选择要拉取的模板类型',
          choices: SELECT_TEMPLATE,
        }));
      const tempConfig = SELECT_TEMPLATE.find((item) => item.value === tempType);
      if (!tempConfig) {
        throw new Error('Not found template');
      }

      let projectPath =
        options.name ||
        (await input({
          message: '请输入项目路径',
          default: './new-project',
        }));

      projectPath = projectPath.startsWith('/') ? projectPath : join(process.cwd(), projectPath);
      const projectName = projectPath.replace(join(dirname(projectPath), './'), '');

      if (isFileOrFolderExists(projectPath)) {
        Logger.error('❌ 目标路径已经存在');
        return;
      }

      if (tempType === 'utils') {
        await pullUtilsTemplate({
          projectPath,
          templateData: await tempConfig.getTemplateVars({
            projectName,
          }),
        });
        return;
      }

      Logger.error('❌ 暂不支持的模板类型');
    });
};
