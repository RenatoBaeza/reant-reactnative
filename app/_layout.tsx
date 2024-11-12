import 'react-native-get-random-values';
import { Slot, useRouter, useSegments } from 'expo-router';
import { ClerkProvider, ClerkLoaded, ClerkLoading, useAuth } from '@clerk/clerk-expo';
import { Provider as PaperProvider } from 'react-native-paper';
import { tokenCache } from '../functions/tokenCache';
import * as Linking from 'expo-linking';
import { View, ActivityIndicator } from 'react-native';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

function RootLayoutNav() {
  const { isSignedIn, isLoaded } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    const inAuthGroup = segments[0] === 'auth';

    if (isSignedIn && inAuthGroup) {
      router.replace('/home');
    } else if (!isSignedIn && !inAuthGroup) {
      router.replace('/auth/Registration');
    }
  }, [isSignedIn, isLoaded, segments]);

  return <Slot />;
}

export default function RootLayout() {
  const signInUrl = Linking.createURL('oauth-native-callback');

  return (
    <ClerkProvider 
      tokenCache={tokenCache} 
      publishableKey={publishableKey}
      signInUrl={signInUrl}
    >
      <ClerkLoading>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" />
        </View>
      </ClerkLoading>
      <ClerkLoaded>
        <SafeAreaProvider>
          <PaperProvider>
            <RootLayoutNav />
          </PaperProvider>
        </SafeAreaProvider>
      </ClerkLoaded>
    </ClerkProvider>
  );
}