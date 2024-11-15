import { useState, useEffect } from 'react';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import { StyleSheet, View } from 'react-native';
import { LatLng, MapRegion } from '../types/map';

interface MapProps {
  origin: LatLng | null;
  destination: LatLng | null;
}

export function Map({ origin, destination }: MapProps) {
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [region, setRegion] = useState<MapRegion | null>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location was denied');
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
    })();
  }, []);

  return (
    <View style={styles.container}>
      {region && (
        <MapView
          provider={PROVIDER_DEFAULT}
          style={styles.map}
          initialRegion={region}
          urlTemplate="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        >
          {currentLocation && (
            <Marker
              coordinate={{
                latitude: currentLocation.coords.latitude,
                longitude: currentLocation.coords.longitude,
              }}
              title="You are here"
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
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});