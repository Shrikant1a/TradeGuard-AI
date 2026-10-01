// API base URL configuration
// Development (Android Emulator): http://10.0.2.2:8000
// Development (Expo Go / Physical Device): http://YOUR_LOCAL_IP:8000
// Production: https://your-tradeguardd-api.com

import Constants from 'expo-constants';

const ENV = {
  development: {
    API_BASE_URL: 'http://10.0.2.2:8000',
    API_TIMEOUT: 30000,
  },
  production: {
    API_BASE_URL: 'https://tradeguardd-api.onrender.com',
    API_TIMEOUT: 30000,
  },
};

const getEnvConfig = () => {
  // Check if running in Expo Go (dev) or production build
  const releaseChannel = Constants.expoConfig?.extra?.releaseChannel;
  if (releaseChannel === 'production') {
    return ENV.production;
  }
  return ENV.development;
};

export const Config = getEnvConfig();
export const API_BASE_URL = Config.API_BASE_URL;
export const API_TIMEOUT = Config.API_TIMEOUT;
