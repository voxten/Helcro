import React, { useState } from 'react';
import { View, Button } from 'react-native';
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/Auth/ForgotPasswordScreen';

const App = () => {
    const [currentScreen, setCurrentScreen] = useState('Login'); // Domyślnie zaczynamy od ekranu logowania
  
    // Funkcja do renderowania odpowiedniego ekranu
    const renderScreen = () => {
      switch (currentScreen) {
        case 'Login':
          return <LoginScreen />;
        case 'Register':
          return <RegisterScreen />;
        case 'ForgotPassword':
          return <ForgotPasswordScreen />;
        default:
          return <LoginScreen />;
      }
    };
  
    return (
      <View style={{ flex: 1 }}>
        {renderScreen()} {/* Renderuje ekran w zależności od stanu */}
        
        {/* Przyciski do zmiany ekranu */}
        {currentScreen !== 'Login' && (
          <Button title="Back to Login" onPress={() => setCurrentScreen('Login')} />
        )}
        {currentScreen !== 'Register' && (
          <Button title="Go to Register" onPress={() => setCurrentScreen('Register')} />
        )}
        {currentScreen !== 'ForgotPassword' && (
          <Button title="Forgot Password?" onPress={() => setCurrentScreen('ForgotPassword')} />
        )}
      </View>
    );
  };
  
  export default App;