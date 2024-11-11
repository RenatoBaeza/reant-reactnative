import { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { ActivityIndicator, Text } from 'react-native-paper';

export function Map() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);

      // Get address from coordinates
      try {
        const reverseGeocode = await Location.reverseGeocodeAsync({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });

        if (reverseGeocode.length > 0) {
          const loc = reverseGeocode[0];
          const addressComponents = [
            loc.street,
            loc.district,
            loc.city,
            loc.region,
            loc.postalCode
          ].filter(Boolean); // Remove empty/undefined values
          
          setAddress(addressComponents.join(', '));
        }
      } catch (error) {
        console.error('Error getting address:', error);
        setAddress('Unable to fetch address');
      }
    })();
  }, []);

  if (!location) {
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
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          zoomEnabled={false}
          rotateEnabled={false}
          scrollEnabled={false}
          pitchEnabled={false}
        >
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="You are here"
          />
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