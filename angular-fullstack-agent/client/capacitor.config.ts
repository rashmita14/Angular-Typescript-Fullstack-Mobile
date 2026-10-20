import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.daymark',
  appName: 'Daymark',
  webDir: 'dist/client/browser',
  server: {
    androidScheme: 'https',
  },
};

export default config;
