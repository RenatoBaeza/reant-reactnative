import * as WebBrowser from 'expo-web-browser'
import { useOAuth } from '@clerk/clerk-expo'
import { StyleSheet, Platform } from 'react-native'
import { Button, Surface } from 'react-native-paper'
import { useCallback } from 'react'
import { MaterialCommunityIcons } from '@expo/vector-icons'

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
    <Surface style={styles.surface} elevation={2}>
      <Button 
        mode="outlined"
        onPress={onPress}
        style={styles.button}
        contentStyle={styles.buttonContent}
        icon={() => <MaterialCommunityIcons name="google" size={24} />}
      >
        Sign in with Google
      </Button>
    </Surface>
  )
}

const styles = StyleSheet.create({
  surface: {
    borderRadius: 8,
    overflow: 'hidden',
    width: '100%',
  },
  button: {
    borderRadius: 8,
    minHeight: 48,
  },
  buttonContent: {
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
})