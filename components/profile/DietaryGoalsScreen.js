import React, { useState , useEffect} from "react";
import {ScrollView, View, Text, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import DateTimePicker from "@react-native-community/datetimepicker";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useAccessibility } from "../AccessibleView/AccessibleView"
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from '@env';
const apiUrl = `${API_BASE_URL}`;

export default function DietaryGoalsScreen() {
    const { highContrast } = useAccessibility();
    const { user } = useAuth();
    const [goal, setGoal] = useState("weight_loss");
    const [weight, setWeight] = useState("");
    const [height, setHeight] = useState("");
    const [dob, setDob] = useState("");
    const [age, setAge] = useState(null);
    const [showPicker, setShowPicker] = useState(false);
    const [proposedGoals, setProposedGoals] = useState(null);
    const [activeTab, setActiveTab] = useState("select");
    const userId = user.UserId;
    const [editableGoals, setEditableGoals] = useState({
        DailyCalories: "",
        DailyProteins: "",
        DailyFats: "",
        DailyCarbs: "",
    });
    const [currentGoals, setCurrentGoals] = useState({
        DailyCalories: "0",
        DailyProteins: "0",
        DailyFats: "0",
        DailyCarbs: "0",
    });
    const goalsChanged = () => {
        return Object.keys(editableGoals).some(
            key => editableGoals[key].toString() !== currentGoals[key].toString()
        );
    };
    useEffect(() => {
        axios.get(`${apiUrl}/api/user/${userId}`)
            .then(response => {
                const { Height, Weight, Birthday } = response.data;
                setHeight(Height?.toString() || "");
                setWeight(Weight?.toString() || "");
                setDob(Birthday?.split("T")[0] || "");
                if (Birthday) setAge(calculateAge(Birthday));
            })
            .catch(console.error);

        // Check if user has goals already
        axios.get(`${apiUrl}/api/goal/${userId}`)
            .then(response => {
                if (response.data) {
                    const saved = response.data;
                    setCurrentGoals({
                        DailyCalories: saved.DailyCalories?.toString() || "0",
                        DailyProteins: saved.DailyProteins?.toString() || "0",
                        DailyFats: saved.DailyFats?.toString() || "0",
                        DailyCarbs: saved.DailyCarbs?.toString() || "0",
                    });
                    // Also set these as proposed goals if they exist
                    setProposedGoals({
                        DailyCalories: saved.DailyCalories?.toString() || "0",
                        DailyProteins: saved.DailyProteins?.toString() || "0",
                        DailyFats: saved.DailyFats?.toString() || "0",
                        DailyCarbs: saved.DailyCarbs?.toString() || "0",
                    });
                    // Set editable goals as well
                    setEditableGoals({
                        DailyCalories: saved.DailyCalories?.toString() || "0",
                        DailyProteins: saved.DailyProteins?.toString() || "0",
                        DailyFats: saved.DailyFats?.toString() || "0",
                        DailyCarbs: saved.DailyCarbs?.toString() || "0",
                    });
                }
            })
            .catch(error => {
                if (error.response?.status !== 404) {
                console.error("Error fetching saved goals:", error);
            }
            });
    }, [userId]);  // Add userId as dependency

    const calculateAge = (dob) => {
        const birthDate = new Date(dob);
        const currentDate = new Date();
        let age = currentDate.getFullYear() - birthDate.getFullYear();
        const monthDiff = currentDate.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && currentDate.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const handleDateChange = (event, selectedDate) => {
        setShowPicker(false);
        if (selectedDate) {
            const formattedDate = selectedDate.toISOString().split("T")[0];
            setDob(formattedDate);
            const calculatedAge = calculateAge(formattedDate);
            setAge(calculatedAge);
        }
    };


    const handleSaveGoal = () => {
        if (editableGoals) {
            axios.post(`${apiUrl}/api/goal`, {
                UserId: userId,
                ...editableGoals,
            })
                .then(response => {
                    alert("Goal saved successfully!");

                    // Update all states with the new values
                    setCurrentGoals({
                        DailyCalories: editableGoals.DailyCalories || "0",
                        DailyProteins: editableGoals.DailyProteins || "0",
                        DailyFats: editableGoals.DailyFats || "0",
                        DailyCarbs: editableGoals.DailyCarbs || "0",
                    });
                    setProposedGoals({
                        DailyCalories: editableGoals.DailyCalories || "0",
                        DailyProteins: editableGoals.DailyProteins || "0",
                        DailyFats: editableGoals.DailyFats || "0",
                        DailyCarbs: editableGoals.DailyCarbs || "0",
                    });
                })
                .catch(error => {
                    console.error("Error saving goal:", error);
                    alert("There was an error saving your goal.");
                });
        } else {
            alert("No goal data to save.");
        }
    };
    const updateUserInfo = () => {
        return axios.put(`${apiUrl}/api/user/${userId}`, {
            Height: parseFloat(height),
            Weight: parseFloat(weight),
            Birthday: dob,
        });
    };
    
    const handleSubmit = () => {
        if (!age || !weight || !height || !user.Gender) {
            alert("Please fill in all required fields first.");
            return;
        }
    
        updateUserInfo()
            .then(() => {
                return axios.post(`${apiUrl}/api/calculate-goals`, {
                    age,
                    weight: parseFloat(weight),
                    height: parseFloat(height),
                    gender: user.Gender,
                    goal: goal || "weight_loss",
                });
            })
            .then((response) => {
                setProposedGoals(response.data);
                setEditableGoals(response.data);
                alert("Goals generated successfully!");
                setActiveTab("result");
            })
            .catch((err) => {
                console.error("Error updating or generating goals:", err);
                alert("There was an error saving your information or generating goals.");
            });
    };

    return (
        <View style={[styles.container, highContrast && styles.highContrastBackground]}>
            {/* Tab Selection */}
            <View style={[styles.tabContainer, highContrast && styles.secondContrast]}>
                <TouchableOpacity
                    style={[styles.tabButton, activeTab === "select" && styles.activeTabButton]}
                    onPress={() => setActiveTab("select")}
                >
                    <Icon
                        name="calculate"
                        size={20}
                        color={activeTab === "select" ? "#FFF" : "#8D6E63"}
                    />
                    <Text style={[styles.tabText, activeTab === "select" && styles.activeTabText]}>
                        Generate Goals
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tabButton, activeTab === "result" && styles.activeTabButton]}
                    onPress={() => setActiveTab("result")}
                >
                    <Icon
                        name="show-chart"
                        size={20}
                        color={activeTab === "result" ? "#FFF" : "#8D6E63"}
                    />
                    <Text style={[styles.tabText, activeTab === "result" && styles.activeTabText]}>
                        View & Save
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Select Goal Tab */}
                {activeTab === "select" && (
                    <View style={[styles.card, highContrast && styles.secondContrast]}>
                        <View style={[styles.inputGroup, highContrast && styles.secondContrast]}>
                            <Icon name="height" size={20} color={highContrast ? '#FFFFFF' : "#5D4037"} style={styles.inputIcon} />
                            <TextInput
                                style={[
                                styles.input,
                                highContrast && styles.secondContrast,
                                { color: highContrast ? '#FFFFFF' : '#000000' }
                                ]}
                                placeholderTextColor={highContrast ? '#FFFFFF' : '#A1887F'}
                                value={height}
                                onChangeText={setHeight}
                                placeholder="Height (cm)"
                                keyboardType="numeric"
                            />
                        </View>

                        <View style={[styles.inputGroup, highContrast && styles.secondContrast]}>
                            <Icon name="fitness-center" size={20} color={highContrast ? '#FFFFFF' : "#5D4037"} style={styles.inputIcon} />
                            <TextInput
                                style={[
                                styles.input,
                                highContrast && styles.secondContrast,
                                { color: highContrast ? '#FFFFFF' : '#000000' }
                                ]}
                                placeholderTextColor={highContrast ? '#FFFFFF' : '#A1887F'}
                                value={weight}
                                onChangeText={setWeight}
                                placeholder="Weight (kg)"
                                keyboardType="numeric"
                            />
                        </View>

                        <View style={[styles.inputGroup, highContrast && styles.secondContrast]}>
                            <Icon
                                name="cake"
                                size={20}
                                color={highContrast ? '#FFFFFF' : '#5D4037'}
                                style={styles.inputIcon}
                            />

                            <TouchableOpacity
                                style={[
                                styles.dateInput,
                                highContrast && styles.secondContrast
                                ]}
                                onPress={() => setShowPicker(true)}
                            >
                                <Text
                                style={[
                                    styles.dateText,
                                    {
                                    color: dob
                                        ? (highContrast ? '#FFFFFF' : '#000000')
                                        : (highContrast ? '#FFFFFF' : '#A1887F')
                                    }
                                ]}
                                >
                                {dob || 'Date of Birth'}
                                </Text>
                            </TouchableOpacity>
                            </View>

                        {showPicker && (
                            <DateTimePicker
                                value={dob ? new Date(dob) : new Date()}
                                mode="date"
                                display="spinner"
                                onChange={handleDateChange}
                                maximumDate={new Date()}
                            />
                        )}

                        <View style={[styles.pickerContainer, highContrast && styles.secondContrast]}>
                            <Picker
                                selectedValue={goal}
                                onValueChange={setGoal}
                                dropdownIconColor="#5D4037"
                                mode="dropdown"
                            >
                                <Picker.Item
                                    label="Weight Loss"
                                    value="weight_loss"
                                    color={highContrast ? 'darkgrey' : '#000000'}
                                    />
                                    <Picker.Item
                                    label="Muscle Gain"
                                    value="muscle_gain"
                                    color={highContrast ? 'darkgrey' : '#000000'}
                                    />
                                    <Picker.Item
                                    label="Maintenance"
                                    value="maintenance"
                                    color={highContrast ? 'darkgrey' : '#000000'}
                                    />
                            </Picker>
                        </View>

                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={handleSubmit}
                        >
                            <Text style={styles.buttonText}>Calculate Goals</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Proposed Goals Tab */}
                {activeTab === "result" && (
                    <View style={[styles.card, highContrast && styles.secondContrast]}>
                        <Text style={[styles.sectionTitle, highContrast && styles.secondContrast]}>Edit Daily Goals</Text>

                        {["Calories", "Proteins", "Fats", "Carbs"].map((macro) => {
                            const key = `Daily${macro}`;
                            const unit = macro === "Calories" ? "kcal" : "g";
                            const currentValue = currentGoals[key] || "0";
                            const editableValue = editableGoals[key] || currentValue;

                            return (
                                <View key={key} style={[styles.goalCard, highContrast && styles.secondContrast]}>
                                    <View style={[styles.macroHeader, highContrast && styles.secondContrast]}>
                                        <Text style={[styles.macroTitle, highContrast && styles.secondContrast]}>{macro}</Text>
                                        <Text style={[styles.currentValue, highContrast && styles.secondContrast]}>Current: {currentValue}{unit}</Text>
                                    </View>

                                    <View style={[styles.inputGroup, highContrast && styles.secondContrast]}>
                                        <TextInput
                                            style={[styles.input, highContrast && styles.secondContrast]}
                                            placeholderTextColor={highContrast ? '#FFFFFF' : '#A1887F'}
                                            keyboardType="numeric"
                                            value={editableValue.toString()}
                                            onChangeText={(text) =>
                                                setEditableGoals((prev) => ({ ...prev, [key]: text }))
                                            }
                                            placeholder={`Enter ${macro.toLowerCase()}`}
                                      
                                        />
                                        <Text style={[styles.unitText, highContrast && styles.secondContrast]}>{unit}</Text>
                                    </View>
                                </View>
                            );
                        })}

                        {goalsChanged() && (
                            <TouchableOpacity
                                style={styles.primaryButton}
                                onPress={handleSaveGoal}
                            >
                                <Text style={styles.buttonText}>Save All Changes</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </ScrollView>
        </View>
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
    },
    tabContainer: {
        flexDirection: 'row',
        marginHorizontal: 20,
        marginTop: 20,
        backgroundColor: '#EFEBE9',
        borderRadius: 12,
        overflow: 'hidden',
    },
    tabButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        backgroundColor: 'transparent',
    },
    activeTabButton: {
        backgroundColor: 'brown',
    },
    tabText: {
        marginLeft: 8,
        fontSize: 14,
        fontWeight: '500',
        color: 'brown',
    },
    activeTabText: {
        color: '#FFF',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 20,
        marginTop: 20,
        elevation: 3,
        shadowColor: '#5D4037',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
    },
    inputGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 10,
        paddingHorizontal: 14,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#D7CCC8',
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        paddingVertical: 14,
        color: '#5D4037',
        fontSize: 15,
    },
    dateInput: {
        flex: 1,
        paddingVertical: 14,
    },
    dateText: {
        fontSize: 15,
        color: '#5D4037',
    },
    pickerContainer: {
        backgroundColor: 'white',
        borderRadius: 10,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#D7CCC8',
        overflow: 'hidden',
    },
    primaryButton: {
        backgroundColor: 'brown',
        padding: 16,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '500',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#5D4037',
        marginBottom: 20,
    },
    goalCard: {
        borderRadius: 10,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#EFEBE9',
    },
    macroHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    macroTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#5D4037',
    },
    currentValue: {
        fontSize: 14,
    },
    unitText: {
        fontSize: 14,
        marginLeft: 10,
    },
});