import { useState } from 'react';
import { useUser } from '@clerk/clerk-expo';
import { StyleSheet, View, KeyboardAvoidingView, Platform } from 'react-native';
import { Header } from '../../../components/Header';
import { Map } from '../../../components/Map';
import { PassengerForm } from '../../../components/PassengerForm';
import { ProfileSidebar } from '../../../components/ProfileSidebar';
import { LatLng } from '../../../types/map';

export default function Home() {
  const { user } = useUser();
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
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

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <Header 
        userName={user?.firstName} 
        onProfilePress={() => setIsSidebarVisible(true)} 
      />
      <Map 
        origin={passengerForm.originLocation}
        destination={passengerForm.destinationLocation}
      />
      <PassengerForm 
        form={passengerForm}
        onFormChange={setPassengerForm}
      />
      <ProfileSidebar
        visible={isSidebarVisible}
        onDismiss={() => setIsSidebarVisible(false)}
        userName={user?.firstName ?? 'User'}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});