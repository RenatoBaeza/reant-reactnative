import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-expo';
import { StyleSheet, View, KeyboardAvoidingView, Platform } from 'react-native';
import { usePathname } from 'expo-router';
import { Header } from '../../../components/Header';
import { Map } from '../../../components/Map';
import { PassengerForm } from '../../../components/PassengerForm';
import { PassengerRidesList } from '../../../components/PassengerRidesList';
import { LatLng } from '../../../types/map';

export default function Home() {
  const { user } = useUser();
  const pathname = usePathname();
  const [refreshKey, setRefreshKey] = useState(0);
  const [passengerForm, setPassengerForm] = useState({
    origin: '',
    originPlaceId: '',
    originLocation: null as LatLng | null,
    destination: '',
    destinationPlaceId: '',
    destinationLocation: null as LatLng | null,
    date: new Date(),
    distance: '',
    duration: '',
  });

  useEffect(() => {
    if (pathname === '/home') {
      setRefreshKey(prev => prev + 1);
    }
  }, [pathname]);

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.topContent}>
        <Header 
          userName={user?.firstName}
        />
        <Map 
          origin={passengerForm.originLocation}
          destination={passengerForm.destinationLocation}
        />
        <PassengerForm 
          form={passengerForm}
          onFormChange={setPassengerForm}
        />
      </View>
      <View style={styles.listContainer}>
        <PassengerRidesList key={refreshKey} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topContent: {
    paddingBottom: 16,
  },
  listContainer: {
    flex: 1,
  },
});