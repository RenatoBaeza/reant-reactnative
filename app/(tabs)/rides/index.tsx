import { View, StyleSheet, SafeAreaView } from "react-native";
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
      <View style={styles.container}>
        <View style={styles.topContent}>
          <Text variant="headlineMedium" style={styles.title}>
            Where are you driving?
          </Text>
          <DriverForm 
            form={driverForm}
            onFormChange={setDriverForm}
          />
        </View>
        <View style={styles.listContainer}>
          <AwaitingRidesList />
        </View>
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
  topContent: {
    flexShrink: 0,
  },
  listContainer: {
    flex: 1,
  },
  title: {
    padding: 16,
    paddingBottom: 0,
  }
});
