import React, { useState } from 'react';
import {View, Text, TextInput, Button, Alert, StyleSheet, TouchableOpacity} from 'react-native';
//import { signInWithGoogle } from '../../utils/googleSignIn';
import api from '../../utils/api';
//import { useAuth } from '../../context/AuthContext';
import mainStyles from "../../../styles/MainStyles"
import Icon from "react-native-vector-icons/FontAwesome5";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
 // const { handleGoogleLogin } = useGoogleAuth();
 // const { login } = useAuth();

  const handleLogin = async () => {
    try {
      const response = await api.post('/login', { email, password });
      login(response.data.token); // Zaloguj użytkownika
    } catch (error) {
      Alert.alert('Error', 'Invalid email or password');
    }
  };

 /*
 const onGoogleLogin = async () => {
    const accessToken = await handleGoogleLogin();
    if (accessToken) {
      // Wyślij token do backendu
      const response = await fetch('http://your-backend-url/api/auth/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken }),
      });
      const data = await response.json();
      console.log(data); // Zaloguj użytkownika
    }
  };
*/
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={mainStyles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={mainStyles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={() => handleLogin()}>
        <Icon name="key" size={20} color="white" style={styles.icon} />
        <Text style={styles.buttonText}>Log In</Text>
      </TouchableOpacity>
      {/*<Button title="Zaloguj się przez Google" onPress={onGoogleLogin} />*/}
      
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
});

export default LoginScreen;