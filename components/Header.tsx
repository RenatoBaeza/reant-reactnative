import { View, StyleSheet } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface HeaderProps {
  userName?: string | null;
  onProfilePress: () => void;
}

export function Header({ userName, onProfilePress }: HeaderProps) {
  return (
    <Animated.View entering={FadeInDown} style={styles.header}>
      <View style={styles.headerContent}>
        <View>
          <Text variant="titleMedium">Good Morning</Text>
          <Text variant="titleLarge">{userName}</Text>
        </View>
        <IconButton
          icon="account-circle"
          size={40}
          onPress={onProfilePress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={{ padding: 8 }}
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});