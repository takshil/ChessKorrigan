export const back4appConfig = {
  appId: import.meta.env.VITE_BACK4APP_APP_ID,
  javascriptKey: import.meta.env.VITE_BACK4APP_JAVASCRIPT_KEY,
  serverURL: import.meta.env.VITE_BACK4APP_SERVER_URL,
  mode: import.meta.env.MODE,
  isProduction: import.meta.env.MODE === 'production',
  isTest: import.meta.env.MODE === 'test'
}
