import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';

export default function Profile() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/auth/Registration');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text variant="headlineMedium">Profile</Text>
        <Text variant="bodyLarge">{user?.firstName} {user?.lastName}</Text>
        <Text variant="bodyMedium">{user?.emailAddresses[0].emailAddress}</Text>
        
        <Button 
          mode="contained" 
          onPress={() => router.push('/profile/vehicle-list')}
          style={styles.button}
        >
          Vehicle List
        </Button>
      </View>

      <Button 
        mode="contained" 
        onPress={handleSignOut}
        style={styles.logoutButton}
      >
        Log Out
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  content: {
    gap: 8,
  },
  button: {
    marginTop: 16,
  },
  logoutButton: {
    marginTop: 24,
  },
});