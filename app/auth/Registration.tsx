// index.tsx
import { Link } from 'expo-router'
import { Text, View } from 'react-native'

export default function Registration() {

  return (
    <View>
        <Link href="/auth/sign-in">
            <Text>Sign In</Text>
        </Link>
        <Link href="/auth/sign-up">
            <Text>Sign Up</Text>
        </Link>
    </View>
  )
}