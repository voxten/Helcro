/*
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

export const useGoogleAuth = () => {
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: 'YOUR_EXPO_CLIENT_ID', // Pobierz z Google Cloud Console
    iosClientId: 'YOUR_IOS_CLIENT_ID',   // Dla iOS (opcjonalnie)
    androidClientId: 'YOUR_ANDROID_CLIENT_ID', // Dla Android (opcjonalnie)
    scopes: ['profile', 'email'],
  });

  const handleGoogleLogin = async () => {
    const result = await promptAsync();
    if (result.type === 'success') {
      const { accessToken } = result.params;
      return accessToken; // Zwróć token dostępu
    }
    return null;
  };

  return { handleGoogleLogin };
};
*/