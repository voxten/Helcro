import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, Linking, Animated } from "react-native";
import Icon from "react-native-vector-icons/Feather";
import Icon2 from "react-native-vector-icons/FontAwesome5";
import { useAccessibility } from "../AccessibleView/AccessibleView";
export default function HelpScreen() {
    const { highContrast } = useAccessibility();
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [expandedItems, setExpandedItems] = useState({});

    const faqs = [
        {
            question: "How do I set my dietary goals?",
            answer: "Go to 'Dietary Goals' in the More section to customize your nutritional targets.",
            icon: "bullseye"
        },
        {
            question: "Can I export my data?",
            answer: "Yes, use the 'Export Data' feature to download your health records in 4 different formats (CSV, PDF, Text, Excel).",
            icon: "download"
        },
        {
            question: "How do I change my password?",
            answer: "Navigate to your Profile, then select 'Change Password' to update your login credentials.",
            icon: "lock"
        },
        {
            question: "Is my data secure?",
            answer: "Yes, we use industry-standard encryption to protect all your personal health data.",
            icon: "shield-alt"
        }
    ];

    const toggleItem = (index) => {
        setExpandedItems(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    const handleSendEmail = () => {
        const mailtoUrl = `mailto:helcro.app@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
        Linking.openURL(mailtoUrl);
    };

    return (
        <ScrollView style={[styles.container, highContrast && styles.highContrastBackground]}>
            <View style={[styles.content, highContrast && styles.highContrastBackground]}>
                <Text style={[styles.title, highContrast && styles.highContrastBackground]}>Help Center</Text>
                <Text style={[styles.subtitle, highContrast && styles.highContrastBackground]}>Frequently Asked Questions</Text>

                {faqs.map((faq, index) => (
                    <View key={index} style={[styles.faqContainer, highContrast && styles.secondContrast]}>
                        <TouchableOpacity
                            style={[styles.faqQuestionContainer, highContrast && styles.secondContrast]}
                            onPress={() => toggleItem(index)}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.faqHeader, highContrast && styles.secondContrast]}>
                                <Icon2
                                    name={faq.icon}
                                    size={16}
                                    color="brown"
                                    style={styles.faqIcon}
                                />
                                <Text style={[styles.faqQuestion, highContrast && styles.secondContrast]}>{faq.question}</Text>
                            </View>
                            <Icon
                                name={expandedItems[index] ? "chevron-up" : "chevron-down"}
                                size={20}
                                color={highContrast ? '#FFFFFF' : '#666'}
                            />
                        </TouchableOpacity>

                        {expandedItems[index] && (
                            <View style={[styles.faqAnswerContainer, highContrast && styles.secondContrast]}>
                                <Text style={[styles.faqAnswer, highContrast && styles.secondContrast]}>{faq.answer}</Text>
                            </View>
                        )}
                    </View>
                ))}

                <Text style={[styles.subtitle, highContrast && styles.highContrastBackground]}>Contact Support</Text>
                <Text style={[styles.text, highContrast && styles.highContrastBackground]}>
                    Can't find what you're looking for? Send us a message and we'll get back to you soon.
                </Text>

                <TextInput
                    style={[styles.input, highContrast && styles.secondContrast]}
                    placeholderTextColor={highContrast ? '#FFFFFF' : '#999999'}
                    placeholder="Subject"
                    value={subject}
                    onChangeText={setSubject}
                />

                <TextInput
                    style={[styles.input,styles.messageInput, highContrast && styles.secondContrast]}
                    placeholderTextColor={highContrast ? '#FFFFFF' : '#999999'}
                    placeholder="Your message"
                    multiline
                    numberOfLines={4}
                    value={message}
                    onChangeText={setMessage}
                />

                <TouchableOpacity style={styles.sendButton} onPress={handleSendEmail}>
                    <Icon name="send" size={20} color="white" />
                    <Text style={styles.sendButtonText}>Send Message</Text>
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
        marginBottom: 15,
        lineHeight: 22,
    },
    faqContainer: {
        marginBottom: 10,
        backgroundColor: "white",
        borderRadius: 8,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    faqQuestionContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 15,
    },
    faqHeader: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    faqIcon: {
        marginRight: 12,
    },
    faqQuestion: {
        fontSize: 16,
        fontWeight: "600",
        color: "#444",
        flex: 1,
    },
    faqAnswerContainer: {
        padding: 15,
        paddingTop: 0,
        borderTopWidth: 1,
        borderTopColor: "#eee",
    },
    faqAnswer: {
        fontSize: 15,
        color: "#555",
        lineHeight: 22,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 15,
        marginBottom: 15,
        backgroundColor: "white",
        fontSize: 16,
    },
    messageInput: {
        height: 150,
        textAlignVertical: "top",
    },
    sendButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "brown",
        padding: 15,
        borderRadius: 8,
        marginTop: 10,
    },
    sendButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
        marginLeft: 10,
    },
});