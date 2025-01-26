import chalk from 'chalk';
import Logger from '../logger';
import getFilePathsInFolder from '../get-file-paths-in-folder';
import batchCompileTemplates from '../batch-compile-templates';
import { join, resolve } from 'node:path';

interface LocalTempProps {
  projectPath?: string;
  ignoreFilesStr?: string;
  localTemplatePath: string;
  templateData?: Record<string, string | number | boolean>;
}

export default async function pullLocalTemplate(options: LocalTempProps) {
  const { ignoreFilesStr, localTemplatePath, projectPath, templateData } = options;
  let ignoreFiles = ignoreFilesStr ? ignoreFilesStr.split(',') : [];
  ignoreFiles = ignoreFiles.concat(['.git', 'node_modules']);
  const loading = Logger.createLoading();
  loading.start(chalk.cyan('正在拉取本地模板'));
  const tempFiles = getFilePathsInFolder(localTemplatePath).filter((fp) => {
    return ![resolve(localTemplatePath, '.git'), resolve(localTemplatePath, 'node_modules')].some((ignorePath) => {
      return fp.startsWith(ignorePath);
    });
  });
  await batchCompileTemplates(
    tempFiles
      .map((fp) => {
        return [
          fp,
          join(projectPath || './new-project', fp.replace(localTemplatePath, '')).replace('.handlebars', ''),
        ] as [string, string];
      })
      .filter((item) => !ignoreFiles.some((f) => item[0].endsWith(f))),
    templateData || {},
  );
  loading.succeed(chalk.green('模板拉取完成'));
}
