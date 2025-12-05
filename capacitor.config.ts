import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.habitoid.app',
  appName: 'Habitoid',
  webDir: 'dist/public',
  server: {
    androidScheme: 'http',
    cleartext: true
  }
};

export default config;
