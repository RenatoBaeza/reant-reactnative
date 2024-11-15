import { StyleSheet, View, TextInput, FlatList, Pressable } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { useState, useCallback, useEffect } from 'react';
import debounce from 'lodash/debounce';

interface PlacesAutocompleteInputProps {
  label: string;
  value: string;
  onPlaceSelect: (place: {
    description: string;
    geometry: {
      location: {
        lat: number;
        lng: number;
      }
    }
  }) => void;
}

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/search';

export function PlacesAutocompleteInput({ 
  label, 
  value, 
  onPlaceSelect 
}: PlacesAutocompleteInputProps) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const searchPlaces = useCallback(
    debounce(async (searchQuery: string) => {
      if (searchQuery.length < 3) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          `${NOMINATIM_BASE_URL}?format=json&q=${encodeURIComponent(
            searchQuery
          )}&limit=5`,
          {
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'ReantApp/1.0'
            }
          }
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Received non-JSON response from server');
        }

        const data = await response.json();
        setResults(data);
      } catch (error) {
        console.error('Error searching places:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    searchPlaces(query);
  }, [query]);

  const handleSelect = (place: any) => {
    setQuery(place.display_name);
    setResults([]);
    onPlaceSelect({
      description: place.display_name,
      geometry: {
        location: {
          lat: parseFloat(place.lat),
          lng: parseFloat(place.lon)
        }
      }
    });
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder={label}
        value={query}
        onChangeText={setQuery}
      />
      
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" />
        </View>
      )}

      {results.length > 0 && (
        <FlatList
          data={results}
          style={styles.resultsList}
          keyExtractor={(item) => item.place_id}
          renderItem={({ item }) => (
            <Pressable
              style={styles.resultItem}
              onPress={() => handleSelect(item)}
            >
              <Text>{item.display_name}</Text>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    position: 'relative',
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderColor: '#86939e',
    borderRadius: 4,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  loadingContainer: {
    position: 'absolute',
    right: 12,
    top: 16,
  },
  resultsList: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 4,
    zIndex: 9999,
    elevation: 9999,
    maxHeight: 200,
  },
  resultItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});