import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { useAccessibility } from "../../AccessibleView/AccessibleView";
export default function LogoutScreen() {
  const { logout } = useAuth();
  const navigation = useNavigation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { highContrast } = useAccessibility();
  useEffect(() => {
    const showLogoutConfirmation = () => {
      Alert.alert(
        'Confirmation',
        'Are you sure, you want to log out?',
        [
          {
            text: 'Cancel',
            onPress: () => navigation.goBack(),
            style: 'cancel',
          },
          {
            text: 'Log out',
            onPress: () => {
              setIsLoggingOut(true);
              performLogout();
            },
          },
        ],
        { cancelable: false }
      );
    };

    const performLogout = async () => {
      try {
        await logout();
        // Możesz dodać tutaj nawigację do ekranu logowania jeśli to konieczne
      } catch (error) {
        console.error('Error during logging out:', error);
        setIsLoggingOut(false);
        Alert.alert('Error', 'Error during logging out');
        navigation.goBack();
      }
    };

    showLogoutConfirmation();

    return () => {
      // Czyszczenie w przypadku odmontowania komponentu
    };
  }, []);

  if (isLoggingOut) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: highContrast ?  "#454343":'#red' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Logging out...</Text>
      </View>
    );
  }

  return null; // Lub ekran ładowania jeśli potrzebny
}