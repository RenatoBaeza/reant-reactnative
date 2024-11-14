import { View, StyleSheet, Platform } from 'react-native';
import { Text, TextInput, Button, Snackbar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useUser } from '@clerk/clerk-expo';
import { validateForm } from '../../../functions/formValidation';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const API_URL = Platform.select({
  android: 'http://10.0.2.2:8000', // Android Emulator
  ios: 'http://localhost:8000',    // iOS Simulator
  default: 'http://localhost:8000', // Web/default
});

export default function VehicleAdd() {
  const router = useRouter();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vehicle, setVehicle] = useState({
    make: '',
    model: '',
    year: '',
    color: '',
    licensePlate: '',
  });

  const handleSubmit = async () => {
    const validationRules = {
      make: { required: true },
      model: { required: true },
      year: { required: true, isNumeric: true },
      color: { required: true },
      licensePlate: { required: true }
    };

    const validationError = validateForm(vehicle, validationRules);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      console.log('Sending request to:', API_URL);
      const userEmail = user?.emailAddresses[0].emailAddress || '';
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'user-email': userEmail,
        },
        body: JSON.stringify({
          user_email: userEmail,
          car_brand: vehicle.make,
          car_model: vehicle.model,
          car_year: parseInt(vehicle.year),
          car_color: vehicle.color,
          car_license_plate: vehicle.licensePlate,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Server response:', errorData);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      router.back();
    } catch (error) {
      console.error('Error saving vehicle:', error);
      setError('Failed to save vehicle. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

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

      <Text variant="headlineMedium" style={styles.title}>Add Vehicle</Text>
      
      <View style={styles.form}>
        <TextInput
          mode="outlined"
          label="Make"
          value={vehicle.make}
          onChangeText={(text) => setVehicle({ ...vehicle, make: text })}
          style={styles.input}
          disabled={loading}
        />
        
        <TextInput
          mode="outlined"
          label="Model"
          value={vehicle.model}
          onChangeText={(text) => setVehicle({ ...vehicle, model: text })}
          style={styles.input}
          disabled={loading}
        />
        
        <TextInput
          mode="outlined"
          label="Year"
          value={vehicle.year}
          onChangeText={(text) => setVehicle({ ...vehicle, year: text })}
          keyboardType="numeric"
          style={styles.input}
          disabled={loading}
        />
        
        <TextInput
          mode="outlined"
          label="Color"
          value={vehicle.color}
          onChangeText={(text) => setVehicle({ ...vehicle, color: text })}
          style={styles.input}
          disabled={loading}
        />
        
        <TextInput
          mode="outlined"
          label="License Plate"
          value={vehicle.licensePlate}
          onChangeText={(text) => setVehicle({ ...vehicle, licensePlate: text })}
          style={styles.input}
          disabled={loading}
        />

        <Button 
          mode="contained" 
          onPress={handleSubmit}
          style={styles.button}
        >
          Save Vehicle
        </Button>
      </View>
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
    marginBottom: 8,
  },
  title: {
    marginBottom: 24,
  },
  form: {
    gap: 16,
  },
  input: {
    backgroundColor: '#fff',
  },
  button: {
    marginTop: 8,
  },
});