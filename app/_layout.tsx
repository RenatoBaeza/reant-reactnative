import { ClerkProvider, ClerkLoaded } from '@clerk/clerk-expo'
import { Slot } from 'expo-router'
import { Provider as PaperProvider } from 'react-native-paper'
import { tokenCache } from '../functions/tokenCache'

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!

export default function RootLayout() {
  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <ClerkLoaded>
        <PaperProvider>
          <Slot />
        </PaperProvider>
      </ClerkLoaded>
    </ClerkProvider>
  )
}