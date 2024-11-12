// index.tsx
import { Link } from 'expo-router';
import { View, StyleSheet, Dimensions, Pressable } from 'react-native';
import { Text, Surface, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

export default function Registration() {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <Animated.View 
        entering={FadeInDown.delay(200)} 
        style={styles.header}
      >
        <Text variant="displaySmall" style={styles.title}>Welcome to DriveSafe</Text>
        <Text variant="bodyLarge" style={styles.subtitle}>Your journey starts here</Text>
      </Animated.View>

      {/* Cards Section */}
      <Animated.View 
        entering={FadeInUp.delay(400)}
        style={styles.cardsContainer}
      >
        <Link href="/auth/sign-in" asChild>
          <Pressable>
            <Surface style={styles.card} elevation={2}>
              <MaterialCommunityIcons 
                name="login" 
                size={32} 
                color={theme.colors.primary} 
              />
              <View style={styles.cardContent}>
                <Text variant="titleMedium">Sign In</Text>
                <Text variant="bodyMedium" style={styles.cardDescription}>
                  Already have an account? Sign in here
                </Text>
              </View>
              <MaterialCommunityIcons 
                name="chevron-right" 
                size={24} 
                color={theme.colors.primary} 
              />
            </Surface>
          </Pressable>
        </Link>

        <Link href="/auth/sign-up" asChild>
          <Pressable>
            <Surface style={styles.card} elevation={2}>
              <MaterialCommunityIcons 
                name="account-plus" 
                size={32} 
                color={theme.colors.primary} 
              />
              <View style={styles.cardContent}>
                <Text variant="titleMedium">Sign Up</Text>
                <Text variant="bodyMedium" style={styles.cardDescription}>
                  New to Reant? Create an account
                </Text>
              </View>
              <MaterialCommunityIcons 
                name="chevron-right" 
                size={24} 
                color={theme.colors.primary} 
              />
            </Surface>
          </Pressable>
        </Link>
      </Animated.View>

      {/* Footer Section */}
      <Animated.View 
        entering={FadeInUp.delay(600)}
        style={styles.footer}
      >
        <Text variant="bodySmall" style={styles.footerText}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
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
  cardsContainer: {
    gap: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  cardContent: {
    flex: 1,
    marginLeft: 16,
  },
  cardDescription: {
    color: '#666',
    marginTop: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 32,
    left: 16,
    right: 16,
    alignItems: 'center',
  },
  footerText: {
    textAlign: 'center',
    color: '#666',
  },
});