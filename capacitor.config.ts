import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ligadobem.app',
  appName: 'Liga do Bem',
  webDir: 'build',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https'
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#2563eb',
      androidSplashResourceName: 'splash',
      showSpinner: false
    },
    Keyboard: {
      resize: 'body',
      style: 'dark'
    },
    StatusBar: {
      style: 'light',
      backgroundColor: '#2563eb'
    }
  }
};

export default config;
