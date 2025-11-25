import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.habitflow.app',
  appName: 'HabitFlow',
  webDir: 'dist/public',
  server: {
    androidScheme: 'http',
    cleartext: true
  }
};

export default config;
