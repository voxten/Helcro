import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import LoginScreen from '../components/screens/auth/LoginScreen';
import RegisterScreen from '../components/screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../components/screens/auth/ForgotPasswordScreen';
import Icon from "react-native-vector-icons/FontAwesome5";

const App = () => {
    const [currentScreen, setCurrentScreen] = useState('Login');

    const renderScreen = () => {
        switch(currentScreen) {
            case 'register':
                return (
                    <RegisterScreen 
                      onLoginPress={() => setCurrentScreen('login')}
                      onRegisterSuccess={() => {
                        Alert.alert('Success', 'Registration successful! You can now log in');
                        setCurrentScreen('login');
                      }}
                    />
                  );
                  case 'forgotPassword':
                    return (
                      <ForgotPasswordScreen 
                        onBackPress={() => setCurrentScreen('login')}
                        onRegisterPress={() => setCurrentScreen('register')}
                      />
                    );
                    default:
              return (
                <LoginScreen 
                  onRegisterPress={() => setCurrentScreen('register')}
                  onForgotPasswordPress={() => setCurrentScreen('forgotPassword')}
                  onLoginSuccess={() => console.log('Login successful')}
                />
              );
        }
    };

    return renderScreen();
};

const styles = StyleSheet.create({
    buttonContainer: {
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'brown',
        paddingVertical: 10,
        marginVertical: 6,
        borderRadius: 6,
        width: '100%',
    },
    icon: {
        marginRight: 8,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default App;
