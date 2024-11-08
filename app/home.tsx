import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useLocalSearchParams } from 'expo-router';

export default function Home() {
  const { email } = useLocalSearchParams<{ email: string }>();

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome! Your email is: {email}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
  },
  text: {
    fontSize: 18,
    color: Colors.light.text,
  },
});