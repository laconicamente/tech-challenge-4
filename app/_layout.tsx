import { TransactionManagerProvider } from '@/modules/Transactions';
import { AuthProvider } from '@/modules/Users';
import { PaperDarkTheme, PaperLightTheme } from '@/shared/classes/constants/Colors';
import { useColorScheme } from '@/shared/hooks/useColorScheme';
import '@/shared/i18n/datePickerLocale';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { PaperProvider } from 'react-native-paper';
import 'react-native-reanimated';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const startTimeRef = useRef<number>(performance.now());
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (loaded) {
      setReady(true);
    }
  }, [loaded]);

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync().then(() => {
        const loadTime = performance.now() - startTimeRef.current;
        console.log(`[Performance] Tempo de carregamento da aplicação: ${loadTime.toFixed(2)}ms (${(loadTime / 1000).toFixed(2)}s)`);
      }).catch(() => { });
    }
  }, [ready]);

  if (!ready) return null;

  return (
    <AuthProvider>
      <TransactionManagerProvider useReactive={true}>
        <PaperProvider theme={colorScheme === 'dark' ? PaperDarkTheme : PaperLightTheme}>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)/account-access" options={{ headerShown: false }} />
            <Stack.Screen name="(protected)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
        </PaperProvider>
      </TransactionManagerProvider>
    </AuthProvider>
  );
}
