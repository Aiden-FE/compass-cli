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
    .config({
      headers: {
        accept: 'application/vnd.github.v3+json',
        Authorization: token ? `Bearer ${token}` : undefined,
      },
    })
    .get('repos/:author/:repository/releases')
    .path('author', repoInfo.author)
    .path('repository', repoInfo.repository)
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
    .get(`/repos/${repoInfo.author}/${repoInfo.repository}/zipball/${repoInfo.branch || ''}`)
    .path('author', repoInfo.author)
    .path('repository', repoInfo.repository)
    .path('branch', repoInfo.branch || '')
    .config({
      headers: {
        accept: 'application/vnd.github+json',
        Authorization: token ? `Bearer ${token}` : undefined,
      },
      responseType: 'arraybuffer',
      timeout: 1000 * 60,
    })
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
    .path('author', repoInfo.author)
    .path('repository', repoInfo.repository)
    .path('repoPath', repoInfo.repoPath || '')
    .searchParams({
      ref: repoInfo.branch,
    })
    .config({
      headers: {
        accept: 'application/vnd.github+json',
        Authorization: token ? `Bearer ${token}` : undefined,
      },
    })
    .request<ContentOfGithubRepo[] | ContentOfGithubRepo>();
}
