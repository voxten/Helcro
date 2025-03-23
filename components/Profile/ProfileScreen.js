import React, { useState } from "react";
import {View, Text, TextInput, Image, TouchableOpacity} from "react-native";
import styles from "./styles/ProfileStyles"

export default function ProfileScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [profilePic, setProfilePic] = useState(null); // Placeholder for profile picture

    const handleDeleteAccount = () => {
        // Implement delete account logic here
        console.log("Account deleted");
    };

    const handleUpdateProfile = () => {
        // Implement update profile logic here
        console.log("Profile updated");
    };

    return (
        <View style={styles.container}>
            <View style={styles.profilePicContainer}>
                <Image
                    source={profilePic ? { uri: profilePic } : { uri: "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"}}
                    style={styles.profilePic}
                />
            </View>
            <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
            />
            <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="Enter your password"
            />
            <TouchableOpacity style={styles.submitButton} onPress={() => handleUpdateProfile()}>
                <Text style={ styles.submitButtonText }>Update Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitButton} onPress={() => handleDeleteAccount()}>
                <Text style={ styles.submitButtonText }>Delete Account</Text>
            </TouchableOpacity>
        </View>
    );
}