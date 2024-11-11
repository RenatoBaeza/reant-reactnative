import { useSignUp } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import { View, Platform, StyleSheet } from 'react-native';
import { Text, TextInput, Button, Surface, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { GoogleSignInButton } from '../../components/GoogleSignInButton';

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();
  const theme = useTheme();

  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState('');

  const onSignUpPress = async () => {
    if (!isLoaded) return;

    setLoading(true);
    try {
      await signUp.create({
        emailAddress,
        password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const onPressVerify = async () => {
    if (!isLoaded) return;

    setLoading(true);
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId });
        router.replace('/');
      } else {
        console.error(JSON.stringify(completeSignUp, null, 2));
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const Container = Platform.select({
    web: View,
    default: Animated.View,
  });

  return (
    <View style={styles.container}>
      {!pendingVerification ? (
        <>
          {/* Header */}
          <Container style={styles.header}>
            <Text variant="displaySmall" style={styles.title}>Create Account</Text>
            <Text variant="bodyLarge" style={styles.subtitle}>Sign up to get started</Text>
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
                onPress={onSignUpPress}
                loading={loading}
                style={styles.signUpButton}
              >
                Sign Up
              </Button>
            </Surface>

            <Text variant="bodyMedium" style={styles.orText}>or continue with</Text>

            <GoogleSignInButton />
          </Container>

          {/* Footer */}
          <Container style={styles.footer}>
            <Text variant="bodyMedium" style={styles.footerText}>
              Already have an account?{' '}
              <Link href="/auth/sign-in">
                <Text style={[styles.footerText, { color: theme.colors.primary }]}>
                  Sign in
                </Text>
              </Link>
            </Text>
          </Container>
        </>
      ) : (
        <>
          {/* Verification Form */}
          <Container style={styles.header}>
            <Text variant="displaySmall" style={styles.title}>Verify Email</Text>
            <Text variant="bodyLarge" style={styles.subtitle}>Enter the code sent to your email</Text>
          </Container>

          <Container style={styles.formContainer}>
            <Surface style={styles.form} elevation={2}>
              <TextInput
                mode="outlined"
                label="Verification Code"
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                left={<TextInput.Icon icon={() => 
                  <MaterialCommunityIcons name="shield-check" size={24} color={theme.colors.primary} />
                } />}
                style={styles.input}
              />

              <Button 
                mode="contained" 
                onPress={onPressVerify}
                loading={loading}
                style={styles.signUpButton}
              >
                Verify Email
              </Button>
            </Surface>
          </Container>
        </>
      )}
    </View>
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
  signUpButton: {
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