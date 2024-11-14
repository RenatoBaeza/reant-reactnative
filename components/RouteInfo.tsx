import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useEffect, useState } from 'react';
import { LatLng } from '../types/map';

interface RouteInfoProps {
  origin: LatLng;
  destination: LatLng;
}

export function RouteInfo({ origin, destination }: RouteInfoProps) {
  const [distance, setDistance] = useState<string>('');
  const [duration, setDuration] = useState<string>('');

  useEffect(() => {
    if (!origin || !destination) return;

    const fetchRouteInfo = async () => {
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/distancematrix/json?` +
          `origins=${origin.lat},${origin.lng}&` +
          `destinations=${destination.lat},${destination.lng}&` +
          `mode=driving&` +
          `key=${process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}`
        );

        const data = await response.json();
        
        if (data.status === 'OK' && data.rows[0].elements[0].status === 'OK') {
          const element = data.rows[0].elements[0];
          setDistance(element.distance.text);
          setDuration(element.duration.text);
        }
      } catch (error) {
        console.error('Error fetching route info:', error);
      }
    };

    fetchRouteInfo();
  }, [origin, destination]);

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
    marginTop: 8,
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  text: {
    color: '#666',
    textAlign: 'center',
  }
});