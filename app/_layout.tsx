import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { Text } from 'react-native';
import { AuthProvider } from '../contexts/AuthContext';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'PlayfairDisplay_400Regular': require('../assets/fonts/PlayfairDisplay_400Regular.ttf'),
    'PlayfairDisplay_700Bold': require('../assets/fonts/PlayfairDisplay_700Bold.ttf'),
    'Inter_400Regular': require('../assets/fonts/Inter_400Regular.ttf'),
    'Inter_500Medium': require('../assets/fonts/Inter_500Medium.ttf'),
    'Inter_600SemiBold': require('../assets/fonts/Inter_600SemiBold.ttf'),
  });

  if (!fontsLoaded) {
    return <Text>Loading...</Text>;
  }

  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
      >
        <Stack.Screen name="login" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="session" />
        <Stack.Screen name="journal" />
      </Stack>
    </AuthProvider>
  );
}
