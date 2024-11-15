import { useState, useEffect } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { Text, RadioButton, Surface, ActivityIndicator } from 'react-native-paper';
import { useUser } from '@clerk/clerk-expo';

interface Vehicle {
  id: string;
  car_brand: string;
  car_model: string;
  car_year: string;
  car_color: string;
  car_license_plate: string;
}

interface VehicleSelectProps {
  selectedVehicle: string;
  onVehicleSelect: (vehicleId: string) => void;
  style?: any;
}

const API_URL = Platform.select({
  android: 'http://10.0.2.2:8000/vehicles/user-vehicles',
  ios: 'http://localhost:8000/vehicles/user-vehicles',
  default: 'http://localhost:8000/vehicles/user-vehicles',
});

export function VehicleSelector({ selectedVehicle, onVehicleSelect, style }: VehicleSelectProps) {
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
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'user-email': userEmail,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch vehicles');
      }

      const data = await response.json();
      setVehicles(data.data || []);
      
      // Select first vehicle by default if none selected
      if (!selectedVehicle && data.data && data.data.length > 0) {
        onVehicleSelect(data.data[0].id);
      }
    } catch (err) {
      setError('Failed to load vehicles');
      console.error('Error fetching vehicles:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, style]}>
        <ActivityIndicator size="small" />
      </View>
    );
  }

  if (error || vehicles.length === 0) {
    return (
      <View style={[styles.container, style]}>
        <Text variant="bodyMedium" style={styles.errorText}>
          {error || 'No vehicles available. Please add a vehicle in your profile.'}
        </Text>
      </View>
    );
  }

  return (
    <Surface style={[styles.container, style]} elevation={0}>
      <Text variant="labelMedium" style={styles.label}>Select Vehicle</Text>
      <RadioButton.Group onValueChange={onVehicleSelect} value={selectedVehicle}>
        {vehicles.map((vehicle) => (
          <View key={vehicle.id} style={styles.radioItem}>
            <RadioButton.Android value={vehicle.id} />
            <Text variant="bodyMedium" style={styles.vehicleText}>
              {vehicle.car_year} {vehicle.car_brand} {vehicle.car_model} - {vehicle.car_color}
            </Text>
          </View>
        ))}
      </RadioButton.Group>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  label: {
    marginBottom: 8,
    color: '#666',
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  vehicleText: {
    flex: 1,
    marginLeft: 8,
  },
  errorText: {
    color: '#666',
    textAlign: 'center',
  },
});