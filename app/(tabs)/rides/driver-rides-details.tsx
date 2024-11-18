import { View, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { Text, Surface, Button, Portal, Modal } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-expo';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { FlatList } from 'react-native';


const API_URL_GET = Platform.select({
  android: 'http://10.0.2.2:8000/rides/get-ride',
  ios: 'http://localhost:8000/rides/get-ride',
  default: 'http://localhost:8000/rides/get-ride',
});

const API_URL_PUT = Platform.select({
  android: 'http://10.0.2.2:8000/rides/cancel-ride',
  ios: 'http://localhost:8000/rides/cancel-ride',
  default: 'http://localhost:8000/rides/cancel-ride',
});

const API_URL_ACCEPT = Platform.select({
  android: 'http://10.0.2.2:8000/rides/accept-passenger-seat',
  ios: 'http://localhost:8000/rides/accept-passenger-seat',
  default: 'http://localhost:8000/rides/accept-passenger-seat',
});

const API_URL_REMOVE = Platform.select({
  android: 'http://10.0.2.2:8000/rides/remove-passenger',
  ios: 'http://localhost:8000/rides/remove-passenger',
  default: 'http://localhost:8000/rides/remove-passenger',
});

const API_URL_REMOVE_PASSENGER = Platform.select({
  android: 'http://10.0.2.2:8000/rides/remove-passenger-seat',
  ios: 'http://localhost:8000/rides/remove-passenger-seat',
  default: 'http://localhost:8000/rides/remove-passenger-seat',
});

const API_URL_CONFIRM = Platform.select({
  android: 'http://10.0.2.2:8000/rides/driver-confirms-ride',
  ios: 'http://localhost:8000/rides/driver-confirms-ride',
  default: 'http://localhost:8000/rides/driver-confirms-ride',
});

const API_URL_START = Platform.select({
  android: 'http://10.0.2.2:8000/rides/ride-start',
  ios: 'http://localhost:8000/rides/ride-start',
  default: 'http://localhost:8000/rides/ride-start',
});

const API_URL_COMPLETE = Platform.select({
  android: 'http://10.0.2.2:8000/rides/ride-complete',
  ios: 'http://localhost:8000/rides/ride-complete',
  default: 'http://localhost:8000/rides/ride-complete',
});

interface SeatDetail {
  seat_id: string;
  seat_number: number;
  seat_status: 'free' | 'taken' | 'pending';
  passenger_email: string | null;
}

interface SeatsDetails {
  [key: string]: SeatDetail;
}

interface RideDetails {
  ride_id: string;
  driver_email: string;
  vehicle_id: string;
  origin: string;
  destination: string;
  available_seats: number;
  ride_start_datetime: string;
  seats_details: SeatsDetails;
  ride_status: 'awaiting' | 'confirmed' | 'active' | 'cancelled' | 'complete';
  vehicle_details?: {
    car_brand: string;
    car_model: string;
    car_year: string;
    car_color: string;
    car_license_plate: string;
  };
}

interface RideResponse {
  status: string;
  data: RideDetails;
  is_driver: boolean;
}

const hasAnyTakenSeats = (seatsDetails: SeatsDetails): boolean => {
  return Object.values(seatsDetails).some(seat => seat.seat_status === 'taken');
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'awaiting':
      return '#FFC107'; // Yellow
    case 'confirmed':
      return '#4CAF50'; // Green
    case 'active':
      return '#2196F3'; // Blue
    case 'cancelled':
      return '#FF5252'; // Red
    case 'unfilled':
      return '#666666'; // Green
    default:
      return '#666666'; // Gray
  }
};

export default function DriverRidesDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useUser();
  const [ride, setRide] = useState<RideDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [showCompleteConfirmation, setShowCompleteConfirmation] = useState(false);

  useEffect(() => {
    console.log('Ride ID received:', id);
    if (id) {
      fetchRideDetails();
    }
  }, [id]);

  const fetchRideDetails = async () => {
    try {
      const userEmail = user?.emailAddresses[0].emailAddress;
      if (!userEmail) {
        throw new Error('User email is required');
      }
  
      console.log('Fetching ride details for ID:', id);
      
      const response = await fetch(`${API_URL_GET}/${id}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'user-email': userEmail,
        },
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`Failed to fetch ride details: ${errorText}`);
      }
  
      const responseData: RideResponse = await response.json();
      console.log('Ride details response:', JSON.stringify(responseData, null, 2));
      
      setRide(responseData.data);
    } catch (err) {
      console.error('Error fetching ride details:', err);
      setError(err instanceof Error ? err.message : 'Failed to load ride details');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelConfirm = async () => {
    try {
      const userEmail = user?.emailAddresses[0].emailAddress;
      if (!userEmail) {
        throw new Error('User email is required');
      }

      const response = await fetch(`${API_URL_PUT}/${id}`, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'user-email': userEmail,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to cancel ride');
      }

      const data = await response.json();
      if (data.status === 'ok') {
        // Show success message (optional)
        // Navigate back to rides list
        router.replace('/rides');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Error canceling ride:', err);
      setError(err instanceof Error ? err.message : 'Failed to cancel ride');
    } finally {
      setShowCancelConfirmation(false);
    }
  };

  const handleConfirmRide = async () => {
    try {
      const userEmail = user?.emailAddresses[0].emailAddress;
      if (!userEmail) {
        throw new Error('User email is required');
      }

      const response = await fetch(`${API_URL_CONFIRM}/${id}`, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'user-email': userEmail,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to confirm ride');
      }

      const data = await response.json();
      if (data.status === 'ok') {
        await fetchRideDetails();
        router.replace('/rides');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Error confirming ride:', err);
      setError(err instanceof Error ? err.message : 'Failed to confirm ride');
    }
  };

  const handleStartRide = async () => {
    try {
      const userEmail = user?.emailAddresses[0].emailAddress;
      if (!userEmail) {
        throw new Error('User email is required');
      }

      const response = await fetch(`${API_URL_START}/${id}`, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'user-email': userEmail,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to start ride');
      }

      const data = await response.json();
      if (data.status === 'ok') {
        await fetchRideDetails();
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Error starting ride:', err);
      setError(err instanceof Error ? err.message : 'Failed to start ride');
    }
  };

  const handleCompleteRide = async () => {
    try {
      const userEmail = user?.emailAddresses[0].emailAddress;
      if (!userEmail) {
        throw new Error('User email is required');
      }

      const response = await fetch(`${API_URL_COMPLETE}/${id}`, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'user-email': userEmail,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to complete ride');
      }

      const data = await response.json();
      if (data.status === 'ok') {
        await fetchRideDetails();
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Error completing ride:', err);
      setError(err instanceof Error ? err.message : 'Failed to complete ride');
    } finally {
      setShowCompleteConfirmation(false);
    }
  };

  const renderSeatItem = ({ item }: { item: SeatDetail }) => {
    const getStatusColor = (status: string) => {
      switch (status) {
        case 'free':
          return '#4CAF50'; // Green
        case 'taken':
          return '#FF5252'; // Red
        case 'pending':
          return '#FFC107'; // Yellow
        default:
          return '#666666'; // Gray
      }
    };

    const getStatusText = (status: string) => {
      switch (status) {
        case 'free':
          return 'Available';
        case 'taken':
          return 'Taken';
        case 'pending':
          return 'Pending';
        case 'unfilled':
          return 'Unfilled';
        default:
          return 'Unknown';
      }
    };

    const canRemovePassenger = ride.ride_status !== 'active' && ride.ride_status !== 'complete';

    const handleAccept = async (seatId: string) => {
      try {
        const userEmail = user?.emailAddresses[0].emailAddress;
        if (!userEmail) {
          throw new Error('User email is required');
        }

        const response = await fetch(`${API_URL_ACCEPT}/${id}/${seatId}`, {
          method: 'PUT',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'user-email': userEmail,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to accept seat request');
        }

        const data = await response.json();
        if (data.status === 'ok') {
          // Refresh ride details to show updated seat status
          fetchRideDetails();
        } else {
          throw new Error('Invalid response from server');
        }
      } catch (err) {
        console.error('Error accepting seat:', err);
        setError(err instanceof Error ? err.message : 'Failed to accept seat request');
      }
    };

    const handleDecline = async (seatId: string) => {
      try {
        handleRemovePassenger(seatId);
      } catch (err) {
        console.error('Error declining seat:', err);
        setError(err instanceof Error ? err.message : 'Failed to decline seat request');
      }
    };

    const handleRemovePassenger = async (seatId: string) => {
      try {
        const userEmail = user?.emailAddresses[0].emailAddress;
        if (!userEmail) {
          throw new Error('User email is required');
        }

        const response = await fetch(`${API_URL_REMOVE_PASSENGER}/${id}/${seatId}`, {
          method: 'PUT',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'user-email': userEmail,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to remove passenger');
        }

        const data = await response.json();
        if (data.status === 'ok') {
          fetchRideDetails();
        } else {
          throw new Error('Invalid response from server');
        }
      } catch (err) {
        console.error('Error removing passenger:', err);
        setError(err instanceof Error ? err.message : 'Failed to remove passenger');
      }
    };

    return (
      <Surface style={styles.seatCard} elevation={1}>
        <View style={styles.seatInfo}>
          <Text variant="bodyLarge">Seat {item.seat_number}</Text>
          <Text 
            variant="bodyMedium" 
            style={[styles.seatStatus, { color: getStatusColor(item.seat_status) }]}
          >
            {getStatusText(item.seat_status)}
          </Text>
        </View>
        
        {item.passenger_email && (item.seat_status === 'taken' || item.seat_status === 'pending') && (
          <View style={styles.passengerInfo}>
            <View style={styles.passengerRow}>
              <Text variant="bodySmall" style={styles.passengerEmail}>
                Passenger: {item.passenger_email}
              </Text>
              {canRemovePassenger && (
                <MaterialCommunityIcons 
                  name="account-remove" 
                  size={24} 
                  color="#FF5252"
                  onPress={() => handleRemovePassenger(item.seat_id)}
                  style={styles.removeIcon}
                />
              )}
            </View>
            {item.seat_status === 'pending' && (
              <View style={styles.actionButtons}>
                <MaterialCommunityIcons 
                  name="check-circle" 
                  size={32} 
                  color="#4CAF50"
                  onPress={() => handleAccept(item.seat_id)}
                  style={styles.actionIcon}
                />
                <MaterialCommunityIcons 
                  name="close-circle" 
                  size={32} 
                  color="#FF5252"
                  onPress={() => handleDecline(item.seat_id)}
                  style={styles.actionIcon}
                />
              </View>
            )}
          </View>
        )}
      </Surface>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text variant="bodyLarge" style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const datetime = new Date(ride.ride_start_datetime);

  return (
    <View style={styles.container}>
      <Button 
        mode="text" 
        onPress={() => router.back()}
        style={styles.backButton}
        icon={() => (
          <MaterialCommunityIcons name="arrow-left" size={20} />
        )}
      >
        Back
      </Button>

      <Text variant="headlineMedium" style={styles.title}>
        Ride Details
      </Text>

      {error && (
        <Text variant="bodyMedium" style={styles.errorText}>
          {error}
        </Text>
      )}

      <Surface style={styles.card} elevation={2}>
        <View style={styles.section}>
          <Text variant="titleMedium">Route Details</Text>
          <Text variant="bodyMedium" style={styles.detail}>From: {ride.origin}</Text>
          <Text variant="bodyMedium" style={styles.detail}>To: {ride.destination}</Text>
        </View>

        <View style={styles.section}>
          <Text variant="titleMedium">Schedule</Text>
          <Text variant="bodyMedium" style={styles.detail}>
            Date: {format(datetime, 'MMMM d, yyyy')}
          </Text>
          <Text variant="bodyMedium" style={styles.detail}>
            Time: {format(datetime, 'h:mm a')}
          </Text>
        </View>

        {ride.vehicle_details && (
          <View style={styles.section}>
            <Text variant="titleMedium">Vehicle Details</Text>
            <Text variant="bodyMedium" style={styles.detail}>
              {ride.vehicle_details.car_year} {ride.vehicle_details.car_brand} {ride.vehicle_details.car_model}
            </Text>
            <Text variant="bodyMedium" style={styles.detail}>
              Color: {ride.vehicle_details.car_color}
            </Text>
            <Text variant="bodyMedium" style={styles.detail}>
              License Plate: {ride.vehicle_details.car_license_plate}
            </Text>
          </View>
        )}

        <View style={styles.section}>
          <Text variant="titleMedium">Capacity</Text>
          <Text variant="bodyMedium" style={styles.detail}>
            Available Seats: {ride.available_seats}
          </Text>
        </View>

        <View style={styles.section}>
          <Text variant="titleMedium">Status</Text>
          <Text 
            variant="bodyMedium" 
            style={[
              styles.detail, 
              { color: getStatusColor(ride.ride_status) }
            ]}
          >
            {ride.ride_status.charAt(0).toUpperCase() + ride.ride_status.slice(1)}
          </Text>
        </View>
      </Surface>

      <View style={styles.seatsSection}>
        <Text variant="titleLarge" style={styles.seatsTitle}>Available Seats</Text>
        <FlatList
          data={Object.values(ride.seats_details)}
          renderItem={renderSeatItem}
          keyExtractor={(item) => item.seat_id}
          horizontal={false}
          contentContainerStyle={styles.seatsList}
        />
      </View>

      {hasAnyTakenSeats(ride.seats_details) && ride.ride_status === 'awaiting' && (
        <Button 
          mode="contained" 
          onPress={handleConfirmRide}
          style={[styles.confirmButton, { backgroundColor: '#2196F3' }]}
          buttonColor="#2196F3"
          contentStyle={{ backgroundColor: '#2196F3' }}
          theme={{ colors: { primary: '#2196F3' } }}
        >
          Confirm Ride
        </Button>
      )}

      {ride.ride_status === 'confirmed' && (
        <Button 
          mode="contained" 
          onPress={handleStartRide}
          style={[styles.confirmButton, { backgroundColor: '#4CAF50' }]}
          buttonColor="#4CAF50"
          contentStyle={{ backgroundColor: '#4CAF50' }}
          theme={{ colors: { primary: '#4CAF50' } }}
        >
          Start Ride
        </Button>
      )}

      {ride.ride_status === 'active' ? (
        <Button 
          mode="contained" 
          onPress={() => setShowCompleteConfirmation(true)}
          style={[styles.confirmButton, { backgroundColor: '#4CAF50' }]}
          buttonColor="#4CAF50"
        >
          Complete Ride
        </Button>
      ) : (
        ride.ride_status !== 'complete' && (
          <Button 
            mode="contained" 
            onPress={() => setShowCancelConfirmation(true)}
            style={styles.cancelButton}
            buttonColor="#FF5252"
          >
            Cancel Ride
          </Button>
        )
      )}

      <Portal>
        <Modal
          visible={showCancelConfirmation}
          onDismiss={() => setShowCancelConfirmation(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Surface style={styles.modalContent}>
            <Text variant="headlineSmall" style={styles.modalTitle}>
              Cancel Ride
            </Text>
            <Text variant="bodyMedium" style={styles.modalText}>
              Are you sure you want to cancel this ride? This action cannot be undone.
            </Text>
            <View style={styles.modalButtons}>
              <Button 
                mode="outlined" 
                onPress={() => setShowCancelConfirmation(false)}
                style={styles.modalButton}
              >
                No, Keep Ride
              </Button>
              <Button 
                mode="contained"
                onPress={handleCancelConfirm}
                style={styles.modalButton}
                buttonColor="#FF5252"
              >
                Yes, Cancel
              </Button>
            </View>
          </Surface>
        </Modal>
      </Portal>

      <Portal>
        <Modal
          visible={showCompleteConfirmation}
          onDismiss={() => setShowCompleteConfirmation(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Surface style={styles.modalContent}>
            <Text variant="headlineSmall" style={styles.modalTitle}>
              Complete Ride
            </Text>
            <Text variant="bodyMedium" style={styles.modalText}>
              Are you sure you want to complete this ride? This action cannot be undone.
            </Text>
            <View style={styles.modalButtons}>
              <Button 
                mode="outlined" 
                onPress={() => setShowCompleteConfirmation(false)}
                style={styles.modalButton}
              >
                No, Keep Active
              </Button>
              <Button 
                mode="contained"
                onPress={handleCompleteRide}
                style={styles.modalButton}
                buttonColor="#4CAF50"
              >
                Yes, Complete
              </Button>
            </View>
          </Surface>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  title: {
    marginBottom: 24,
  },
  card: {
    padding: 16,
    borderRadius: 12,
  },
  section: {
    marginBottom: 24,
  },
  detail: {
    marginTop: 8,
    color: '#666',
  },
  cancelButton: {
    marginTop: 24,
  },
  errorText: {
    color: '#FF5252',
    marginBottom: 16,
  },
  seatsSection: {
    marginTop: 24,
    flex: 1,
  },
  seatsTitle: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  seatsList: {
    padding: 16,
  },
  seatCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
  },
  seatInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  passengerInfo: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 8,
  },
  passengerEmail: {
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
    marginTop: 8,
  },
  actionIcon: {
    padding: 4,
  },
  seatStatus: {
    color: '#4CAF50', // Green color for available status
  },
  rideDetails: {
    padding: 16,
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  arrow: {
    marginHorizontal: 8,
  },
  modalContainer: {
    padding: 20,
  },
  modalContent: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: 16,
  },
  modalText: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
  pendingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  passengerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  removeIcon: {
    padding: 4,
  },
  confirmButton: {
    marginBottom: 12,
    backgroundColor: '#2196F3',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});