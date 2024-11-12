import { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { ActivityIndicator, Text } from 'react-native-paper';
import { MapRegion, LatLng } from '../types/map';

interface MapProps {
  origin?: LatLng;
  destination?: LatLng;
}

export function Map({ origin, destination }: MapProps) {
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [region, setRegion] = useState<MapRegion | null>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setCurrentLocation(location);
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });

      // Get address from coordinates
      try {
        const reverseGeocode = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        if (reverseGeocode.length > 0) {
          const loc = reverseGeocode[0];
          const addressComponents = [
            loc.street,
            loc.district,
            loc.city,
            loc.region,
            loc.postalCode
          ].filter(Boolean);
          
          setAddress(addressComponents.join(', '));
        }
      } catch (error) {
        console.error('Error getting address:', error);
        setAddress('Unable to fetch address');
      }
    })();
  }, []);

  useEffect(() => {
    if (origin && destination) {
      // Calculate the region to show both markers
      const bounds = {
        minLat: Math.min(origin.lat, destination.lat),
        maxLat: Math.max(origin.lat, destination.lat),
        minLng: Math.min(origin.lng, destination.lng),
        maxLng: Math.max(origin.lng, destination.lng),
      };

      const center = {
        latitude: (bounds.minLat + bounds.maxLat) / 2,
        longitude: (bounds.minLng + bounds.maxLng) / 2,
      };

      const latDelta = (bounds.maxLat - bounds.minLat) * 1.5;
      const lngDelta = (bounds.maxLng - bounds.minLng) * 1.5;

      setRegion({
        ...center,
        latitudeDelta: Math.max(latDelta, 0.0922),
        longitudeDelta: Math.max(lngDelta, 0.0421),
      });
    }
  }, [origin, destination]);

  if (!currentLocation || !region) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View>
      <View style={styles.container}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          region={region}
          zoomEnabled={true}
          rotateEnabled={false}
          scrollEnabled={true}
          pitchEnabled={false}
        >
          {currentLocation && (
            <Marker
              coordinate={{
                latitude: currentLocation.coords.latitude,
                longitude: currentLocation.coords.longitude,
              }}
              title="Current Location"
            />
          )}
          {origin && (
            <Marker
              coordinate={{
                latitude: origin.lat,
                longitude: origin.lng,
              }}
              title="Origin"
              pinColor="green"
            />
          )}
          {destination && (
            <Marker
              coordinate={{
                latitude: destination.lat,
                longitude: destination.lng,
              }}
              title="Destination"
              pinColor="red"
            />
          )}
        </MapView>
      </View>
      <View style={styles.addressContainer}>
        <Text variant="labelSmall" style={styles.addressLabel}>YOUR LOCATION</Text>
        <Text variant="bodyMedium" style={styles.addressText}>
          {address || 'Loading address...'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 150,
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    height: 300,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
  },
  addressContainer: {
    paddingTop: 8,
  },
  addressLabel: {
    color: '#666',
    marginBottom: 4,
  },
  addressText: {
    color: '#333',
  }
});