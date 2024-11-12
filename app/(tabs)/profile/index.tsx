import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useUser } from '@clerk/clerk-expo';

export default function Profile() {
  const { user } = useUser();

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Profile</Text>
      <Text variant="bodyLarge">{user?.firstName} {user?.lastName}</Text>
      <Text variant="bodyMedium">{user?.emailAddresses[0].emailAddress}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 8,
  },
});