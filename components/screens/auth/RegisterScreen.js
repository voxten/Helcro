import React, { useState } from 'react';
import { View, Text, TextInput, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import api from '../../utils/api'; // Importujemy nasz nowy plik api
import Icon from "react-native-vector-icons/FontAwesome5";

const RegisterScreen = ({ onLoginPress, onRegisterSuccess }) => {
  const [form, setForm] = useState({
    UserName: '',
    Email: '',
    Password: '',
    PotwierdzPassword: '',
    Height: '',
    Weight: '',
    Gender: 'M'
  });

  const handleChange = (name, value) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleRegister = async () => {
    // Walidacja
    if (form.Password !== form.PotwierdzPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (!form.UserName || !form.Email || !form.Password) {
      Alert.alert('Error', 'Fill in all required fields');
      return;
    }

    try {
      const response = await api.post('/api/auth/register', {
        UserName: form.UserName,
        Email: form.Email,
        Password: form.Password,
        Height: form.Height ? parseFloat(form.Height) : null,
        Weight: form.Height ? parseFloat(form.Weight) : null,
        Gender: form.Gender
      });

      Alert.alert('Account has been successfully created');
      
    } catch (error) {
      console.error('Registration error:', error);
      let errorMessage = 'An error occurred during registration';
      
      if (error.response) {
        if (error.response.data.error.includes('Email')) {
          errorMessage = 'The provided email is already taken';
        } else if (error.response.data.error.includes('UserName')) {
          errorMessage = 'The provided username is already taken';
        }
      } else if (error.message.includes('Network Error')) {
        errorMessage = 'No connection to the server. Please check your internet connection.';
      }

      Alert.alert('Error', errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registration</Text>
      
      <TextInput
        style={styles.input}
        placeholder="User name *"
        value={form.UserName}
        onChangeText={(text) => handleChange('UserName', text)}
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Email *"
        value={form.Email}
        onChangeText={(text) => handleChange('Email', text)}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Password *"
        value={form.Password}
        onChangeText={(text) => handleChange('Password', text)}
        secureTextEntry
      />
      
      <TextInput
        style={styles.input}
        placeholder="Confirm password *"
        value={form.PotwierdzPassword}
        onChangeText={(text) => handleChange('PotwierdzPassword', text)}
        secureTextEntry
      />
      
      <TextInput
        style={styles.input}
        placeholder="Height (cm)"
        value={form.Height}
        onChangeText={(text) => handleChange('Height', text)}
        keyboardType="numeric"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Weight (kg)"
        value={form.Weight}
        onChangeText={(text) => handleChange('Weight', text)}
        keyboardType="numeric"
      />
      
      <View style={styles.radioGroup}>
        <Text style={styles.radioLabel}>Gender:</Text>
        {['M', 'W'].map((gender) => (
        <TouchableOpacity
          key={gender}
          style={[
            styles.radioButton,
            form.Gender === gender && styles.radioButtonSelected,
          ]}
          onPress={() => handleChange('Gender', gender)}
        >
          <Text style={styles.radioText}>
            {gender === 'M' ? 'Men' : 'Women'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Icon name="user-plus" size={20} color="white" style={styles.icon} />
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={onLoginPress}
        style={styles.secondaryButton}
      >
        <Text style={styles.secondaryButtonText}>Have an account? Log in</Text>
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
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  radioGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  radioLabel: {
    marginRight: 10,
    fontSize: 16,
  },
  radioButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginRight: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  radioButtonSelected: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196F3',
  },
  radioText: {
    fontSize: 16,
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

export default RegisterScreen;