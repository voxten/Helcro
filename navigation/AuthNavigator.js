import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import LoginScreen from '../components/screens/Auth/LoginScreen';
import RegisterScreen from '../components/screens/Auth/RegisterScreen';
import ForgotPasswordScreen from '../components/screens/Auth/ForgotPasswordScreen';
import Icon from "react-native-vector-icons/FontAwesome5";

const App = () => {
    const [currentScreen, setCurrentScreen] = useState('Login');

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
            {renderScreen()}
            <View style={styles.buttonContainer}>
                {currentScreen !== 'Login' && (
                    <TouchableOpacity style={styles.button} onPress={() => setCurrentScreen('Login')}>
                        <Icon name="sign-in-alt" size={16} color="white" style={styles.icon} />
                        <Text style={styles.buttonText}>Back to Login</Text>
                    </TouchableOpacity>
                )}
                {currentScreen !== 'Register' && (
                    <TouchableOpacity style={styles.button} onPress={() => setCurrentScreen('Register')}>
                        <Icon name="user-plus" size={16} color="white" style={styles.icon} />
                        <Text style={styles.buttonText}>Go to Register</Text>
                    </TouchableOpacity>
                )}
                {currentScreen !== 'ForgotPassword' && (
                    <TouchableOpacity style={styles.button} onPress={() => setCurrentScreen('ForgotPassword')}>
                        <Icon name="lock" size={16} color="white" style={styles.icon} />
                        <Text style={styles.buttonText}>Forgot Password?</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
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
