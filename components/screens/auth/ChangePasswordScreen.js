import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import api from "../../utils/api";
import { useAccessibility } from "../../AccessibleView/AccessibleView";
const ChangePasswordScreen = () => {
    const { highContrast } = useAccessibility();
    const navigation = useNavigation();
    const route = useRoute();
    const userId = route.params?.userId;
    const [step, setStep] = useState("verify"); // "verify" or "change"
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!userId) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Error: Missing user information</Text>
                <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
                    <Text style={styles.buttonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const handleVerify = async () => {
        if (!currentPassword) {
            Alert.alert("Error", "Please enter your current password");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await api.post("/api/auth/verify-password", {
                userId,
                password: currentPassword,
            });

            if (res.data.success) {
                setStep("change");
                setCurrentPassword("");
            } else {
                Alert.alert("Error", "Incorrect current password");
            }
        } catch (error) {
            Alert.alert("Error", error.response?.data?.message || "Password verification failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChangePassword = async () => {
        if (!newPassword || !confirmPassword) {
            Alert.alert("Error", "Please fill all fields");
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert("Error", "Passwords don't match");
            return;
        }

        if (newPassword.length < 8) {
            Alert.alert("Error", "Password must be at least 8 characters");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await api.post("/api/auth/change-password", {
                userId,
                newPassword,
            });

            if (response.data.success) {
                Alert.alert("Success", "Password changed successfully", [
                    { text: "OK", onPress: () => navigation.goBack() },
                ]);
            }
        } catch (error) {
            Alert.alert("Error", error.response?.data?.message || "Failed to change password");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <View style={[styles.container, highContrast && styles.secondContrast]}>
            <Text style={[styles.title, highContrast && styles.secondContrast]}>
                {step === "verify" ? "Verify Your Password" : "Change Password"}
            </Text>

            {step === "verify" ? (
                <>
                    <TextInput
                        style={[
                            styles.input,
                            highContrast && styles.secondContrast,
                            { color: highContrast ? '#FFFFFF' : '#000000' } 
                        ]}
                        placeholderTextColor={highContrast ? '#FFFFFF' : '#999999'}
                        placeholder="Current Password"
                        secureTextEntry
                        value={currentPassword}
                        onChangeText={setCurrentPassword}
                        />

                    <TouchableOpacity
                        style={[styles.button, isSubmitting && styles.disabledButton]}
                        onPress={handleVerify}
                        disabled={isSubmitting}
                    >
                        <Text style={styles.buttonText}>
                            {isSubmitting ? "Verifying..." : "Continue"}
                        </Text>
                    </TouchableOpacity>
                </>
            ) : (
                <>
                    <TextInput
                        style={[
                            styles.input,
                            highContrast && styles.secondContrast,
                            { color: highContrast ? '#FFFFFF' : '#000000' } // dynamiczny kolor tekstu
                        ]}
                        placeholderTextColor={highContrast ? '#FFFFFF' : '#999999'}
                        placeholder="New Password"
                        secureTextEntry
                        value={newPassword}
                        onChangeText={setNewPassword}
                        />
                    <TextInput
                        style={[
                            styles.input,
                            highContrast && styles.secondContrast,
                            { color: highContrast ? '#FFFFFF' : '#000000' } // dynamiczny kolor tekstu
                        ]}
                        placeholderTextColor={highContrast ? '#FFFFFF' : '#999999'}
                        placeholder="Confirm New Password"
                        secureTextEntry
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        />
                    <TouchableOpacity
                        style={[styles.button, isSubmitting && styles.disabledButton]}
                        onPress={handleChangePassword}
                        disabled={isSubmitting}
                    >
                        <Text style={styles.buttonText}>
                            {isSubmitting ? "Changing..." : "Change Password"}
                        </Text>
                    </TouchableOpacity>
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    highContrastBackground: {
        backgroundColor: '#2e2c2c', 
        color:'white',
    },
    secondContrast: {
        backgroundColor: "#454343",
        color:'white',
    },
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#fff",
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
        textAlign: "center",
    },
    input: {
        height: 50,
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 15,
        marginBottom: 15,
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
    disabledButton: {
        backgroundColor: "#cccccc",
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    errorText: {
        color: "red",
        fontSize: 18,
        textAlign: "center",
        marginBottom: 20,
    },
});

export default ChangePasswordScreen;
