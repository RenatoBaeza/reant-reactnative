import { View, StyleSheet, SafeAreaView, SectionList, Pressable } from "react-native";
import { Text, Button, Surface } from "react-native-paper";
import { useRouter, usePathname } from "expo-router";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-expo';
import { format } from 'date-fns';
import { Platform } from 'react-native';

const API_URL = Platform.select({
  android: 'http://10.0.2.2:8000/rides/get-rides',
  ios: 'http://localhost:8000/rides/get-rides',
  default: 'http://localhost:8000/rides/get-rides',
});

interface RideDetails {
  ride_id: string;
  driver_email: string;
  vehicle_id: string;
  origin: string;
  destination: string;
  available_seats: number;
  ride_start_datetime: string;
  ride_status: 'awaiting' | 'confirmed' | 'active' | 'cancelled';
  seats_details: SeatsDetails;
  vehicle_details?: {
    car_brand: string;
    car_model: string;
    car_year: string;
    car_color: string;
    car_license_plate: string;
  };
}

interface Section {
  title: string;
  data: RideDetails[];
}

export default function Rides() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useUser();
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch rides when the user is on the main rides screen
    if (pathname === '/rides') {
      console.log('Rides screen active - fetching latest rides');
      fetchRides();
    }
  }, [pathname, user]);

  const fetchRides = async () => {
    try {
      const userEmail = user?.emailAddresses[0].emailAddress;
      if (!userEmail) {
        throw new Error('User email is required');
      }

      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'user-email': userEmail,
      };

      setLoading(true);
      setError(null);

      const response = await fetch(API_URL, { headers });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to fetch rides');
      }

      if (data.status === 'ok') {
        // Filter rides based on their status
        const awaitingRides = data.data.filter(ride => ride.ride_status === 'awaiting');
        const confirmedRides = data.data.filter(ride => ride.ride_status === 'confirmed');
        const activeRides = data.data.filter(ride => ride.ride_status === 'active');
        const cancelledRides = data.data.filter(ride => ride.ride_status === 'cancelled');

        setSections([
          { title: 'Awaiting Rides', data: awaitingRides },
          { title: 'Confirmed Rides', data: confirmedRides },
          { title: 'Active Rides', data: activeRides },
          { title: 'Cancelled Rides', data: cancelledRides },
        ]);
      }
    } catch (err) {
      console.error('Error fetching rides:', err);
      setError(err instanceof Error ? err.message : 'Failed to load rides');
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: RideDetails }) => {
    return (
      <Surface style={styles.card} elevation={1}>
        <Pressable 
          onPress={() => router.push(`/rides/driver-rides-details?id=${item.ride_id}`)}
          style={({ pressed }) => [
            styles.pressable,
            pressed && styles.pressed
          ]}
        >
          <View style={styles.cardContent}>
            <View style={styles.routeContainer}>
              <Text variant="titleMedium">{item.origin}</Text>
              <MaterialCommunityIcons 
                name="arrow-right" 
                size={20} 
                color="#666" 
                style={styles.arrow}
              />
              <Text variant="titleMedium">{item.destination}</Text>
            </View>
            
            <View style={styles.detailsContainer}>
              <Text variant="bodyMedium">
                {format(new Date(item.ride_start_datetime), 'MMM dd, yyyy • HH:mm')}
              </Text>
              <Text variant="bodyMedium">
                {item.available_seats} seats available
              </Text>
            </View>
          </View>
        </Pressable>
      </Surface>
    );
  };

  const renderSectionHeader = ({ section: { title, data } }: { section: Section }) => {
    if (data.length === 0) return null;
    return (
      <View style={styles.sectionHeader}>
        <Text variant="titleLarge">{title}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text>Loading rides...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

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
        <SectionList
          sections={sections}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          keyExtractor={(item) => item.ride_id}
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled={false}
        />
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
  sectionHeader: {
    backgroundColor: '#fff',
    padding: 16,
    paddingBottom: 8,
  },
  listContent: {
    padding: 16,
  },
  card: {
    margin: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  pressable: {
    width: '100%',
  },
  pressed: {
    opacity: 0.7,
  },
  cardContent: {
    padding: 16,
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  arrow: {
    marginHorizontal: 8,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  errorText: {
    color: '#FF5252',
    textAlign: 'center',
    marginTop: 24,
    padding: 16,
  },
});
