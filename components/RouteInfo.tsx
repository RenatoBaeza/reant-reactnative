import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useEffect, useState } from 'react';
import { LatLng } from '../types/map';

interface RouteInfoProps {
  origin: LatLng;
  destination: LatLng;
  onRouteInfo?: (distance: string, duration: string) => void;
}

export function RouteInfo({ origin, destination, onRouteInfo }: RouteInfoProps) {
  const [distance, setDistance] = useState<string>('');
  const [duration, setDuration] = useState<string>('');

  useEffect(() => {
    if (!origin || !destination) return;

    const fetchRouteInfo = async () => {
      try {
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/` +
          `${origin.lng},${origin.lat};${destination.lng},${destination.lat}` +
          `?overview=false`
        );

        const data = await response.json();
        
        if (data.code === 'Ok' && data.routes?.[0]) {
          const route = data.routes[0];
          const distanceKm = (route.distance / 1000).toFixed(1);
          const durationMin = Math.round(route.duration / 60);
          
          setDistance(`${distanceKm} km`);
          setDuration(`${durationMin} min`);
          onRouteInfo?.(`${distanceKm} km`, `${durationMin} min`);
        }
      } catch (error) {
        console.error('Error fetching route info:', error);
      }
    };

    fetchRouteInfo();
  }, [origin, destination, onRouteInfo]);

  if (!distance || !duration) return null;

  return (
    <View style={styles.container}>
      <Text variant="bodyMedium" style={styles.text}>
        Distance: {distance} • Driving time: {duration}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginTop: 8,
  },
  text: {
    textAlign: 'center',
  },
});