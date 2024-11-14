import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';

const vehicles = [
  { id: '1', make: 'Toyota', model: 'Corolla', year: '2020', color: 'Blue', licensePlate: 'ABC123' },
  { id: '2', make: 'Honda', model: 'Civic', year: '2019', color: 'Red', licensePlate: 'XYZ789' },
  // Add more vehicle objects as needed
];

export default function VehicleList() {
  const router = useRouter();

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.item}>
      <Text variant="bodyLarge">{item.make} {item.model}</Text>
      <Text variant="bodyMedium">Year: {item.year}</Text>
      <Text variant="bodyMedium">Color: {item.color}</Text>
      <Text variant="bodyMedium">License Plate: {item.licensePlate}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Button 
        mode="text" 
        onPress={() => router.back()}
        style={styles.backButton}
      >
        Back
      </Button>
      <Text variant="headlineMedium" style={styles.title}>Vehicle List</Text>
      <FlatList
        data={vehicles}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
      <Button 
        mode="contained" 
        onPress={() => router.push('/profile/vehicle-add')}
        style={styles.button}
      >
        Add Vehicle
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  title: {
    marginBottom: 24,
  },
  item: {
    padding: 16,
    marginVertical: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  button: {
    marginTop: 16,
  },
});