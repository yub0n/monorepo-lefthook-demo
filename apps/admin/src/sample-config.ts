export const APP_CONFIG = {
  API_ENDPOINT: 'https://api.example.com',
  TIMEOUT: 5000,
  RETRIES: 3,
} as const;

export const getTimeout = (): number => {
  return APP_CONFIG.TIMEOUT;
};
