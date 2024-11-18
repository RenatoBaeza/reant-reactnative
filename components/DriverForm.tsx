import { StyleSheet, Platform } from 'react-native';
import { Surface, TextInput, Button, Snackbar } from 'react-native-paper';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useState } from 'react';
import { DatePickerInput } from './DatePickerInput';
import { TimePickerInput } from './TimePickerInput';
import { VehicleSelector } from './VehicleSelector';
import { RouteInfo } from './RouteInfo';
import { ConfirmationModal } from './ConfirmationModal';
import { format } from 'date-fns';
import { useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';

const API_URL = Platform.select({
  android: 'http://10.0.2.2:8000/rides/create-ride',
  ios: 'http://localhost:8000/rides/create-ride',
  default: 'http://localhost:8000/rides/create-ride',
});

interface DriverFormData {
  origin: string;
  destination: string;
  date: Date;
  time: string;
  vehicleId: string;
  seats: string;
  distance?: string;
  duration?: string;
}

interface DriverFormProps {
  form: DriverFormData;
  onFormChange: (form: DriverFormData) => void;
}

export function DriverForm({ form, onFormChange }: DriverFormProps) {
  const { user } = useUser();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const router = useRouter();

  const handleFieldChange = (field: string, value: any) => {
    onFormChange({
      ...form,
      [field]: value
    });
  };

  const handleSubmit = () => {
    setShowConfirmation(true);
  };

  const handleConfirm = async () => {
    try {
      const userEmail = user?.emailAddresses[0].emailAddress;
      if (!userEmail) {
        throw new Error('User email not found');
      }

      const rideData = {
        available_seats: parseInt(form.seats) || 1,
        vehicle_id: form.vehicleId,
        origin: form.origin,
        destination: form.destination,
        ride_start_datetime: `${format(form.date, 'yyyy-MM-dd')}T${form.time}:00`,
      };

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'user-email': userEmail,
        },
        body: JSON.stringify(rideData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to create ride: ${errorData}`);
      }

      const data = await response.json();
      console.log('Ride created - full response:', JSON.stringify(data, null, 2));
      
      // Close the modal
      setShowConfirmation(false);
      
      // Reset form only after successful submission
      if (data.status === 'ok') {
        onFormChange({
          origin: '',
          destination: '',
          date: new Date(),
          time: '',
          vehicleId: '',
          seats: '',
          distance: '',
          duration: '',
        });
        
        // Add a small delay before navigation
        setTimeout(() => {
          router.push(`/rides/rides-awaiting?id=${data.data.ride_id}`);
        }, 500);
      }
    } catch (error) {
      console.error('Error creating ride:', error);
      setError(error.message);
      setSnackbarVisible(true);
    }
  };

  return (
    <>
      <Animated.View 
        entering={FadeInUp.delay(200)}
        style={styles.formContainer}
      >
        <Surface style={styles.form}>
          <TextInput
            mode="outlined"
            label="Origin"
            value={form.origin}
            onChangeText={(text) => {
              handleFieldChange('origin', text);
            }}
            style={styles.input}
          />
          <TextInput
            mode="outlined"
            label="Destination"
            value={form.destination}
            onChangeText={(text) => {
              handleFieldChange('destination', text);
            }}
            style={styles.input}
          />
          
          <DatePickerInput
            label="Date"
            value={form.date}
            onChange={(date) => handleFieldChange('date', date)}
            style={styles.input}
          />
          <TimePickerInput
            label="Time"
            value={form.time}
            onChange={(time) => handleFieldChange('time', time)}
            style={styles.input}
          />
          <VehicleSelector
            selectedVehicle={form.vehicleId}
            onVehicleSelect={(vehicleId) => handleFieldChange('vehicleId', vehicleId)}
            style={styles.input}
          />
          <TextInput
            mode="outlined"
            label="Available Seats"
            value={form.seats}
            onChangeText={(text) => {
              // Only allow numbers 1-9
              const numericValue = text.replace(/[^1-9]/g, '');
              if (numericValue.length <= 1) {
                handleFieldChange('seats', numericValue);
              }
            }}
            keyboardType="numeric"
            style={styles.input}
            placeholder="Enter number of seats (1-9)"
          />
          <Button 
            mode="contained" 
            onPress={handleSubmit}
            style={styles.submitButton}
          >
            Submit
          </Button>
        </Surface>
      </Animated.View>

      <ConfirmationModal
        visible={showConfirmation}
        onDismiss={() => setShowConfirmation(false)}
        onConfirm={handleConfirm}
        form={form}
      />

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={styles.snackbar}
      >
        {error || 'Ride created successfully!'}
      </Snackbar>
    </>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    padding: 16,
    zIndex: 1,
  },
  form: {
    padding: 16,
    borderRadius: 12,
    zIndex: 1,
  },
  input: {
    marginBottom: 16,
  },
  submitButton: {
    marginTop: 8,
  },
  snackbar: {
    position: 'absolute',
    bottom: 0,
  },
});