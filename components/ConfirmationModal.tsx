import { StyleSheet, View } from 'react-native';
import { Modal, Portal, Text, Button, Surface } from 'react-native-paper';
import { format } from 'date-fns';

interface ConfirmationModalProps {
  visible: boolean;
  onDismiss: () => void;
  onConfirm: () => void;
  form: {
    origin: string;
    destination: string;
    date: Date;
    time: string;
    seats: string;
    distance?: string;
    duration?: string;
  };
}

export function ConfirmationModal({ visible, onDismiss, onConfirm, form }: ConfirmationModalProps) {
  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.container}
      >
        <Surface style={styles.content}>
          <Text variant="headlineSmall" style={styles.title}>Confirm Your Ride</Text>
          
          <View style={styles.details}>
            <View style={styles.detailRow}>
              <Text variant="bodyMedium" style={styles.label}>From:</Text>
              <Text variant="bodyMedium" style={styles.value}>{form.origin}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text variant="bodyMedium" style={styles.label}>To:</Text>
              <Text variant="bodyMedium" style={styles.value}>{form.destination}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text variant="bodyMedium" style={styles.label}>Date:</Text>
              <Text variant="bodyMedium" style={styles.value}>
                {format(form.date, 'MMM dd, yyyy')}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text variant="bodyMedium" style={styles.label}>Time:</Text>
              <Text variant="bodyMedium" style={styles.value}>{form.time}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text variant="bodyMedium" style={styles.label}>Seats:</Text>
              <Text variant="bodyMedium" style={styles.value}>{form.seats}</Text>
            </View>

            {form.distance && form.duration && (
              <View style={styles.routeInfo}>
                <Text variant="bodyMedium" style={styles.routeText}>
                  {form.distance} • {form.duration} drive
                </Text>
              </View>
            )}
          </View>

          <View style={styles.buttons}>
            <Button 
              mode="outlined" 
              onPress={onDismiss} 
              style={styles.button}
            >
              Cancel
            </Button>
            <Button 
              mode="contained" 
              onPress={onConfirm}
              style={styles.button}
            >
              Confirm
            </Button>
          </View>
        </Surface>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  content: {
    padding: 20,
    borderRadius: 12,
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
  },
  details: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  label: {
    width: 60,
    color: '#666',
  },
  value: {
    flex: 1,
  },
  routeInfo: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  routeText: {
    textAlign: 'center',
    color: '#666',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 24,
  },
  button: {
    flex: 1,
  },
});