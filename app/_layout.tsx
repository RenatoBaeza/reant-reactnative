import { ClerkProvider, ClerkLoaded, ClerkLoading } from '@clerk/clerk-expo'
import { Slot } from 'expo-router'
import { Provider as PaperProvider } from 'react-native-paper'
import { tokenCache } from '../functions/tokenCache'
import * as Linking from 'expo-linking'
import { View, ActivityIndicator } from 'react-native'

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!

export default function RootLayout() {
  const signInUrl = Linking.createURL('oauth-native-callback')

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
        <PaperProvider>
          <Slot />
        </PaperProvider>
      </ClerkLoaded>
    </ClerkProvider>
  )
}