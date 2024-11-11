import { useUser, useAuth } from '@clerk/clerk-expo'
import { StyleSheet, View, ScrollView } from 'react-native'
import { Text, Surface, Button, IconButton, useTheme } from 'react-native-paper'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated'

export default function Page() {
  const { user } = useUser()
  const { signOut } = useAuth()
  const theme = useTheme()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
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

      {/* Where to? Search Bar */}
      <Animated.View 
        entering={FadeInUp.delay(200)} 
        style={styles.searchContainer}
      >
        <Surface style={styles.searchBar}>
          <MaterialCommunityIcons name="magnify" size={24} color={theme.colors.primary} />
          <Text variant="bodyLarge" style={styles.searchText}>Where to?</Text>
        </Surface>
      </Animated.View>

      {/* Services Grid */}
      <Animated.View 
        entering={FadeInUp.delay(400)}
        style={styles.servicesGrid}
      >
        <Surface style={styles.serviceItem}>
          <IconButton icon="car" size={32} />
          <Text variant="labelLarge">Ride</Text>
        </Surface>
        
        <Surface style={styles.serviceItem}>
          <IconButton icon="food" size={32} />
          <Text variant="labelLarge">Food</Text>
        </Surface>
        
      </Animated.View>

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
  searchContainer: {
    padding: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    elevation: 4,
  },
  searchText: {
    marginLeft: 8,
    color: '#666',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 16,
  },
  serviceItem: {
    width: '45%',
    padding: 16,
    alignItems: 'center',
    borderRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    padding: 16,
    paddingBottom: 8,
  },
  recentTrip: {
    flexDirection: 'row',
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  tripDetails: {
    marginLeft: 12,
  },
  tripDate: {
    color: '#666',
  },
})