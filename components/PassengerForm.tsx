import { StyleSheet } from 'react-native';
import { Surface, TextInput, Button } from 'react-native-paper';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { PlacesAutocompleteInput } from './PlacesAutocompleteInput';

interface PassengerFormData {
  origin: string;
  originPlaceId: string;
  originLocation: any;
  destination: string;
  destinationPlaceId: string;
  destinationLocation: any;
  date: string;
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
        <TextInput
          mode="outlined"
          label="Date"
          value={form.date}
          onChangeText={(text) => onFormChange({ ...form, date: text })}
          style={styles.input}
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