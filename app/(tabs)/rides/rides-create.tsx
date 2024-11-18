import { View, StyleSheet, SafeAreaView } from "react-native";
import { Text, IconButton } from "react-native-paper";
import { DriverForm } from "../../../components/DriverForm";
import { useState } from "react";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from '@expo/vector-icons';

const initialFormState = {
  origin: '',
  destination: '',
  date: new Date(),
  time: '',
  vehicleId: '',
  seats: '',
  distance: '',
  duration: '',
};

export default function RidesCreate() {
  const router = useRouter();
  const [driverForm, setDriverForm] = useState(initialFormState);

  const handleFormChange = (newForm) => {
    setDriverForm(newForm);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <IconButton
            icon={() => (
              <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
            )}
            onPress={() => router.back()}
            style={styles.backButton}
          />
          <Text variant="headlineMedium" style={styles.title}>
            Where are you driving?
          </Text>
        </View>
        <DriverForm 
          form={driverForm}
          onFormChange={handleFormChange}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 16,
  },
  backButton: {
    marginRight: 8,
  },
  title: {
    flex: 1,
  }
});