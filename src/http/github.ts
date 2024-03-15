import Api from './api';
import { RepositoryInfo, GithubReleaseInfo } from './interfaces';

/**
 * @description 获取存储库已发布版本列表
 * @param repoInfo
 * @param token
 */
// eslint-disable-next-line import/prefer-default-export
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
