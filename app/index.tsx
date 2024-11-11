// index.tsx
import { SignedIn, SignedOut, useUser, useAuth } from '@clerk/clerk-expo'
import { Link } from 'expo-router'
import { Text, View, Button } from 'react-native'

export default function Page() {
  const { user } = useUser()
  const { signOut } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <View>
      <SignedIn>
        <Text>Hello {user?.emailAddresses[0].emailAddress}</Text>
        <Button title="Sign Out" onPress={handleSignOut} />
      </SignedIn>
      <SignedOut>
        <Link href="/auth/sign-in">
          <Text>Sign In</Text>
        </Link>
        <Link href="/auth/sign-up">
          <Text>Sign Up</Text>
        </Link>
      </SignedOut>
    </View>
  )
}