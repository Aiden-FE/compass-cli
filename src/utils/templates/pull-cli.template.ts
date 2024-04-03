import chalk from 'chalk';
import { join } from 'path';
import Logger from '../logger';
import downloadRepoFromGithub from '../download-repo-from-github';
import getFilePathsInFolder from '../get-file-paths-in-folder';
import batchCompileTemplates from '../batch-compile-templates';
import deleteFoldersSync from '../delete-folder-sync';

interface CliTempProps {
  projectPath?: string;
  templateData?: Record<string, string | number | boolean>;
}

export default async function pullCliTemplate(options?: CliTempProps) {
  const { projectPath, templateData } = {
    templateData: {},
    projectPath: './new-project',
    ...options,
  };
  const loading = Logger.createLoading();
  loading.start(chalk.cyan('开始拉取目标模板'));
  const tempFolderPath = join(projectPath, 'temp');
  await downloadRepoFromGithub(
    {
      author: 'Aiden-FE',
      repository: 'compass-template',
      branch: 'temp/cli',
    },
    tempFolderPath,
  );
  const tempFiles = getFilePathsInFolder(tempFolderPath);
  const ignoreFiles: string[] = [];
  await batchCompileTemplates(
    tempFiles
      .map((fp) => {
        return [fp, join(projectPath, fp.replace(tempFolderPath, '')).replace('.handlebars', '')] as [string, string];
      })
      .filter((item) => !ignoreFiles.some((f) => item[0].endsWith(f))),
    templateData,
  );
  deleteFoldersSync(tempFolderPath);
  loading.succeed(chalk.green('模板拉取完成'));
}
