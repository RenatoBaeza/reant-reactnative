import { Drawer, List, Text } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';

interface ProfileSidebarProps {
  visible: boolean;
  onDismiss: () => void;
  userName: string;
}

export const ProfileSidebar = ({ visible, onDismiss, userName }: ProfileSidebarProps) => {
  return (
    <Drawer
      visible={visible}
      onDismiss={onDismiss}
      style={styles.drawer}
    >
      <View style={styles.container}>
        <Text variant="headlineMedium" style={styles.userName}>{userName}</Text>
        
        <List.Section>
          <List.Item
            title="Account"
            left={props => <MaterialCommunityIcons name="account" size={24} />}
            onPress={() => {}}
          />
          {/* ... rest of the List.Items ... */}
        </List.Section>
      </View>
    </Drawer>
  );
};

const styles = StyleSheet.create({
  drawer: {
    width: '80%',
    alignSelf: 'flex-end',
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: 20,
  },
  userName: {
    paddingHorizontal: 16,
    marginBottom: 8,
  }
}); 