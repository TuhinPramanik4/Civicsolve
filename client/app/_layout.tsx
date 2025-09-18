import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-gesture-handler';
import 'react-native-reanimated';
import { useColorScheme } from '../hooks/use-color-scheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
       <Stack screenOptions={{ headerShown: false }} >
        {/* Tabs navigator */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        {/* Screens outside tabs */}
        <Stack.Screen name="signin" options={{ headerShown: false }} />
        <Stack.Screen name="dashboard" options={{  }} />
        <Stack.Screen name="add-report" options={{ title: 'Add Report' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
