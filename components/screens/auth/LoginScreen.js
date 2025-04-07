import React, { useState } from 'react';
import { View, Text, TextInput, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from "react-native-vector-icons/FontAwesome5";
import api from '../../utils/api';
import mainStyles from "../../../styles/MainStyles";
import { useAuth } from '../../context/AuthContext';

const LoginScreen = ({ onRegisterPress, onForgotPasswordPress, onLoginSuccess }) => {
  const { login } = useAuth();
  const [form, setForm] = useState({
    Email: '',
    Password: ''
  });
 
  const [loading, setLoading] = useState(false);

  const handleChange = (name, value) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async () => {
    try {
      const response = await api.post('/api/auth/login', {
        Email: form.Email,
        Password: form.Password
      });
  
      console.log('Server response:', response.data); // Debug
  
      // Przekaż wszystkie dane użytkownika otrzymane z backendu
      login(response.data.token, response.data.user); // Zmiana tutaj
      
      console.log('Full API response:', response.data);
      Alert.alert('Logged in successfully');
      
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
    <View style={styles.container}>
      <Text style={styles.title}>Logging in</Text>
      
      <TextInput
        style={mainStyles.input}
        placeholder="Email *"
        value={form.Email}
        onChangeText={(text) => handleChange('Email', text)}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        style={mainStyles.input}
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
        <Text style={styles.secondaryButtonText}>Dont have account? Register now!</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onForgotPasswordPress}
        style={styles.secondaryButton}
      >
        <Text style={styles.secondaryButtonText}>Forgot Password?</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
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