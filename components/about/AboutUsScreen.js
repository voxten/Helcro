import React from "react";
import { View, Text, ScrollView, StyleSheet, Linking, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import Icon2 from "react-native-vector-icons/FontAwesome5";
import { useAccessibility } from "../AccessibleView/AccessibleView";
export default function AboutUsScreen() {
    const { highContrast } = useAccessibility();

    const handleContactPress = () => {
        Linking.openURL("mailto:helcro.app@gmail.com");
    };

    const teamMembers = [
        { name: "Jakub Lepiesza", role: "Lead Developer", icon: "code" },
        { name: "Daniel Kapłański", role: "Developer", icon: "code" },
        { name: "Bartek Maciejewski", role: "Developer", icon: "code" },
        { name: "Kacper Zawiszewski", role: "Developer", icon: "code" },
        //{ name: "Jakub Lepiesza", role: "UI/UX Designer", icon: "paint-brush" },
        //{ name: "Michael Chen", role: "Backend Engineer", icon: "server" },
        //{ name: "Emily Rodriguez", role: "Nutrition Specialist", icon: "apple-alt" },
        //{ name: "David Kim", role: "Product Manager", icon: "tasks" },
    ];

    return (
        <ScrollView style={[styles.container, highContrast && styles.highContrastBackground]}>
            <View style={[styles.content, highContrast && styles.highContrastBackground]}>
                <Text style={[styles.title, highContrast && styles.highContrastBackground]}>About Helcro</Text>
                <Text style={[styles.text, highContrast && styles.highContrastBackground]}>
                    Helcro is your personal health companion designed to help you track nutrition,
                    monitor your weight, and achieve your dietary goals.
                </Text>

                <Text style={[styles.subtitle, highContrast && styles.highContrastBackground]}>Version Information</Text>
                <View style={styles.infoItem}>
                    <Icon name="info" size={18} color="brown" />
                    <Text style={[styles.infoText, highContrast && styles.highContrastBackground]}>Version: 1.0.0</Text>
                </View>
                <View style={[styles.infoItem, highContrast && styles.highContrastBackground]}>
                    <Icon name="calendar-today" size={18} color="brown" />
                    <Text style={[styles.infoText, highContrast && styles.highContrastBackground]}>Release Date: May 2025</Text>
                </View>

                <Text style={[styles.subtitle, highContrast && styles.highContrastBackground]}>Development Team</Text>
                <Text style={[styles.text, highContrast && styles.highContrastBackground]}>
                    Created by a passionate team of health and technology professionals dedicated
                    to improving your wellness journey.
                </Text>

                <View style={[styles.teamContainer, highContrast && styles.secondContrast]}>
                    {teamMembers.map((member, index) => (
                        <View key={index} style={[styles.teamMember, highContrast && styles.secondContrast]}>
                            <Icon2
                                name={member.icon}
                                size={20}
                                color="brown"
                                style={styles.memberIcon}
                            />
                            <View style={[styles.memberInfo, highContrast && styles.secondContrast]}>
                                <Text style={[styles.memberName, highContrast && styles.secondContrast]}>{member.name}</Text>
                                <Text style={[styles.memberRole, highContrast && styles.secondContrast]}>{member.role}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                <Text style={[styles.subtitle, highContrast && styles.highContrastBackground]}>Contact Us</Text>
                <TouchableOpacity style={styles.contactButton} onPress={handleContactPress}>
                    <Icon name="email" size={20} color="white" />
                    <Text style={styles.contactButtonText}>Email: helcro.app@gmail.com</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

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
        backgroundColor: "#f4f4f4",
    },
    content: {
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "brown",
        marginBottom: 20,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "brown",
        marginTop: 20,
        marginBottom: 10,
    },
    text: {
        fontSize: 16,
        color: "#333",
        marginBottom: 10,
        lineHeight: 22,
    },
    infoItem: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    infoText: {
        fontSize: 16,
        marginLeft: 10,
        color: "#555",
    },
    teamContainer: {
        marginVertical: 15,
        backgroundColor: "white",
        borderRadius: 10,
        padding: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    teamMember: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    memberIcon: {
        marginRight: 15,
        width: 24,
        textAlign: "center",
    },
    memberInfo: {
        flex: 1,
    },
    memberName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#444",
    },
    memberRole: {
        fontSize: 14,
        color: "#666",
        marginTop: 2,
    },
    contactButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "brown",
        padding: 15,
        borderRadius: 8,
        marginTop: 10,
        justifyContent: "center",
    },
    contactButtonText: {
        color: "white",
        fontSize: 16,
        marginLeft: 10,
        fontWeight: "bold",
    },
});