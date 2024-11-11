import * as WebBrowser from 'expo-web-browser'
import { useOAuth } from '@clerk/clerk-expo'
import { Button } from 'react-native'
import { useCallback } from 'react'

WebBrowser.maybeCompleteAuthSession()

export function GoogleSignInButton() {
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' })

  const onPress = useCallback(async () => {
    try {
      const { createdSessionId, setActive } = await startOAuthFlow()

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId })
      }
    } catch (err) {
      console.error('OAuth error:', err)
    }
  }, [])

  return (
    <Button title="Sign in with Google" onPress={onPress} />
  )
}