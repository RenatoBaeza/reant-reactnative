import { View, StyleSheet, SafeAreaView } from "react-native";
import { Text } from "react-native-paper";

export default function Rides() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text variant="headlineMedium">My Rides</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  }
});
