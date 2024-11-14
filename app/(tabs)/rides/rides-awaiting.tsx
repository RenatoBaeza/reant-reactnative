import { View, StyleSheet, Platform } from 'react-native';
import { Text, Surface, Button } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-expo';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';

const API_URL = Platform.select({
  android: 'http://10.0.2.2:8000/rides',
  ios: 'http://localhost:8000/rides',
  default: 'http://localhost:8000/rides',
});

interface RideDetails {
  ride_id: string;
  driver_email: string;
  vehicle_id: string;
  origin: string;
  destination: string;
  available_seats: number;
  ride_start_datetime: string;
  vehicle_details?: {
    car_brand: string;
    car_model: string;
    car_year: string;
    car_color: string;
    car_license_plate: string;
  };
}

interface RideResponse {
  status: string;
  data: RideDetails;
  is_driver: boolean;
}

export default function RidesAwaiting() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useUser();
  const [ride, setRide] = useState<RideDetails | null>(null);
  const [isDriver, setIsDriver] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRideDetails();
  }, [id]);

  const fetchRideDetails = async () => {
    try {
      const userEmail = user?.emailAddresses[0].emailAddress;
      if (!userEmail) {
        throw new Error('User email is required');
      }
  
      console.log('Fetching ride details for ID:', id);
      
      const response = await fetch(`${API_URL}/${id}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'user-email': userEmail,
        },
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`Failed to fetch ride details: ${errorText}`);
      }
  
      const responseData: RideResponse = await response.json();
      console.log('Ride details response:', JSON.stringify(responseData, null, 2));
      
      setRide(responseData.data);
      setIsDriver(responseData.is_driver);
    } catch (err) {
      console.error('Error fetching ride details:', err);
      setError(err instanceof Error ? err.message : 'Failed to load ride details');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRide = async () => {
    try {
      const userEmail = user?.emailAddresses[0].emailAddress;
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'user-email': userEmail ?? '',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to cancel ride');
      }

      router.replace('/rides');
    } catch (err) {
      console.error('Error canceling ride:', err);
      setError('Failed to cancel ride');
    }
  };

  if (loading || !ride) {
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
        <Text>Loading ride details...</Text>
      </View>
    );
  }

  const datetime = new Date(ride.ride_start_datetime);

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

      <Text variant="headlineMedium" style={styles.title}>
        {isDriver ? 'Your Ride' : 'Ride Details'}
      </Text>

      {error && (
        <Text variant="bodyMedium" style={styles.errorText}>
          {error}
        </Text>
      )}

      <Surface style={styles.card} elevation={2}>
        <View style={styles.section}>
          <Text variant="titleMedium">Route Details</Text>
          <Text variant="bodyMedium" style={styles.detail}>From: {ride.origin}</Text>
          <Text variant="bodyMedium" style={styles.detail}>To: {ride.destination}</Text>
        </View>

        <View style={styles.section}>
          <Text variant="titleMedium">Schedule</Text>
          <Text variant="bodyMedium" style={styles.detail}>
            Date: {format(datetime, 'MMMM d, yyyy')}
          </Text>
          <Text variant="bodyMedium" style={styles.detail}>
            Time: {format(datetime, 'h:mm a')}
          </Text>
        </View>

        {ride.vehicle_details && (
          <View style={styles.section}>
            <Text variant="titleMedium">Vehicle Details</Text>
            <Text variant="bodyMedium" style={styles.detail}>
              {ride.vehicle_details.car_year} {ride.vehicle_details.car_brand} {ride.vehicle_details.car_model}
            </Text>
            <Text variant="bodyMedium" style={styles.detail}>
              Color: {ride.vehicle_details.car_color}
            </Text>
            <Text variant="bodyMedium" style={styles.detail}>
              License Plate: {ride.vehicle_details.car_license_plate}
            </Text>
          </View>
        )}

        <View style={styles.section}>
          <Text variant="titleMedium">Capacity</Text>
          <Text variant="bodyMedium" style={styles.detail}>
            Available Seats: {ride.available_seats}
          </Text>
        </View>
      </Surface>

      {isDriver && (
        <Button 
          mode="contained" 
          onPress={handleCancelRide}
          style={styles.cancelButton}
          buttonColor="#FF5252"
        >
          Cancel Ride
        </Button>
      )}
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
  card: {
    padding: 16,
    borderRadius: 12,
  },
  section: {
    marginBottom: 24,
  },
  detail: {
    marginTop: 8,
    color: '#666',
  },
  cancelButton: {
    marginTop: 24,
  },
  errorText: {
    color: '#FF5252',
    marginBottom: 16,
  },
});