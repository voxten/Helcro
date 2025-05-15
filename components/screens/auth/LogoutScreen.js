import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text, Alert,StyleSheet, } from 'react-native';
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
      
      <View style={[styles.container, highContrast && styles.highContrastBackground]}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Logging out...</Text>
      </View>
    );
  }

  return null; // Lub ekran ładowania jeśli potrzebny
}
const styles = StyleSheet.create({
    highContrastBackground: {
        backgroundColor: '#2e2c2c', 
        color:'white',
    },
    secondContrast: {
        backgroundColor: "#454343",
        color:'white',
    },
    container:{
      flex: 1, 
      justifyContent: 'center',
      alignItems: 'center',
    }
  })