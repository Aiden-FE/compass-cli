import { Command } from 'commander';
import { input, select } from '@inquirer/prompts';
import { join, dirname } from 'path';
import { isFileOrFolderExists } from '@compass-aiden/helpers/cjs';
import { SELECT_TEMPLATE } from '@/constants';
import {
  Logger,
  pullCliTemplate,
  pullCustomTemplate,
  pullNextTemplate,
  pullStylesTemplate,
  pullUtilsTemplate,
} from '@/utils';

export default (program: Command) => {
  program
    .command('pull')
    .description('通过拉取模板来创建项目. 问答式收集配置项,cli提供对应选项参数可跳过询问相关的流程')
    .option('-N, --name [name]', '项目路径, 如: new-project, ./temp/new-project')
    .option(
      '-T, --template-type [tempType]',
      '需要拉取的模板类型\n\t\t\t\t\t- custom\t自定义模板,仅支持Github模板. 自动将.handlebars后缀文件同路径编译为无后缀的文件,变量可按需提供\n\t\t\t\t\t- nextjs\tNextjs SSR项目模板\n\t\t\t\t\t- utils\tUtils实用程序工具库模板\n\t\t\t\t\t- cli\tCommandline命令行模板\n\t\t\t\t\t- styles\tStyles基础样式库模板',
    )
    .option('--repo-author [repoAuthor]', '仅自定义模板下有效. 指定仓库作者名称')
    .option('--repo-name [repoName]', '仅自定义模板下有效. 指定仓库名称')
    .option('--repo-branch [repoBranch]', '仅自定义模板下有效. 指定仓库分支')
    .option('--repo-token [repoToken]', '仅自定义模板下有效. 拉取私有仓库时需要提供')
    .option(
      '--repo-ignore-files [repoIgnoreFiles]',
      '仅自定义模板下有效. 需要忽略的文件,多个文件请以","分隔,例如: "package.json,README.md"等,模板内文件路径后缀命中的文件不会被编译',
    )
    .option(
      '--repo-template-data [repoTemplateData]',
      '仅自定义模板下有效. 可在此处提供模板变量, 请输入可被JSON.parse处理的对象数据或JSON数据',
    )
    .action(async (options) => {
      let repoTemplateData: object | undefined;
      if (options.repoTemplateData) {
        try {
          const data = JSON.parse(options.repoTemplateData);
          if (typeof data === 'object') {
            repoTemplateData = data;
          } else {
            Logger.error('--repo-template-data需要输入可被JSON.parse处理的对象数据或JSON数据');
            return;
          }
        } catch {
          Logger.error('--repo-template-data需要输入可被JSON.parse处理的对象数据或JSON数据');
          return;
        }
      }
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

      if (tempType === 'nextjs') {
        await pullNextTemplate({
          projectPath,
          templateData: await tempConfig.getTemplateVars({
            projectName,
          }),
        });
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

      if (tempType === 'styles') {
        await pullStylesTemplate({
          projectPath,
          templateData: await tempConfig.getTemplateVars({
            projectName,
          }),
        });
        return;
      }

      if (tempType === 'cli') {
        await pullCliTemplate({
          projectPath,
          templateData: await tempConfig.getTemplateVars({
            projectName,
          }),
        });
        return;
      }

      if (tempType === 'custom') {
        await pullCustomTemplate({
          projectPath,
          author:
            options.repoAuthor ||
            (await input({
              message: '请输入模板仓库作者名',
              validate: (value) => !!value,
            })),
          repoName:
            options.repoName ||
            (await input({
              message: '请输入模板仓库名',
              validate: (value) => !!value,
            })),
          branch:
            options.repoBranch ||
            (await input({
              message: '[可选]请输入模板仓库分支名, 默认主分支',
            })) ||
            undefined,
          token:
            options.repoToken ||
            (await input({
              message: '[可选]私有仓库请提供授权token',
            })) ||
            undefined,
          ignoreFilesStr:
            options.repoIgnoreFiles ||
            (await input({
              message:
                '[可选]可在此处提供需要忽略的文件,多个文件请以","分隔,例如: "package.json,README.md" 等,模板内文件路径后缀命中的文件不会被编译',
            })) ||
            undefined,
          templateData: repoTemplateData
            ? { projectName, ...repoTemplateData }
            : await tempConfig.getTemplateVars({
                projectName,
              }),
        });
        return;
      }

      Logger.error('❌ 暂不支持的模板类型');
    });
};
