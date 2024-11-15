import { StyleSheet, View } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { useTheme } from 'react-native-paper';
import { useCallback, useRef } from 'react';

interface PlacesAutocompleteInputProps {
  label: string;
  value: string;
  onPlaceSelect: (data: any, details: any) => void;
}

export function PlacesAutocompleteInput({ 
  label, 
  value, 
  onPlaceSelect 
}: PlacesAutocompleteInputProps) {
  const theme = useTheme();
  const autoCompleteRef = useRef(null);

  const handlePlaceSelect = useCallback((data, details) => {
    onPlaceSelect(data, details);
  }, [onPlaceSelect]);

  return (
    <View style={styles.container}>
      <GooglePlacesAutocomplete
        ref={autoCompleteRef}
        placeholder={label}
        onPress={handlePlaceSelect}
        query={{
          key: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
          language: 'en',
        }}
        defaultValue={value}
        styles={{
          container: styles.autoCompleteContainer,
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
        nearbyPlacesAPI="GooglePlacesSearch"
        debounce={300}
        minLength={2}
        returnKeyType="search"
        listViewDisplayed="auto"
        textInputProps={{
          clearButtonMode: 'while-editing',
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    position: 'relative',
  },
  autoCompleteContainer: {
    flex: 0,
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
    zIndex: 9999,
    elevation: 9999,
  },
  row: {
    padding: 13,
    minHeight: 44,
  },
});