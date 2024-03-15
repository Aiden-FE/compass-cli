import Api from './api';

// eslint-disable-next-line import/prefer-default-export
export function getRepoReleasesFromNpm() {
  return Api.chain().domain('npm').get('/@compass-aiden/commander').request();
}
