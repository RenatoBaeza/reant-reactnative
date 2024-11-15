import { View, StyleSheet, SafeAreaView, ScrollView } from "react-native";
import { Text } from "react-native-paper";
import { DriverForm } from "../../../components/DriverForm";
import { AwaitingRidesList } from "../../../components/AwaitingRidesList";
import { useState } from "react";

export default function Rides() {
  const [driverForm, setDriverForm] = useState({
    origin: '',
    originPlaceId: '',
    originLocation: null,
    destination: '',
    destinationPlaceId: '',
    destinationLocation: null,
    date: new Date(),
    time: '',
    vehicleId: '',
    seats: null,
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <Text variant="headlineMedium" style={styles.title}>
          Where are you driving?
        </Text>
        <DriverForm 
          form={driverForm}
          onFormChange={setDriverForm}
        />
        <AwaitingRidesList />
      </ScrollView>
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
  title: {
    padding: 16,
    paddingBottom: 0,
  }
});
