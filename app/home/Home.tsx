import { useState } from 'react'
import { useUser, useAuth } from '@clerk/clerk-expo'
import { StyleSheet, View, ScrollView, Pressable } from 'react-native'
import { Text, Surface, Button, IconButton, useTheme, TextInput } from 'react-native-paper'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated'

export default function Page() {
  const { user } = useUser()
  const { signOut } = useAuth()
  const theme = useTheme()
  const [selectedMode, setSelectedMode] = useState<'driver' | 'passenger' | null>(null)
  const [driverForm, setDriverForm] = useState({
    origin: '',
    destination: '',
    date: '',
    time: ''
  })
  const [passengerForm, setPassengerForm] = useState({
    origin: '',
    destination: '',
    date: ''
  })

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleModeSelect = (mode: 'driver' | 'passenger') => {
    setSelectedMode(mode)
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <Animated.View entering={FadeInDown} style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text variant="titleMedium">Good Morning</Text>
            <Text variant="titleLarge">{user?.firstName}</Text>
          </View>
          <IconButton
            icon="account-circle"
            size={40}
            onPress={handleSignOut}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={{ padding: 8 }}
          />
        </View>
      </Animated.View>

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
            <IconButton 
              icon="car" 
              size={32}
            />
            <Text variant="labelLarge">Driver</Text>
          </Surface>
        </Pressable>
      </Animated.View>

      {/* Passenger Form */}
      {selectedMode === 'passenger' && (
        <Animated.View 
          entering={FadeInUp.delay(200)}
          style={styles.formContainer}
        >
          <Surface style={styles.form}>
            <TextInput
              mode="outlined"
              label="Origin"
              value={passengerForm.origin}
              onChangeText={(text) => setPassengerForm(prev => ({ ...prev, origin: text }))}
              style={styles.input}
            />
            <TextInput
              mode="outlined"
              label="Destination"
              value={passengerForm.destination}
              onChangeText={(text) => setPassengerForm(prev => ({ ...prev, destination: text }))}
              style={styles.input}
            />
            <TextInput
              mode="outlined"
              label="Date"
              value={passengerForm.date}
              onChangeText={(text) => setPassengerForm(prev => ({ ...prev, date: text }))}
              style={styles.input}
            />
            <Button mode="contained" style={styles.submitButton}>
              Search Rides
            </Button>
          </Surface>
        </Animated.View>
      )}

      {/* Driver Form */}
      {selectedMode === 'driver' && (
        <Animated.View 
          entering={FadeInUp.delay(200)}
          style={styles.formContainer}
        >
          <Surface style={styles.form}>
            <TextInput
              mode="outlined"
              label="Origin"
              value={driverForm.origin}
              onChangeText={(text) => setDriverForm(prev => ({ ...prev, origin: text }))}
              style={styles.input}
            />
            <TextInput
              mode="outlined"
              label="Destination"
              value={driverForm.destination}
              onChangeText={(text) => setDriverForm(prev => ({ ...prev, destination: text }))}
              style={styles.input}
            />
            <TextInput
              mode="outlined"
              label="Date"
              value={driverForm.date}
              onChangeText={(text) => setDriverForm(prev => ({ ...prev, date: text }))}
              style={styles.input}
            />
            <TextInput
              mode="outlined"
              label="Time"
              value={driverForm.time}
              onChangeText={(text) => setDriverForm(prev => ({ ...prev, time: text }))}
              style={styles.input}
            />
            <Button mode="contained" style={styles.submitButton}>
              Submit
            </Button>
          </Surface>
        </Animated.View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  }
})