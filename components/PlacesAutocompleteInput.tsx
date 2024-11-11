import { StyleSheet } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { useTheme } from 'react-native-paper';

interface PlacesAutocompleteInputProps {
  label: string;
  value: string;
  onPlaceSelect: (data: any, details: any) => void;
}

export function PlacesAutocompleteInput({ label, value, onPlaceSelect }: PlacesAutocompleteInputProps) {
  const theme = useTheme();

  return (
    <GooglePlacesAutocomplete
      placeholder={label}
      onPress={onPlaceSelect}
      query={{
        key: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
        language: 'en',
      }}
      styles={{
        container: styles.container,
        textInput: {
          ...styles.textInput,
          backgroundColor: theme.colors.background,
          color: theme.colors.onBackground,
        },
        listView: styles.listView,
        row: styles.row,
      }}
      enablePoweredByContainer={false}
      fetchDetails={true}
      textInputProps={{
        value: value,
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 0,
    marginBottom: 16,
  },
  textInput: {
    height: 56,
    borderWidth: 1,
    borderColor: '#86939e',
    borderRadius: 4,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  listView: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 4,
    zIndex: 1000,
    elevation: 3,
  },
  row: {
    padding: 13,
    minHeight: 44,
  },
});