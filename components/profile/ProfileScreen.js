import React, { useState } from "react";
import {View, Text, Image, TouchableOpacity, Alert, StyleSheet} from "react-native";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import PasswordIcon from "react-native-vector-icons/MaterialCommunityIcons";

export default function ProfileScreen({ navigation }) {
    const [profilePic, setProfilePic] = useState(null);
    const { user, logout } = useAuth();

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
                                                logout();
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
        <View style={localStyles.container}>
            <View style={localStyles.profilePicContainer}>
                <Image
                    source={profilePic ? { uri: profilePic } : { uri: "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"}}
                    style={localStyles.profilePic}
                />
            </View>
            <Text style={localStyles.welcomeText}>
                Welcome, {String(user.UserName)}!
            </Text>

            <View style={localStyles.buttons}>
                <TouchableOpacity style={localStyles.closeButton} onPress={() => navigation.navigate("ChangePassword", { userId: user.UserId })}>
                    <View style={localStyles.buttonContent}>
                        <PasswordIcon name="form-textbox-password" size={20} color="white" />
                        <Text style={localStyles.closeButtonText}>Change Password</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity
                    style={localStyles.submitButton}
                    onPress={handleDeleteAccount}
                >
                    <View style={localStyles.buttonContent}>
                        <PasswordIcon name="account-off-outline" size={20} color="white" />
                        <Text style={localStyles.submitButtonText}>Delete Account</Text>
                    </View>
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={localStyles.updateButton} onPress={handleUpdateProfile}>
                <View style={localStyles.buttonContent}>
                    <PasswordIcon name="account-check-outline" size={20} color="white" />
                    <Text style={localStyles.updateButtonText}>Update Profile</Text>
                </View>
            </TouchableOpacity>
        </View>
    );
}

const localStyles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#eee",
        alignItems: "center",
    },
    title: {
        color: "white",
        fontSize: 24,
        marginBottom: 20,
    },
    profilePicContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        overflow: "hidden",
        marginBottom: 20,
    },
    profilePic: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
    welcomeText: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    input: {
        width: "100%",
        padding: 10,
        justifyContent: 'space-between',
        marginBottom: 15,
        backgroundColor: "#fff",
        borderRadius: 10,
        elevation: 3,
    },
    buttons: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
    },
    closeButton: {
        backgroundColor: "brown",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        flex: 1,
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    submitButton: {
        backgroundColor: "brown",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        flex: 1,
        marginLeft: 10,
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    buttonContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    closeButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    submitButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    updateButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: "bold",
        marginLeft: 8,
    },
    updateButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "brown",
        width: '100%',
        paddingVertical: 15,
        paddingHorizontal: 20,
        marginVertical: 15,
        borderRadius: 8,
    },
});