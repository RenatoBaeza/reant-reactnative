import { StyleSheet } from 'react-native';
import { Surface, TextInput, Button } from 'react-native-paper';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { DatePickerInput } from './DatePickerInput';
import { RouteInfo } from './RouteInfo';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';

interface PassengerFormData {
  origin: string;
  destination: string;
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
  const router = useRouter();

  return (
    <Animated.View 
      entering={FadeInUp.delay(200)}
      style={styles.formContainer}
    >
      <Surface style={styles.form}>
        <TextInput
          mode="outlined"
          label="Origin"
          value={form.origin}
          onChangeText={(text) => {
            onFormChange({
              ...form,
              origin: text,
            });
          }}
          style={styles.input}
        />
        <TextInput
          mode="outlined"
          label="Destination"
          value={form.destination}
          onChangeText={(text) => {
            onFormChange({
              ...form,
              destination: text,
            });
          }}
          style={styles.input}
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

        <Button 
          mode="contained" 
          style={styles.submitButton}
          onPress={() => {
            const searchDate = format(form.date, 'yyyy-MM-dd');
            router.push({
              pathname: '/home/rides-available',
              params: {
                origin: form.origin,
                destination: form.destination,
                date: searchDate,
                seats: form.seats || 1,
              }
            });
          }}
        >
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