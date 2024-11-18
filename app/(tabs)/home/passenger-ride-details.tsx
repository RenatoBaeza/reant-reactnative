import { View, StyleSheet, Platform } from 'react-native';
import { Text, Surface, Button, Portal, Modal, TextInput } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-expo';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { FlatList } from 'react-native';

const API_URL_GET = Platform.select({
  android: 'http://10.0.2.2:8000/rides/get-ride-detail-passenger',
  ios: 'http://localhost:8000/rides/get-ride-detail-passenger',
  default: 'http://localhost:8000/rides/get-ride-detail-passenger',
});

const API_URL_PUT = Platform.select({
  android: 'http://10.0.2.2:8000/rides/reserve-seats',
  ios: 'http://localhost:8000/rides/reserve-seats',
  default: 'http://localhost:8000/rides/reserve-seats',
});

const API_URL_CANCEL = Platform.select({
  android: 'http://10.0.2.2:8000/rides/cancel-seat-reservation',
  ios: 'http://localhost:8000/rides/cancel-seat-reservation',
  default: 'http://localhost:8000/rides/cancel-seat-reservation',
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
  vehicle_details?: {
    car_brand: string;
    car_model: string;
    car_year: string;
    car_color: string;
    car_license_plate: string;
  };
}

export default function PassengerRideDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useUser();
  const [ride, setRide] = useState<RideDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState<number | null>(null);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);

  useEffect(() => {
    fetchRideDetails();
  }, [id]);

  const fetchRideDetails = async () => {
    try {
      const response = await fetch(`${API_URL_GET}/${id}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch ride details: ${errorText}`);
      }

      const data = await response.json();
      setRide(data.data);
    } catch (err) {
      console.error('Error fetching ride details:', err);
      setError(err instanceof Error ? err.message : 'Failed to load ride details');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestConfirm = async () => {
    try {
      const userEmail = user?.emailAddresses[0].emailAddress;
      if (!userEmail) {
        throw new Error('User email is required');
      }

      const response = await fetch(`${API_URL_PUT}/${id}?seats_requested=${selectedSeats}`, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'passenger-email': userEmail,
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to reserve seats');
      }

      if (data.status === 'ok') {
        await fetchRideDetails();
        setShowConfirmation(false);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Error requesting seats:', err);
      setError(err instanceof Error ? err.message : 'Failed to request seats');
    } finally {
      setShowConfirmation(false);
    }
  };

  const handleCancelReservation = async () => {
    try {
      const userEmail = user?.emailAddresses[0].emailAddress;
      if (!userEmail) {
        throw new Error('User email is required');
      }

      const response = await fetch(`${API_URL_CANCEL}/${ride.ride_id}`, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'passenger-email': userEmail,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to cancel reservation');
      }

      const data = await response.json();
      if (data.status === 'ok') {
        await fetchRideDetails();
        setShowCancelConfirmation(false);
        router.replace('/home');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Error canceling reservation:', err);
      setError(err instanceof Error ? err.message : 'Failed to cancel reservation');
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

    const getStatusText = (status: string, passengerEmail: string | null) => {
      const isCurrentUser = passengerEmail === user?.emailAddresses[0].emailAddress;
      
      switch (status) {
        case 'free':
          return 'Available';
        case 'taken':
          return isCurrentUser ? 'Taken (By you)' : 'Taken';
        case 'pending':
          return isCurrentUser ? 'Pending (By you)' : 'Pending';
        default:
          return 'Unknown';
      }
    };

    return (
      <Surface style={styles.seatCard} elevation={1}>
        <Text variant="bodyLarge">Seat {item.seat_number}</Text>
        <Text 
          variant="bodyMedium" 
          style={[styles.seatStatus, { color: getStatusColor(item.seat_status) }]}
        >
          {getStatusText(item.seat_status, item.passenger_email)}
        </Text>
      </Surface>
    );
  };

  const SeatSelector = () => (
    <TextInput
      mode="outlined"
      label="Number of Seats"
      value={selectedSeats ? selectedSeats.toString() : ''}
      onChangeText={(text) => {
        if (text === '') {
          setSelectedSeats(null);
          return;
        }
        
        const numericValue = text.replace(/[^1-9]/g, '');
        if (numericValue.length <= 1) {
          const newValue = parseInt(numericValue);
          if (!isNaN(newValue)) {
            setSelectedSeats(newValue);
          }
        }
      }}
      keyboardType="numeric"
      style={styles.seatSelector}
      placeholder="Enter number of seats (1-9)"
    />
  );

  const hasUserRequestedSeats = (seatsDetails: SeatsDetails, userEmail: string): boolean => {
    return Object.values(seatsDetails).some(
      seat => seat.passenger_email === userEmail && 
      (seat.seat_status === 'pending' || seat.seat_status === 'taken')
    );
  };

  if (loading || !ride) {
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
        <Text>Loading ride details...</Text>
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

      {hasUserRequestedSeats(ride.seats_details, user?.emailAddresses[0].emailAddress || '') ? (
        <Button 
          mode="contained"
          onPress={() => setShowCancelConfirmation(true)}
          style={styles.cancelButton}
          buttonColor="#FF5252"
        >
          Cancel Seat Request
        </Button>
      ) : (
        <>
          <Surface style={styles.card} elevation={2}>
            <SeatSelector />
          </Surface>

          <Button 
            mode="contained" 
            onPress={() => setShowConfirmation(true)}
            style={styles.requestButton}
          >
            Request Seat
          </Button>
        </>
      )}

      <Portal>
        <Modal
          visible={showConfirmation}
          onDismiss={() => setShowConfirmation(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Surface style={styles.modalContent}>
            <Text variant="headlineSmall" style={styles.modalTitle}>
              Request Seat
            </Text>
            <Text variant="bodyMedium" style={styles.modalText}>
              {selectedSeats 
                ? `Are you sure you want to request ${selectedSeats} seat${selectedSeats > 1 ? 's' : ''} for this ride?`
                : 'Please select the number of seats you want to request.'}
              {selectedSeats && ride.available_seats < selectedSeats && 
                "\nWarning: Not enough seats available!"}
            </Text>
            <View style={styles.modalButtons}>
              <Button 
                mode="outlined" 
                onPress={() => setShowConfirmation(false)}
                style={styles.modalButton}
              >
                Cancel
              </Button>
              <Button 
                mode="contained"
                onPress={handleRequestConfirm}
                style={styles.modalButton}
              >
                Confirm
              </Button>
            </View>
          </Surface>
        </Modal>
      </Portal>

      <Portal>
        <Modal
          visible={showCancelConfirmation}
          onDismiss={() => setShowCancelConfirmation(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Surface style={styles.modalContent}>
            <Text variant="headlineSmall" style={styles.modalTitle}>
              Cancel Seat Request
            </Text>
            <Text variant="bodyMedium" style={styles.modalText}>
              Are you sure you want to cancel your seat request? This action cannot be undone.
            </Text>
            <View style={styles.modalButtons}>
              <Button 
                mode="outlined" 
                onPress={() => setShowCancelConfirmation(false)}
                style={styles.modalButton}
              >
                No, Keep Request
              </Button>
              <Button 
                mode="contained"
                onPress={handleCancelReservation}
                style={styles.modalButton}
                buttonColor="#FF5252"
              >
                Yes, Cancel
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
  requestButton: {
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
  },
  seatsList: {
    padding: 16,
  },
  seatCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  seatStatus: {
    color: '#4CAF50',
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
  seatSelector: {
    marginTop: 24,
  },
  cancelButton: {
    marginTop: 24,
    backgroundColor: '#FF5252',
  },
});