import chalk from 'chalk';
import { join } from 'path';
import Logger from './logger';
import downloadRepoFromGithub from './download-repo-from-github';
import getFilePathsInFolder from './get-file-paths-in-folder';
import batchCompileTemplates from './batch-compile-templates';
import deleteFoldersSync from './delete-folder-sync';

interface UtilsTempProps {
  projectPath?: string;
  templateData?: Record<string, string | number | boolean>;
}

export default async function pullUtilsTemplate(options?: UtilsTempProps) {
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
      branch: 'temp/utils',
    },
    tempFolderPath,
  );
  const tempFiles = getFilePathsInFolder(tempFolderPath);
  const ignoreFiles: string[] = [];
  if (!templateData.enabledJest) {
    ignoreFiles.push('tsconfig.test.json', 'jest.config.cjs');
  }
  if (!templateData.enabledCommitlint) {
    ignoreFiles.push('commitlint.config.js');
  }
  if (!templateData.enabledPrettier) {
    ignoreFiles.push('.prettierrc.json', '.prettierignore');
  }
  if (!templateData.enabledEslint) {
    ignoreFiles.push('.eslintrc.cjs.handlebars');
  }
  if (!templateData.enabledGithubActions) {
    ignoreFiles.push(
      '.github/workflows/lint-and-test.yml.handlebars',
      '.github/workflows/publish-and-deploy.yml.handlebars',
    );
  }
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
