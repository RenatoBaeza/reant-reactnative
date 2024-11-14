import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Platform } from 'react-native';
import { Text, Button, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const API_URL = Platform.select({
  android: 'http://10.0.2.2:8000/user-vehicles',
  ios: 'http://localhost:8000/user-vehicles',
  default: 'http://localhost:8000/user-vehicles',
});

interface Vehicle {
  id: string;
  car_brand: string;
  car_model: string;
  car_year: string;
  car_color: string;
  car_license_plate: string;
}

export default function VehicleList() {
  const router = useRouter();
  const { user } = useUser();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const userEmail = user?.emailAddresses[0].emailAddress ?? '';
      console.log('Fetching vehicles from:', API_URL);
      console.log('User email:', userEmail);
      
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'user-email': userEmail,
        },
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error('Failed to fetch vehicles');
      }

      const data = await response.json();
      console.log('Vehicles data:', data);
      setVehicles(data.data || []);
    } catch (err) {
      console.error('Error fetching vehicles:', err);
      setError('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  const deleteVehicle = async (vehicleId: string) => {
    try {
      const userEmail = user?.emailAddresses[0].emailAddress ?? '';
      const deleteUrl = `${API_URL}/${vehicleId}`;
      console.log('Deleting vehicle at:', deleteUrl);
      console.log('User email:', userEmail);

      const response = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'user-email': userEmail,
        },
      });

      console.log('Delete response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to delete vehicle: ${errorText}`);
      }

      const data = await response.json();
      console.log('Delete response data:', data);
      
      // Refresh the vehicle list
      fetchVehicles();
    } catch (err) {
      console.error('Error deleting vehicle:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete vehicle');
    }
  };

  const renderItem = ({ item }: { item: Vehicle }) => (
    <View style={styles.item}>
      <View style={styles.itemContent}>
        <Text variant="bodyLarge">{item.car_brand} {item.car_model}</Text>
        <Text variant="bodyMedium">Year: {item.car_year}</Text>
        <Text variant="bodyMedium">Color: {item.car_color}</Text>
        <Text variant="bodyMedium">License Plate: {item.car_license_plate}</Text>
      </View>
      <Button
        mode="text"
        onPress={() => deleteVehicle(item.id)}
        icon={() => (
          <MaterialCommunityIcons name="delete" size={20} color="#FF5252" />
        )}
        style={styles.deleteButton}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <Button 
        mode="text" 
        onPress={() => router.back()}
        style={styles.backButton}
        icon={() => (
          <MaterialCommunityIcons name="arrow-left" size={20} />
        )}
      >
        Back
      </Button>
      <Text variant="headlineMedium" style={styles.title}>Vehicle List</Text>
      
      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" />
        </View>
      ) : error ? (
        <View style={styles.centerContent}>
          <Text variant="bodyLarge" style={styles.errorText}>{error}</Text>
        </View>
      ) : vehicles.length === 0 ? (
        <View style={styles.centerContent}>
          <Text variant="bodyLarge">No vehicles found</Text>
          <Text variant="bodyMedium" style={styles.subtitle}>Add your first vehicle below</Text>
        </View>
      ) : (
        <FlatList
          data={vehicles}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
      
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemContent: {
    flex: 1,
  },
  deleteButton: {
    marginLeft: 8,
  },
  button: {
    marginTop: 16,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: 16,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
  subtitle: {
    color: '#666',
    marginTop: 8,
  },
  listContent: {
    flexGrow: 1,
  },
});