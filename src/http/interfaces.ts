/** Github 版本数据项 */
export interface GithubReleaseInfo {
  id: string;
  /** 发布名称 */
  name: string;
  /** 标签名 */
  tag_name: string;
  /** 发布描述 */
  body: string;
  /** 是否草稿版 */
  draft: boolean;
  /** 是否预发布 */
  prerelease: boolean;
  created_at: string;
  published_at: string;
}

export interface RepositoryInfo {
  /** 作者 */
  author: string;
  /** 仓库名 */
  repository: string;
  /** 分支,默认主分支 */
  branch?: string;
  /** 仓库子路径 */
  repoPath?: string;
}
