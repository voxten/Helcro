import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import Icon2 from "react-native-vector-icons/FontAwesome5";
import Icon3 from "react-native-vector-icons/AntDesign"
export default function MoreScreen({ navigation }) {
    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate("Profile")}
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
                onPress={() => navigation.navigate("Logout")}
            >
                <Icon3 name="logout" size={20} color="white" style={styles.icon} />
                <Text style={styles.buttonText}>Logout</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "flex-start",
        marginTop: 40, // Adjust the margin for top placement
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
