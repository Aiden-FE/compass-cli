import Api from './api';

export * from './github';
export * from './npm';

export function getFile(url: string, headers?: Record<string, string>) {
  return Api.chain()
    .get(url)
    .headers({ ...headers })
    .request();
}
