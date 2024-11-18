import { View, StyleSheet, Platform, FlatList, Pressable } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';

const API_URL = Platform.select({
  android: 'http://10.0.2.2:8000/rides/passenger-rides',
  ios: 'http://localhost:8000/rides/passenger-rides',
  default: 'http://localhost:8000/rides/passenger-rides',
});

interface RideDetails {
  ride_id: string;
  origin: string;
  destination: string;
  available_seats: number;
  ride_start_datetime: string;
  ride_status: 'awaiting' | 'confirmed' | 'active' | 'cancelled' | 'complete';
}

export function PassengerRidesList() {
  const { user } = useUser();
  const router = useRouter();
  const [rides, setRides] = useState<RideDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPassengerRides();
  }, []);

  const fetchPassengerRides = async () => {
    try {
      const userEmail = user?.emailAddresses[0].emailAddress;
      if (!userEmail) {
        throw new Error('User email is required');
      }

      const response = await fetch(API_URL, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'passenger-email': userEmail,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch passenger rides');
      }

      const data = await response.json();
      if (data.status === "ok") {
        const sortedRides = (data.data || []).sort((a, b) => 
          new Date(b.ride_start_datetime).getTime() - new Date(a.ride_start_datetime).getTime()
        );
        setRides(sortedRides);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching passenger rides:', err);
      setError(err instanceof Error ? err.message : 'Failed to load rides');
    } finally {
      setLoading(false);
    }
  };

  const renderRideItem = ({ item }: { item: RideDetails }) => {
    const datetime = new Date(item.ride_start_datetime);

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'awaiting':
          return '#FFC107'; // Yellow
        case 'confirmed':
          return '#4CAF50'; // Green
        case 'active':
          return '#2196F3'; // Blue
        case 'cancelled':
          return '#FF5252'; // Red
        case 'complete':
          return '#666666'; // Gray
        default:
          return '#666666';
      }
    };

    return (
      <Pressable onPress={() => router.push(`/home/passenger-ride-details?id=${item.ride_id}`)}>
        <Surface style={styles.rideCard} elevation={1}>
          <View style={styles.routeContainer}>
            <Text variant="titleMedium" numberOfLines={1}>{item.origin}</Text>
            <Text variant="titleMedium" style={styles.arrow}>→</Text>
            <Text variant="titleMedium" numberOfLines={1}>{item.destination}</Text>
          </View>
          <View style={styles.detailsContainer}>
            <View>
              <Text variant="bodyMedium">
                {format(datetime, 'MMM d, yyyy • h:mm a')}
              </Text>
              <Text 
                variant="bodyMedium" 
                style={[styles.statusText, { color: getStatusColor(item.ride_status) }]}
              >
                {item.ride_status.charAt(0).toUpperCase() + item.ride_status.slice(1)}
              </Text>
            </View>
            <Text variant="bodyMedium">
              {item.available_seats} seats available
            </Text>
          </View>
        </Surface>
      </Pressable>
    );
  };

  if (loading) {
    return <Text>Loading rides...</Text>;
  }

  if (error) {
    return <Text style={styles.errorText}>{error}</Text>;
  }

  if (rides.length === 0) {
    return <Text style={styles.emptyText}>No active rides found</Text>;
  }

  return (
    <View style={styles.container}>
      <Text variant="titleLarge" style={styles.title}>Your Active Rides</Text>
      <FlatList
        data={rides}
        renderItem={renderRideItem}
        keyExtractor={item => item.ride_id}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },
  title: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  listContent: {
    padding: 16,
    gap: 12,
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
    marginBottom: 8,
  },
  arrow: {
    color: '#666',
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  errorText: {
    color: '#FF5252',
    textAlign: 'center',
    marginTop: 24,
    paddingHorizontal: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 24,
    paddingHorizontal: 16,
  },
  statusText: {
    marginTop: 4,
    fontWeight: '500',
  },
});