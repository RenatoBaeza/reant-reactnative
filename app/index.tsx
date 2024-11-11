// index.tsx
import { SignedIn, SignedOut } from '@clerk/clerk-expo'
import { View } from 'react-native'
import Home from './home/Home'
import Registration from './auth/Registration'

export default function Page() {
  return (
    <View>
      <SignedIn>
        <Home/>
      </SignedIn>
      <SignedOut>
        <Registration/>
      </SignedOut>
    </View>
  )
}