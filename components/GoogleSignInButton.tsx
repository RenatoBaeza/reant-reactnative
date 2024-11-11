import * as WebBrowser from 'expo-web-browser'
import { useOAuth } from '@clerk/clerk-expo'
import { StyleSheet, Platform } from 'react-native'
import { Button, Surface } from 'react-native-paper'
import { useState, useCallback } from 'react'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import * as Linking from 'expo-linking'
import { useRouter } from 'expo-router'

WebBrowser.maybeCompleteAuthSession()

export function GoogleSignInButton() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  
  const { startOAuthFlow } = useOAuth({ 
    strategy: 'oauth_google',
    redirectUrl: Linking.createURL('oauth-native-callback')
  })

  const onPress = useCallback(async () => {
    try {
      setIsLoading(true)
      const { createdSessionId, setActive } = await startOAuthFlow()
      
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId })
        // Small delay to ensure session is active before redirect
        setTimeout(() => {
          router.replace('/')
        }, 100)
      }
    } catch (err) {
      console.error('OAuth error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [router])

  return (
    <Surface style={styles.surface} elevation={2}>
      <Button 
        mode="outlined"
        onPress={onPress}
        style={styles.button}
        contentStyle={styles.buttonContent}
        icon={() => <MaterialCommunityIcons name="google" size={24} />}
        loading={isLoading}
        disabled={isLoading}
      >
        {isLoading ? 'Signing in...' : 'Sign in with Google'}
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