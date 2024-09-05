import Api from './api';

// eslint-disable-next-line import/prefer-default-export
export function getRepoInfoFromNpm(repoName: string) {
  return Api.chain()
    .domain('npm')
    .config({ timeout: 1000 * 30 })
    .get('/:repoName')
    .path('repoName', repoName)
    .request();
}
