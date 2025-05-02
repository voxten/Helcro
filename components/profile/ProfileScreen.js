import React, { useState, useEffect } from "react";
import { View, Text, Image, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from "react-native";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import axios from "axios";
import { API_BASE_URL } from '@env';

export default function ProfileScreen({ navigation }) {
    const [profilePic, setProfilePic] = useState(null);
    const [uploading, setUploading] = useState(false);
    const { user, logout, token, updateAvatar, login } = useAuth();

    useEffect(() => {
        const loadAvatar = async () => {
            try {
                if (user?.AvatarImage) {
                    setProfilePic(user.AvatarImage);
                }
            } catch (error) {
                console.error('Error loading avatar:', error);
            }
        }
        loadAvatar();
    }, [user?.AvatarImage]);

    const pickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission required', 'We need access to your photos to upload images');
                return;
            }

            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                await uploadAvatar(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    const uploadAvatar = async (uri) => {
        try {
            setUploading(true);

            // Create FormData
            const formData = new FormData();
            const fileExt = uri.split('.').pop();
            const fileType = uri.split('.').pop().toLowerCase() === 'png' ? 'image/png' : 'image/jpeg';

            formData.append('avatar', {
                uri: uri,
                type: fileType,
                name: `avatar-${user.UserId}-${Date.now()}.${fileExt}`
            });

            // Upload to server
            const response = await axios.post(`${API_BASE_URL}/api/upload/avatar`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                transformRequest: (data) => data,
            });

            if (response.data.success) {
                // Update user in database
                const updateResponse = await api.put(
                    `${API_BASE_URL}/api/users/${user.UserId}/avatar`,
                    {
                        avatarUrl: response.data.avatarUrl,
                        userId: user.UserId,
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );

                if (updateResponse.data.success) {
                    setProfilePic(response.data.avatarUrl);
                    await updateAvatar(response.data.avatarUrl);
                    Alert.alert('Success', 'Avatar updated successfully!');
                }
            }
        } catch (error) {
            console.error('Error uploading avatar:', error);
            Alert.alert('Error', 'Failed to upload avatar');
        } finally {
            setUploading(false);
        }
    };

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
        navigation.navigate("UpdateProfile");
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
                        <TouchableOpacity
                            style={styles.editIcon}
                            onPress={pickImage}
                            disabled={uploading}
                        >
                            {uploading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <MaterialCommunityIcons name="pencil" size={18} color="#fff" />
                            )}
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