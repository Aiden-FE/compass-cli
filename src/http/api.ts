import Telegram, { HttpTelegramResInterceptor, HttpTelegramErrorInterceptor } from '@compass-aiden/telegram';

const defaultResInterceptor: HttpTelegramResInterceptor = (data, res) => {
  if (res.status >= 200 && res.status < 300) {
    return data;
  }
  throw new Error('请求异常');
};

const defaultErrorInterceptor: HttpTelegramErrorInterceptor = (error) => {
  throw new Error(`[${error.response?.status || 'Api Error'}]: ${error.message || error}`);
};

const Api = new Telegram()
  .register('github', {
    baseURL: 'https://api.github.com',
    interceptors: {
      response: defaultResInterceptor,
      responseError: defaultErrorInterceptor,
    },
  })
  .register('npm', {
    baseURL: 'https://registry.npmjs.org',
    interceptors: {
      response: defaultResInterceptor,
      responseError: defaultErrorInterceptor,
    },
  });

export default Api;
