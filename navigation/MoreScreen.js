import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import Icon2 from "react-native-vector-icons/FontAwesome5";
import Icon3 from "react-native-vector-icons/AntDesign"
import Icon4 from "react-native-vector-icons/MaterialIcons";
import Icon5 from "react-native-vector-icons/Feather";
import { useAccessibility } from "../components/AccessibleView/AccessibleView";

export default function MoreScreen({ navigation }) {
    const { highContrast } = useAccessibility();
    return (
        <View style={[styles.container, highContrast && styles.highContrastBackground]}>
            <View style={[styles.secondContainer, highContrast && styles.highContrastBackground]}>
            <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate("User Profile")}
            >
                <Icon name="user" size={20} color="white" style={styles.icon} />
                <Text style={styles.buttonText}>Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate("Dietary Goals")}
            >
                <Icon name="bullseye" size={20} color="white" style={styles.icon} />
                <Text style={styles.buttonText}>Dietary Goals</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate("Weight History")}
            >
                <Icon name="history" size={20} color="white" style={styles.icon} />
                <Text style={styles.buttonText}>Weight History</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate("Export Data")}
            >
                <Icon name="download" size={20} color="white" style={styles.icon} />
                <Text style={styles.buttonText}>Export Data</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate("About Us")}
            >
                <Icon4 name="info" size={20} color="white" style={styles.icon} />
                <Text style={styles.buttonText}>About Us</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate("Help")}
            >
                <Icon5 name="help-circle" size={20} color="white" style={styles.icon} />
                <Text style={styles.buttonText}>Help</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate("Logout")}
            >
                <Icon3 name="logout" size={20} color="white" style={styles.icon} />
                <Text style={styles.buttonText}>Logout</Text>
            </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    secondContainer:{
        marginTop:40,
    },
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
        justifyContent: "flex-start", // Adjust the margin for top placement
        paddingHorizontal: 20,
        backgroundColor: "#f4f4f4",
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
    icon: {
        marginRight: 10,
    },
    buttonText: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
    },
});
