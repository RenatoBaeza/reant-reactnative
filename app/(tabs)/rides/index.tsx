import { View, StyleSheet, SafeAreaView, SectionList, Pressable } from "react-native";
import { Text, Button, Surface } from "react-native-paper";
import { useRouter, usePathname } from "expo-router";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-expo';
import { format } from 'date-fns';
import { Platform } from 'react-native';

const API_URLS = {
  awaiting: Platform.select({
    android: 'http://10.0.2.2:8000/rides/get-awaiting-rides',
    ios: 'http://localhost:8000/rides/get-awaiting-rides',
    default: 'http://localhost:8000/rides/get-awaiting-rides',
  }),
  confirmed: Platform.select({
    android: 'http://10.0.2.2:8000/rides/get-confirmed-rides',
    ios: 'http://localhost:8000/rides/get-confirmed-rides',
    default: 'http://localhost:8000/rides/get-confirmed-rides',
  }),
  active: Platform.select({
    android: 'http://10.0.2.2:8000/rides/get-active-rides',
    ios: 'http://localhost:8000/rides/get-active-rides',
    default: 'http://localhost:8000/rides/get-active-rides',
  }),
  cancelled: Platform.select({
    android: 'http://10.0.2.2:8000/rides/get-cancelled-rides',
    ios: 'http://localhost:8000/rides/get-cancelled-rides',
    default: 'http://localhost:8000/rides/get-cancelled-rides',
  }),
};

interface RideDetails {
  ride_id: string;
  origin: string;
  destination: string;
  available_seats: number;
  ride_start_datetime: string;
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

      console.log('Fetching rides with URLs:', {
        awaiting: API_URLS.awaiting,
        confirmed: API_URLS.confirmed,
        active: API_URLS.active,
        cancelled: API_URLS.cancelled
      });

      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'user-email': userEmail,
      };

      // Add loading state while fetching
      setLoading(true);
      setError(null);

      const [awaitingRes, confirmedRes, activeRes, cancelledRes] = await Promise.all([
        fetch(API_URLS.awaiting, { headers }),
        fetch(API_URLS.confirmed, { headers }),
        fetch(API_URLS.active, { headers }),
        fetch(API_URLS.cancelled, { headers }),
      ]);

      const [awaitingData, confirmedData, activeData, cancelledData] = await Promise.all([
        awaitingRes.json(),
        confirmedRes.json(),
        activeRes.json(),
        cancelledRes.json(),
      ]);

      console.log('Rides data fetched:', {
        awaiting: awaitingData,
        confirmed: confirmedData,
        active: activeData,
        cancelled: cancelledData
      });

      setSections([
        { title: 'Awaiting Rides', data: awaitingData.status === 'ok' ? awaitingData.data : [] },
        { title: 'Confirmed Rides', data: confirmedData.status === 'ok' ? confirmedData.data : [] },
        { title: 'Active Rides', data: activeData.status === 'ok' ? activeData.data : [] },
        { title: 'Cancelled Rides', data: cancelledData.status === 'ok' ? cancelledData.data : [] },
      ]);
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
          onPress={() => router.push(`/rides/rides-awaiting?id=${item.id}`)}
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
