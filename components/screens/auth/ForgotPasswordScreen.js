import React, { useState } from 'react';
import { View, Text, TextInput, Alert, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import api from '../../utils/api';
import mainStyles from "../../../styles/MainStyles";
import {API_BASE_URL} from '@env';
const ForgotPasswordScreen = ({ onBackPress, onRegisterPress }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
  
    setLoading(true);
    try {
      const response = await fetch(API_BASE_URL+'/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
  
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to send email');
  
      Alert.alert('Success', data.message);
      setEmailSent(true);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <View style={styles.successContainer}>
        <Icon name="check-circle" size={60} color="brown" />
        <Text style={styles.successText}>Password reset email sent!</Text>
        <Text style={styles.successSubtext}>Please check your inbox and follow the instructions.</Text>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: 'brown' }]} 
          onPress={onBackPress}
        >
          <Text style={styles.buttonText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.innerContainer}>
        <Icon name="lock-reset" size={50} color="brown" style={styles.lockIcon} />
        <Text style={styles.title}>Reset Your Password</Text>
        <Text style={styles.subtitle}>Enter your email to receive a reset link</Text>
        
        <TextInput
          style={mainStyles.input}
          placeholder="Email address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus={false}
        />

        <TouchableOpacity 
          style={styles.button} 
          onPress={handleResetPassword}
          disabled={loading}
        >
          <Icon name="email-send" size={25} color="white" style={styles.icon} />
          <Text style={styles.buttonText}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Text>
        </TouchableOpacity>

        <View style={styles.linksContainer}>
          <TouchableOpacity onPress={onBackPress}>
            <Text style={styles.linkText}>Remember your password? Sign in</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onRegisterPress}>
            <Text style={styles.linkText}>Don't have an account? Register now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  lockIcon: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
    color: '#666',
  },
  successText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  successSubtext: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
    color: '#666',
    paddingHorizontal: 20,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "brown",
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
  },
  icon: {
    marginRight: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  linksContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: 'black',
    fontSize: 14,
    marginVertical: 8,
    textDecorationLine: 'underline',
  },
});

export default ForgotPasswordScreen;