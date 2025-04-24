import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import { MaterialCommunityIcons } from "@expo/vector-icons";

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
        <View style={styles.container}>
            <View style={styles.card}>
                <View style={styles.profileHeader}>
                    <View style={styles.avatarContainer}>
                        <Image
                            source={profilePic ? { uri: profilePic } : { uri: "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y" }}
                            style={styles.avatar}
                        />
                        <TouchableOpacity style={styles.editIcon}>
                            <MaterialCommunityIcons name="pencil" size={18} color="#fff" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.userName}>Welcome, {user.UserName}!</Text>
                </View>

                <View style={styles.actionsContainer}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.shadow]}
                        onPress={() => navigation.navigate("ChangePassword", { userId: user.UserId })}
                    >
                        <MaterialCommunityIcons name="lock-reset" size={22} color="#8D6E63" />
                        <Text style={styles.actionButtonText}>Change Password</Text>
                        <MaterialCommunityIcons name="chevron-right" size={22} color="#8D6E63" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, styles.shadow]}
                        onPress={handleUpdateProfile}
                    >
                        <MaterialCommunityIcons name="account-edit" size={22} color="#8D6E63" />
                        <Text style={styles.actionButtonText}>Update Profile</Text>
                        <MaterialCommunityIcons name="chevron-right" size={22} color="#8D6E63" />
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    <TouchableOpacity
                        style={[styles.deleteButton, styles.shadow]}
                        onPress={handleDeleteAccount}
                    >
                        <MaterialCommunityIcons name="account-remove" size={22} color="#fff" />
                        <Text style={styles.deleteButtonText}>Delete Account</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#EFEBE9',
        padding: 20,
        justifyContent: 'center',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        width: '100%',
        elevation: 8,
    },
    profileHeader: {
        alignItems: 'center',
        marginBottom: 32,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 24,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 3,
        borderColor: '#D7CCC8',
    },
    editIcon: {
        position: 'absolute',
        right: 0,
        bottom: 0,
        backgroundColor: 'brown',
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    userName: {
        fontSize: 22,
        fontWeight: '600',
        color: 'brown',
        textAlign: 'center',
    },
    actionsContainer: {
        width: '100%',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#EFEBE9',
    },
    shadow: {
        elevation: 4,
    },
    actionButtonText: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
        fontWeight: '500',
        color: 'brown',
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'brown',
        padding: 16,
        borderRadius: 12,
        marginTop: 16,
        justifyContent: 'center',
    },
    deleteButtonText: {
        marginLeft: 12,
        fontSize: 16,
        fontWeight: '500',
        color: '#fff',
    },
    divider: {
        height: 1,
        backgroundColor: '#D7CCC8',
        marginVertical: 16,
    },
});