import { View, StyleSheet, SafeAreaView } from "react-native";
import { Text, Button } from "react-native-paper";
import { AwaitingRidesList } from "../../../components/AwaitingRidesList";
import { useRouter, usePathname } from "expo-router";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect } from 'react';

export default function Rides() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === '/rides') {
      // Force AwaitingRidesList to re-render and fetch new data
      console.log('Rides screen mounted - fetching latest rides');
    }
  }, [pathname]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.title}>
            Your Rides
          </Text>
          <Button 
            mode="contained"
            onPress={() => router.push('/rides/rides-create')}
            style={styles.createButton}
            icon={() => (
              <MaterialCommunityIcons name="plus" size={20} color="white" />
            )}
          >
            Create Ride
          </Button>
        </View>
        <View style={styles.listContainer}>
          <AwaitingRidesList key={pathname} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    flex: 1,
  },
  createButton: {
    marginLeft: 16,
  },
  listContainer: {
    flex: 1,
  }
});
