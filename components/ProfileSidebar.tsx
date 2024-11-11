import React from 'react'
import { StyleSheet, View } from 'react-native'
import { Drawer, Text, IconButton, useTheme } from 'react-native-paper'
import { Modal, Portal } from 'react-native-paper'
import { useAuth } from '@clerk/clerk-expo'

interface ProfileSidebarProps {
  visible: boolean
  onDismiss: () => void
  userName: string
}

export function ProfileSidebar({ visible, onDismiss, userName }: ProfileSidebarProps) {
  const theme = useTheme()

  const menuItems = [
    { icon: 'account', label: 'Account' },
    { icon: 'help-circle', label: 'Help' },
    { icon: 'clock-outline', label: 'Activity' },
    { icon: 'cog', label: 'Settings' },
    { icon: 'ticket-percent', label: 'Promotional Codes' },
    { icon: 'account-multiple-plus', label: 'Refer a Friend' },
  ]

  const { signOut } = useAuth()
  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modal}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text variant="headlineSmall" style={styles.userName}>
              {userName}'s Profile
            </Text>
            <IconButton
              icon="close"
              size={24}
              onPress={onDismiss}
            />
          </View>

          {/* Menu Items */}
          <View style={styles.menuContainer}>
            {menuItems.map((item, index) => (
              <Drawer.Item
                key={index}
                icon={item.icon}
                label={item.label}
                onPress={() => {}}
                style={styles.menuItem}
              />
            ))}
            
            {/* Logout Button */}
            <View style={styles.logoutContainer}>
              <Drawer.Item
                icon="logout"
                label="Log Out"
                onPress={() => handleSignOut()}
                style={[styles.menuItem, styles.logoutButton]}
              />
            </View>
          </View>
        </View>
      </Modal>
    </Portal>
  )
}

const styles = StyleSheet.create({
  modal: {
    backgroundColor: 'white',
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '80%',
    maxWidth: 400,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  userName: {
    flex: 1,
  },
  menuContainer: {
    paddingTop: 8,
  },
  menuItem: {
    paddingVertical: 4,
  },
  logoutContainer: {
    marginTop: 'auto',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  logoutButton: {
    paddingVertical: 8,
  },
})