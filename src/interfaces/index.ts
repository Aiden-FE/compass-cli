/** npm包管理器 */
export type PkgManager = 'npm' | 'yarn' | 'pnpm';

export type RepositoryInfo = {
  author: string;
  repository: string;
  branch?: string;
  repoPath?: string;
};
