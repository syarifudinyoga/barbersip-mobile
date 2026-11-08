import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getDevApiHost = () => {
  // If hostUri is available from Expo packager (e.g. 192.168.1.x:8081)
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    return `http://${ip}:4000`;
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:4000';
  }

  return 'http://localhost:4000';
};

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || getDevApiHost();

export const WS_BASE_URL =
  process.env.EXPO_PUBLIC_WS_URL || API_BASE_URL;

