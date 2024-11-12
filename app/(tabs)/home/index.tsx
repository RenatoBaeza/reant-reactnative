import { useState } from 'react';
import { useUser } from '@clerk/clerk-expo';
import { StyleSheet, View, KeyboardAvoidingView, Platform } from 'react-native';
import { Header } from '../../../components/Header';
import { Map } from '../../../components/Map';
import { DriverForm } from '../../../components/DriverForm';
import { PassengerForm } from '../../../components/PassengerForm';
import { ProfileSidebar } from '../../../components/ProfileSidebar';

export default function Home() {
  const { user } = useUser();
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [driverForm, setDriverForm] = useState({
    origin: '',
    originPlaceId: '',
    originLocation: null,
    destination: '',
    destinationPlaceId: '',
    destinationLocation: null,
    date: '',
    time: '',
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
      <Map />
      <DriverForm 
        form={driverForm}
        onFormChange={setDriverForm}
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