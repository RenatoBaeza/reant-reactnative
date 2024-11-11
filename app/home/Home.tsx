import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@clerk/clerk-expo'
import { StyleSheet, View, KeyboardAvoidingView, Platform, ScrollView, KeyboardAvoidingViewProps, Pressable } from 'react-native'
import { Text, Surface, IconButton, useTheme } from 'react-native-paper'
import Animated, { FadeInUp } from 'react-native-reanimated'
import { ProfileSidebar } from '../../components/ProfileSidebar';
import { useURL } from 'expo-linking'
import { useRouter } from 'expo-router';
import { Map } from '../../components/Map';
import { DriverForm } from '../../components/DriverForm';
import { PassengerForm } from '../../components/PassengerForm';
import { Header } from '../../components/Header';

export default function Home() {
  const { user } = useUser()
  const theme = useTheme()
  const [selectedMode, setSelectedMode] = useState<'driver' | 'passenger' | null>(null)
  const [driverForm, setDriverForm] = useState({
    origin: '',
    originPlaceId: '',
    originLocation: null,
    destination: '',
    destinationPlaceId: '',
    destinationLocation: null,
    date: '',
    time: ''
  });
  
  const [passengerForm, setPassengerForm] = useState({
    origin: '',
    originPlaceId: '',
    originLocation: null,
    destination: '',
    destinationPlaceId: '',
    destinationLocation: null,
    date: ''
  });

  const [isSidebarVisible, setIsSidebarVisible] = useState(false)

  const handleModeSelect = (mode: 'driver' | 'passenger') => {
    setSelectedMode(mode)
  }

  const handleProfilePress = () => {
    setIsSidebarVisible(true)
  }

  const url = useURL();
  const router = useRouter();

  const handleURLCallback = useCallback(() => {
    if (url?.includes('oauth-native-callback')) {
      router.replace('/')
      return true
    }
    return false
  }, [url, router])

  useEffect(() => {
    handleURLCallback()
  }, [url, handleURLCallback])

  // Determine the keyboard avoiding behavior based on platform
  const keyboardBehavior: KeyboardAvoidingViewProps['behavior'] = 
    Platform.OS === 'ios' ? 'padding' : 'height';

  return (
    <KeyboardAvoidingView 
      behavior={keyboardBehavior}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Header 
          userName={user?.firstName}
          onProfilePress={handleProfilePress}
        />

        {/* Services Grid */}
        <Animated.View 
          entering={FadeInUp.delay(400)}
          style={styles.servicesGrid}
        >
          <Pressable onPress={() => handleModeSelect('passenger')}>
            <Surface 
              style={[
                styles.serviceItem, 
                selectedMode === 'passenger' ? styles.selectedService : 
                selectedMode === 'driver' ? styles.disabledService : null
              ]}
            >
              <IconButton 
                icon="seat-passenger" 
                size={32}
              />
              <Text variant="labelLarge">Passenger</Text>
            </Surface>
          </Pressable>
          
          <Pressable onPress={() => handleModeSelect('driver')}>
            <Surface 
              style={[
                styles.serviceItem,
                selectedMode === 'driver' ? styles.selectedService : 
                selectedMode === 'passenger' ? styles.disabledService : null
              ]}
            >
              <IconButton icon="car" size={32} />
              <Text variant="labelLarge">Driver</Text>
            </Surface>
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(300)} style={styles.mapContainer}>
          <Map />
        </Animated.View>

        {selectedMode === 'passenger' && (
          <PassengerForm 
            form={passengerForm}
            onFormChange={setPassengerForm}
          />
        )}

        {selectedMode === 'driver' && (
          <DriverForm 
            form={driverForm}
            onFormChange={setDriverForm}
          />
        )}
      </ScrollView>

      <ProfileSidebar
        visible={isSidebarVisible}
        onDismiss={() => setIsSidebarVisible(false)}
        userName={user?.firstName ?? ''}
      />

    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24, // Add some padding at the bottom
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 16,
    justifyContent: 'center',
  },
  serviceItem: {
    width: 150,
    padding: 16,
    alignItems: 'center',
    borderRadius: 8,
    elevation: 2,
  },
  selectedService: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
    borderWidth: 2,
  },
  disabledService: {
    opacity: 0.5,
  },
  formContainer: {
    padding: 16,
  },
  form: {
    padding: 16,
    borderRadius: 8,
  },
  input: {
    marginBottom: 16,
  },
  submitButton: {
    marginTop: 8,
  },
  mapContainer: {
    padding: 16,
  },
})