import { useSignIn } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import { View, Platform } from 'react-native';
import { Text, TextInput, Button, Surface, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import Animated from 'react-native-reanimated';
import { GoogleSignInButton } from '../../components/GoogleSignInButton';
import { StyleSheet } from 'react-native';

export default function Page() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();
  const theme = useTheme();

  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const onSignInPress = React.useCallback(async () => {
    if (!isLoaded) return;
    
    setLoading(true);
    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace('/');
      } else {
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
    } finally {
      setLoading(false);
    }
  }, [isLoaded, emailAddress, password]);

  const Container = Platform.select({
    web: View,
    default: Animated.View,
  });

  return (
    <Container style={styles.container}>
      {/* Header */}
      <Container style={styles.header}>
        <Text variant="displaySmall" style={styles.title}>Welcome Back</Text>
        <Text variant="bodyLarge" style={styles.subtitle}>Sign in to continue</Text>
      </Container>

      {/* Form */}
      <Container style={styles.formContainer}>
        <Surface style={styles.form} elevation={2}>
          <TextInput
            mode="outlined"
            label="Email"
            value={emailAddress}
            onChangeText={setEmailAddress}
            autoCapitalize="none"
            keyboardType="email-address"
            left={<TextInput.Icon icon={() => 
              <MaterialCommunityIcons name="email" size={24} color={theme.colors.primary} />
            } />}
            style={styles.input}
          />

          <TextInput
            mode="outlined"
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!isPasswordVisible}
            left={<TextInput.Icon icon={() => 
              <MaterialCommunityIcons name="lock" size={24} color={theme.colors.primary} />
            } />}
            right={<TextInput.Icon icon={() => 
              <MaterialCommunityIcons 
                name={isPasswordVisible ? "eye-off" : "eye"} 
                size={24} 
                color={theme.colors.primary}
                onPress={() => setIsPasswordVisible(!isPasswordVisible)}
              />
            } />}
            style={styles.input}
          />

          <Button 
            mode="contained" 
            onPress={onSignInPress}
            loading={loading}
            style={[styles.signInButton, { minHeight: 48 }]}
            contentStyle={{ paddingVertical: 8 }}
          >
            Sign In
          </Button>
        </Surface>

        <Text variant="bodyMedium" style={styles.orText}>or continue with</Text>

        <GoogleSignInButton />
      </Container>

      {/* Footer */}
      <Container style={styles.footer}>
        <Text variant="bodyMedium" style={styles.footerText}>
          Don't have an account?{' '}
          <Link href="/auth/sign-up">
            <Text style={[styles.footerText, { color: theme.colors.primary }]}>
              Sign up
            </Text>
          </Link>
        </Text>
      </Container>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    ...(Platform.OS === 'web' ? {
      maxWidth: 480,
      marginHorizontal: 'auto',
    } : {}),
  },
  header: {
    marginTop: 60,
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#666',
  },
  formContainer: {
    width: '100%',
    alignItems: 'center',
  },
  form: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  input: {
    marginBottom: 16,
  },
  signInButton: {
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 8,
  },
  orText: {
    marginVertical: 16,
    color: '#666',
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
  },
  footerText: {
    textAlign: 'center',
  },
});