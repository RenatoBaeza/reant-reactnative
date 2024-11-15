import { StyleSheet } from 'react-native';
import { Surface, TextInput, Button } from 'react-native-paper';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { PlacesAutocompleteInput } from './PlacesAutocompleteInput';
import { DatePickerInput } from './DatePickerInput';
import { RouteInfo } from './RouteInfo';

interface PassengerFormData {
  origin: string;
  originPlaceId: string;
  originLocation: any;
  destination: string;
  destinationPlaceId: string;
  destinationLocation: any;
  date: Date;
  distance?: string;
  duration?: string;
  seats: number;
}

interface PassengerFormProps {
  form: PassengerFormData;
  onFormChange: (form: PassengerFormData) => void;
}

export function PassengerForm({ form, onFormChange }: PassengerFormProps) {
  return (
    <Animated.View 
      entering={FadeInUp.delay(200)}
      style={styles.formContainer}
    >
      <Surface style={styles.form}>
        <PlacesAutocompleteInput
          label="Origin"
          value={form.origin}
          onPlaceSelect={(data, details) => {
            onFormChange({
              ...form,
              origin: data.description,
              originPlaceId: details.place_id,
              originLocation: details.geometry.location,
            });
          }}
        />
        <PlacesAutocompleteInput
          label="Destination"
          value={form.destination}
          onPlaceSelect={(data, details) => {
            onFormChange({
              ...form,
              destination: data.description,
              destinationPlaceId: details.place_id,
              destinationLocation: details.geometry.location,
            });
          }}
        />
        
        {form.originLocation && form.destinationLocation && (
          <RouteInfo
            origin={form.originLocation}
            destination={form.destinationLocation}
            onRouteInfo={(distance, duration) => {
              onFormChange({
                ...form,
                distance,
                duration,
              });
            }}
          />
        )}

        <DatePickerInput
          label="Date"
          value={form.date}
          onChange={(date) => onFormChange({ ...form, date })}
          style={styles.input}
        />

        <TextInput
          mode="outlined"
          label="Requested Seats"
          value={form.seats}
          onChangeText={(text) => {
            // Only allow numbers 1-9
            const numericValue = text.replace(/[^1-9]/g, '');
            if (numericValue.length <= 1) {
              onFormChange({ ...form, seats: numericValue });
            }
          }}
          keyboardType="numeric"
          style={styles.input}
          placeholder="Enter number of seats (1-9)"
        />

        <Button mode="contained" style={styles.submitButton}>
          Search Rides
        </Button>
      </Surface>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    padding: 16,
  },
  form: {
    padding: 16,
    borderRadius: 12,
  },
  input: {
    marginBottom: 16,
  },
  submitButton: {
    marginTop: 8,
  },
});