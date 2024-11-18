import { View, StyleSheet, Platform, FlatList, Pressable } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';

const API_URL = Platform.select({
  android: 'http://10.0.2.2:8000/rides/get-completed-rides',
  ios: 'http://localhost:8000/rides/get-completed-rides',
  default: 'http://localhost:8000/rides/get-completed-rides',
});

interface RideDetails {
  ride_id: string;
  origin: string;
  destination: string;
  available_seats: number;
  ride_start_datetime: string;
}

export function CompletedRidesList() {
  const { user } = useUser();
  const router = useRouter();
  const [rides, setRides] = useState<RideDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCompletedRides();
  }, []);

  const fetchCompletedRides = async () => {
    try {
      const userEmail = user?.emailAddresses[0].emailAddress;
      if (!userEmail) {
        throw new Error('User email is required');
      }

      const response = await fetch(API_URL, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'user-email': userEmail,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch completed rides');
      }

      const data = await response.json();
      if (data.status === "ok") {
        setRides(data.data || []);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching completed rides:', err);
      setError(err instanceof Error ? err.message : 'Failed to load rides');
    } finally {
      setLoading(false);
    }
  };

  const renderRideItem = ({ item }: { item: RideDetails }) => {
    const datetime = new Date(item.ride_start_datetime);

    return (
      <Pressable onPress={() => router.push(`/rides/driver-rides-details?id=${item.ride_id}`)}>
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
    return <Text style={styles.emptyText}>No completed rides found</Text>;
  }

  return (
    <View style={styles.container}>
      <Text variant="titleLarge" style={styles.title}>Completed Rides</Text>
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
    alignItems: 'center',
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
});