import React, { useState } from 'react';
import { View, Text, TextInput, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from "react-native-vector-icons/FontAwesome5";
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useEffect } from 'react';
import { useAccessibility } from "../../AccessibleView/AccessibleView";

WebBrowser.maybeCompleteAuthSession();

const LoginScreen = ({ onRegisterPress, onForgotPasswordPress, onLoginSuccess }) => {
  const { highContrast } = useAccessibility();
  const { login } = useAuth();
  const [form, setForm] = useState({
    Email: '',
    Password: ''
  });
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: '898455262269-6pa32s4us16i06cjlfk3dp2dhhlvooe3.apps.googleusercontent.com', // WŁAŚCIWY dla Expo Go
    androidClientId: '898455262269-6pa32s4us16i06cjlfk3dp2dhhlvooe3.apps.googleusercontent.com',
    scopes: ['profile', 'email'],
    extraParams: {
      prompt: 'select_account'
    }
  });
  
  const [loading, setLoading] = useState(false);

  
  useEffect(() => {
    const handleGoogleResponse = async () => {
      if (response?.type === 'success') {
        setLoading(true);
        try {
          const accessToken = response.authentication.accessToken;
          
          const userInfoResponse = await fetch('https://www.googleapis.com/userinfo/v2/me', {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          
          const userInfo = await userInfoResponse.json();
          const res = await api.post('/api/auth/google-login', {
            googleId: userInfo.id,
            email: userInfo.email,
            name: userInfo.name,
          });

          if (res.data.token) {
            login(res.data.token, res.data.user);
            
            if (!res.data.hasProfileData) {
              navigation.navigate('CompleteProfile', {
                userId: res.data.user.UserId,
                email: userInfo.email,
              });
            } else {
              onLoginSuccess?.();
            }
          }
        } catch (error) {
          console.error('Google login error:', error);
          Alert.alert('Error', 'Failed to login with Google');
        } finally {
          setLoading(false);
        }
      }
      
      if (response?.type === 'error') {
        Alert.alert(
          'Authentication error',
          response.error?.message || 'Something went wrong'
        );
      }
    };

    handleGoogleResponse();
  }, [response]);

  
  const handleChange = (name, value) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async () => {
    try {
      const response = await api.post('/api/auth/login', {
        Email: form.Email,
        Password: form.Password
      });

      // Przekaż wszystkie dane użytkownika otrzymane z backendu
      login(response.data.token, response.data.user); // Zmiana tutaj
      
      // Wywołaj callback po udanym logowaniu
      onLoginSuccess?.();
    } catch (error) {
      console.error('Login error:', error.response?.data);
      
      let errorMessage = 'Invalid email or password';
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = 'Invalid login data';
        } else if (error.response.status === 500) {
          errorMessage = 'Server error';
        }
      } else if (error.message.includes('Network Error')) {
        errorMessage = 'No connection to the server';
      }
  
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, highContrast && styles.highContrastBackground]}>
      <Text style={[styles.title, highContrast && styles.highContrastBackground]}>Logging in</Text>
      
      <TextInput
        style={[styles.input, highContrast && styles.secondContrast]}
        placeholderTextColor={highContrast ? '#FFFFFF' : '#999999'}
        placeholder="Email *"
        value={form.Email}
        onChangeText={(text) => handleChange('Email', text)}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
     <TextInput
        style={[
          styles.input,
          highContrast && styles.secondContrast,
          { color: highContrast ? '#FFFFFF' : '#000000' }  // dynamicznie ustawiamy kolor tekstu
        ]}
        placeholderTextColor={highContrast ? '#FFFFFF' : '#999999'}
        placeholder="Password *"
        value={form.Password}
        onChangeText={(text) => handleChange('Password', text)}
        secureTextEntry
      />


      <TouchableOpacity 
        style={styles.button} 
        onPress={handleLogin}
        disabled={loading}
      >
        <Icon name="key" size={20} color="white" style={styles.icon} />
        <Text style={styles.buttonText}>
          {loading ? 'Logging...' : 'Log in'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onRegisterPress}
        style={styles.secondaryButton}
      >
        <Text style={[styles.secondaryButtonText, highContrast && styles.highContrastBackground]}>Dont have account? Register now!</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onForgotPasswordPress}
        style={styles.secondaryButton}
      >
        <Text style={[styles.secondaryButtonText, highContrast && styles.highContrastBackground]}>Forgot Password?</Text>
      </TouchableOpacity>
      {/* TODO: Google Sign In
      <TouchableOpacity 
        onPress={() => promptAsync()}
        style={styles.googleButton}
        disabled={!request || loading}
      >
        <Icon name="google" size={20} color="white" />
        <Text style={styles.googleButtonText}>
          {loading ? 'Processing...' : 'Sign in with Google'}
        </Text>
      </TouchableOpacity>
      */}
    </View>
  );
};

const styles = StyleSheet.create({
  highContrastBackground: {
       backgroundColor: '#2e2c2c', 
        color:'white',
    },secondContrast: {
        backgroundColor: "#454343",
        color:'white',
    },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DB4437', // Kolor Google
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  googleButtonText: {
    color: 'white',
    marginLeft: 10,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 3,
    marginBottom: 10,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "brown",
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 15,
    borderRadius: 8,
  },
  icon: {
    marginRight: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
   secondaryButton: {
    padding: 10,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 14,
    marginTop: 10,
  },
});

export default LoginScreen;