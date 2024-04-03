import { join } from 'path';
import chalk from 'chalk';
import Logger from '../logger';
import downloadRepoFromGithub from '../download-repo-from-github';
import deleteFoldersSync from '../delete-folder-sync';
import batchCompileTemplates from '../batch-compile-templates';
import getFilePathsInFolder from '../get-file-paths-in-folder';

interface CustomTempProps {
  author: string;
  repoName: string;
  projectPath?: string;
  token?: string;
  branch?: string;
  ignoreFilesStr?: string;
  templateData?: Record<string, string | number | boolean>;
}

export default async function pullCustomTemplate(options: CustomTempProps) {
  const { projectPath, templateData, author, repoName, branch, token, ignoreFilesStr } = {
    templateData: {},
    projectPath: './new-project',
    ...options,
  };
  const ignoreFiles = ignoreFilesStr ? ignoreFilesStr.split(',') : [];
  const loading = Logger.createLoading();
  loading.start(chalk.cyan('开始拉取目标模板'));
  const tempFolderPath = join(projectPath, 'temp');
  await downloadRepoFromGithub(
    {
      author,
      repository: repoName,
      branch: branch || undefined,
    },
    tempFolderPath,
    token || undefined,
  );
  const tempFiles = getFilePathsInFolder(tempFolderPath);
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
