import Api from './api';
import { RepositoryInfo, GithubReleaseInfo, ContentOfGithubRepo } from './interfaces';

/**
 * @description 获取存储库已发布版本列表
 * @param repoInfo
 * @param token
 */
export function getRepoReleasesFromGithub(repoInfo: Pick<RepositoryInfo, 'author' | 'repository'>, token?: string) {
  return Api.chain()
    .domain('github')
    .headers({
      accept: 'application/vnd.github.v3+json',
      Authorization: token ? `Bearer ${token}` : undefined,
    })
    .get('repos/:author/:repository/releases')
    .paths({
      author: repoInfo.author,
      repository: repoInfo.repository,
    })
    .request<GithubReleaseInfo[]>();
}

/**
 * @description 获取存储库
 * @param repoInfo
 * @param token
 */
export function getRepoFromGithub(repoInfo: RepositoryInfo, token?: string) {
  return Api.chain()
    .domain('github')
    .get('/repos/:author/:repository/zipball/:branch')
    .paths({
      author: repoInfo.author,
      repository: repoInfo.repository,
      branch: repoInfo.branch || '',
    })
    .headers({
      accept: 'application/vnd.github+json',
      Authorization: token ? `Bearer ${token}` : undefined,
    })
    .responseType('arraybuffer')
    .config({ timeout: 1000 * 60 })
    .request();
}

/**
 * @description 获取仓库内容
 * @param repoInfo
 */
export function getRepoContentsFromGithub(repoInfo: RepositoryInfo, token?: string) {
  return Api.chain()
    .domain('github')
    .get('/repos/:author/:repository/contents/:repoPath')
    .paths({
      author: repoInfo.author,
      repository: repoInfo.repository,
      repoPath: repoInfo.repoPath || '',
    })
    .searchParams({
      ref: repoInfo.branch,
    })
    .headers({
      accept: 'application/vnd.github+json',
      Authorization: token ? `Bearer ${token}` : undefined,
    })
    .request<ContentOfGithubRepo[] | ContentOfGithubRepo>();
}
