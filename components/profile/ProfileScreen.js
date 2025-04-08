import React, { useState } from "react";
import { View, Text, TextInput, Image, TouchableOpacity, Alert } from "react-native";
import styles from "./styles/ProfileStyles";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

export default function ProfileScreen({ navigation }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [profilePic, setProfilePic] = useState(null);
    const { user, logout } = useAuth();
    const [currentPassword, setCurrentPassword] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const handleDeleteAccount = async () => {
        Alert.alert(
            "Confirm Deletion",
            "Are you sure you want to delete your account? This action cannot be undone.",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                { 
                    text: "Delete", 
                    onPress: async () => {
                        try {
                            const response = await api.post('/api/auth/request-account-deletion', {
                                email: user.Email
                            });
                            
                            if (response.data.success) {
                                Alert.alert(
                                    "Check Your Email",
                                    "We've sent you a confirmation email to complete the account deletion process.",
                                    [
                                        { 
                                            text: "OK", 
                                            onPress: () => {
                                                // Wylogowanie po kliknięciu OK
                                                logout();
                                                // Możesz też dodać nawigację do ekranu logowania jeśli potrzebujesz
                                                // navigation.navigate('Login');
                                            }
                                        }
                                    ]
                                );
                            }
                        } catch (error) {
                            Alert.alert(
                                "Error",
                                error.response?.data?.message || "Failed to initiate account deletion"
                            );
                        }
                    } 
                }
            ]
        );
    };
    
    
    const handleUpdateProfile = () => {
        // Implement update profile logic here
    };
    return (
        <View style={styles.container}>
            <View style={styles.profilePicContainer}>
                <Image
                    source={profilePic ? { uri: profilePic } : { uri: "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"}}
                    style={styles.profilePic}
                />
            </View>
            <Text style={styles.welcomeText}>
                Welcome, {String(user.UserName)}!
            </Text>

            
            <TouchableOpacity style={styles.submitButton} onPress={handleUpdateProfile}>
                <Text style={styles.submitButtonText}>Update Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={styles.submitButton}
                onPress={() => navigation.navigate("ChangePassword", { userId: user.UserId })}
                >
                <Text style={styles.submitButtonText}>Change Password</Text>
                </TouchableOpacity>
            
            <TouchableOpacity style={styles.submitButton} onPress={handleDeleteAccount}>
                <Text style={styles.submitButtonText}>Delete Account</Text>
            </TouchableOpacity>
        </View>
    );
}