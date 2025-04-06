import React, { useState } from 'react';
import { View, Text, TextInput, Alert, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import api from '../../utils/api';
import mainStyles from "../../../styles/MainStyles";
import { useRoute } from '@react-navigation/native';
import {API_BASE_URL} from '@env';
const ResetPasswordScreen = ({ navigation }) => {
  const route = useRoute();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const token = route.params?.token;

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
  
    setLoading(true);
    try {
      const response = await fetch(API_BASE_URL+'/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token: route.params.token,
          newPassword 
        })
      });
  
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to reset password');
  
      Alert.alert('Success', data.message);
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.innerContainer}>
        <Icon name="lock-reset" size={50} color="brown" style={styles.lockIcon} />
        <Text style={styles.title}>Set New Password</Text>
        
        <TextInput
          style={mainStyles.input}
          placeholder="New Password"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          autoCapitalize="none"
        />

        <TextInput
          style={mainStyles.input}
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          autoCapitalize="none"
        />

        <TouchableOpacity 
          style={[styles.button, { backgroundColor: 'green' }]} 
          onPress={handlePasswordReset}
          disabled={loading}
        >
          <Icon name="key-change" size={25} color="white" style={styles.icon} />
          <Text style={styles.buttonText}>
            {loading ? 'Processing...' : 'Reset Password'}
          </Text>
        </TouchableOpacity>
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
  lockIcon: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
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
});

export default ResetPasswordScreen;