import React, { useState } from 'react';
import {View, Text, TextInput, Button, Alert, StyleSheet, TouchableOpacity} from 'react-native';
import api from '../../utils/api';
import mainStyles from "../../../styles/MainStyles"
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const ForgotPasswordScreen = ({onBackPress, onRegisterPress}) => {
  const [email, setEmail] = useState('');

  const handleResetPassword = async () => {
    try {
      await api.post('/forgot-password', { email });
      Alert.alert('Success', 'A password reset link has been sent to your email.');
    } catch (error) {
      Alert.alert('Error', 'Failed to send the password reset link.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Password reset</Text>
      <TextInput
        style={mainStyles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TouchableOpacity style={styles.button} onPress={() => handleResetPassword()}>
        <Icon name="lock-reset" size={25} color="white" style={styles.icon} />
        <Text style={styles.buttonText}>Send reset link</Text>
      </TouchableOpacity>


      <TouchableOpacity onPress={onBackPress} style={styles.secondaryButton}>
        
          <Text style={styles.secondaryButtonTextt}>Back to Login</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={onRegisterPress}
          style={styles.secondaryButton}
        >
          <Text style={styles.secondaryButtonText}>Don't have an account? Register now!</Text>
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
    marginTop: 15,
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

export default ForgotPasswordScreen;