import { View, StyleSheet, Platform, FlatList, Pressable } from 'react-native';
import { Text, Surface, Button } from 'react-native-paper';
import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useUser } from '@clerk/clerk-expo';

const API_URL = Platform.select({
  android: 'http://10.0.2.2:8000/rides/search-rides',
  ios: 'http://localhost:8000/rides/search-rides',
  default: 'http://localhost:8000/rides/search-rides',
});

interface RideDetails {
  ride_id: string;
  driver_email: string;
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

export default function RidesAvailable() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [rides, setRides] = useState<RideDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();

  useEffect(() => {
    fetchAvailableRides();
  }, []);

  const fetchAvailableRides = async () => {
    try {
      const searchParams = new URLSearchParams({
        origin: params.origin as string,
        destination: params.destination as string,
        date: params.date as string,
        seats: params.seats as string,
      });

      const response = await fetch(`${API_URL}?${searchParams}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch available rides');
      }

      const data = await response.json();
      if (data.status === "ok") {
        setRides(data.data || []);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching available rides:', err);
      setError(err instanceof Error ? err.message : 'Failed to load rides');
    } finally {
      setLoading(false);
    }
  };

  const renderRideItem = ({ item }: { item: RideDetails }) => {
    const datetime = new Date(item.ride_start_datetime);
    const userEmail = user?.emailAddresses[0].emailAddress;

    return (
      <Pressable onPress={() => router.push({
        pathname: `/(tabs)/home/passenger-ride-details`,
        params: { 
          id: item.ride_id,
          userEmail: userEmail
        }
      })}>
        <Surface style={styles.rideCard} elevation={1}>
          <View style={styles.routeContainer}>
            <Text variant="titleMedium" numberOfLines={1}>{item.origin}</Text>
            <Text variant="titleMedium" style={styles.arrow}>→</Text>
            <Text variant="titleMedium" numberOfLines={1}>{item.destination}</Text>
          </View>
          
          <View style={styles.detailsContainer}>
            <Text variant="bodyMedium">
              {format(datetime, 'MMM d, yyyy • h:mm a')}
            </Text>
            <Text variant="bodyMedium">
              {item.available_seats} seats available
            </Text>
          </View>

          {item.vehicle_details && (
            <View style={styles.vehicleDetails}>
              <Text variant="bodyMedium">
                {item.vehicle_details.car_year} {item.vehicle_details.car_brand} {item.vehicle_details.car_model}
              </Text>
              <Text variant="bodyMedium">
                Color: {item.vehicle_details.car_color}
              </Text>
            </View>
          )}
        </Surface>
      </Pressable>
    );
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

      <Text variant="headlineMedium" style={styles.title}>Available Rides</Text>

      {loading ? (
        <Text style={styles.messageText}>Loading rides...</Text>
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : rides.length === 0 ? (
        <Text style={styles.messageText}>No rides available for your search criteria</Text>
      ) : (
        <FlatList
          data={rides}
          renderItem={renderRideItem}
          keyExtractor={item => item.ride_id}
          contentContainerStyle={styles.listContent}
        />
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
  listContent: {
    gap: 16,
  },
  rideCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  arrow: {
    color: '#666',
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  vehicleDetails: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  messageText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 24,
  },
  errorText: {
    color: '#FF5252',
    textAlign: 'center',
    marginTop: 24,
  },
});