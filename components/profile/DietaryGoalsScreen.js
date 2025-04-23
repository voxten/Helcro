import React, { useState , useEffect} from "react";
import {ScrollView, View, Text, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import DateTimePicker from "@react-native-community/datetimepicker";

import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from '@env';
const apiUrl = `${API_BASE_URL}`;
export default function DietaryGoalsScreen() {
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
                console.error("Error fetching saved goals:", error);
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

    const handleSubmit = () => {
        if (!age || !weight || !height || !user.Gender) {
            alert("Please fill in all required fields first.");
            return;
        }

        axios
            .post(`${apiUrl}/api/calculate-goals`, {
                age,
                weight: parseFloat(weight),
                height: parseFloat(height),
                gender: user.Gender,
                goal: goal || "weight_loss", // Fallback to weight_loss if somehow empty
            })
            .then((response) => {
                setProposedGoals(response.data);
                setEditableGoals(response.data);
                alert("Goals generated successfully!");
                setActiveTab("result");
            })
            .catch((err) => {
                console.error("Error calculating goals:", err);
                alert("There was an error generating your goals.");
            });
    };

    return (
        <ScrollView style={localStyles.container}>
            {/* Tab Selection */}
            <View style={localStyles.tabButtonContainer}>
                <TouchableOpacity
                    style={[localStyles.tabButton, activeTab === "select" && localStyles.activeTabButton]}
                    onPress={() => setActiveTab("select")}
                >
                    <Text style={[localStyles.tabButtonText, activeTab === "select" && localStyles.activeTabText]}>
                        🎯 Generate Goals
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[localStyles.tabButton, activeTab === "result" && localStyles.activeTabButton]}
                    onPress={() => setActiveTab("result")}
                >
                    <Text style={[localStyles.tabButtonText, activeTab === "result" && localStyles.activeTabText]}>
                        📊 View & Save Goals
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Select Goal Tab */}
            {activeTab === "select" && (
                <View style={localStyles.tabContent}>

                    <Text style={localStyles.label}>Height (cm)</Text>
                    <TextInput
                        style={localStyles.input}
                        value={height}
                        onChangeText={setHeight}
                        placeholder="Enter your height"
                        keyboardType="numeric"
                    />

                    <Text style={localStyles.label}>Weight (kg)</Text>
                    <TextInput
                        style={localStyles.input}
                        value={weight}
                        onChangeText={setWeight}
                        placeholder="Enter your weight"
                        keyboardType="numeric"
                    />

                    <Text style={localStyles.label}>Date of Birth</Text>
                    <TouchableOpacity style={localStyles.input} onPress={() => setShowPicker(true)}>
                        <Text style={{ color: dob ? "black" : "gray" }}>
                            {dob ? dob : "Select your date of birth"}
                        </Text>
                    </TouchableOpacity>

                    {showPicker && (
                        <DateTimePicker
                            value={dob ? new Date(dob) : new Date()}
                            mode="date"
                            display="default"
                            onChange={handleDateChange}
                            maximumDate={new Date()}
                        />
                    )}

                    <Text style={localStyles.label}>Goal</Text>
                    <View style={localStyles.pickerContainer}>
                        <Picker
                            selectedValue={goal}
                            onValueChange={setGoal}
                            style={localStyles.picker}
                            dropdownIconColor="#A31D1D"
                            mode="dropdown"
                        >
                            <Picker.Item label="Weight Loss" value="weight_loss" />
                            <Picker.Item label="Muscle Gain" value="muscle_gain" />
                            <Picker.Item label="Maintenance" value="maintenance" />
                        </Picker>
                    </View>

                    <TouchableOpacity style={localStyles.submitButton} onPress={handleSubmit}>
                        <Text style={localStyles.submitButtonText}>Submit</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Proposed Goals Tab */}
            {activeTab === "result" && (
                <View style={localStyles.goalsContainer}>
                    <Text style={localStyles.label}>Edit Daily Goals:</Text>
                
                    {["Calories", "Proteins", "Fats", "Carbs"].map((macro) => {
                        const key = `Daily${macro}`;
                        const unit = macro === "Calories" ? "kcal" : "g";
                        const currentValue = currentGoals[key] || "0";
                        const editableValue = editableGoals[key] || currentValue;
                        
                        return (
                            <View key={key} style={localStyles.goalBlock}>
                                <Text style={localStyles.macroLabel}>{macro}</Text>
                                <Text style={localStyles.currentValueText}>
                                    Current: {currentValue} {unit}
                                </Text>
                                <View style={localStyles.inputRow}>
                                    <TextInput
                                        style={localStyles.input}
                                        keyboardType="numeric"
                                        value={editableValue.toString()}
                                        onChangeText={(text) =>
                                            setEditableGoals((prev) => ({ ...prev, [key]: text }))
                                        }
                                        placeholder={`Enter ${macro.toLowerCase()} (${unit})`}
                                    />
                                </View>
                            </View>
                        );
                    })}
                    
                    {goalsChanged() && (
                        <TouchableOpacity 
                            style={localStyles.submitButton}
                            onPress={handleSaveGoal}
                        >
                            <Text style={localStyles.submitButtonText}>Save All Changes</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </ScrollView>
    );
}
const localStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#eee",
        paddingHorizontal: 0,  // Remove horizontal padding to allow full width
    },
    label: {
        fontSize: 18,
        marginBottom: 8,
        color: "black",
        fontWeight: '600',
        alignSelf: "flex-start",
        marginLeft: 20,
    },
    submitButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    submitButton: {
        backgroundColor: "#A31D1D",
        paddingVertical: 15,
        paddingHorizontal: 25,
        borderRadius: 8,
        marginVertical: 20,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
        alignSelf: 'center',
        width: '100%',
    },
    pickerContainer: {
        backgroundColor: "#f2f2f2",
        borderRadius: 10,
        marginBottom: 15,
        paddingHorizontal: 10,
        justifyContent: 'center',
    },
    picker: {
        height: 50,
        width: "100%",
        color: 'black',
    },
    tabContent: {
        padding: 20,
        backgroundColor: "#fff",
        borderRadius: 10,
        marginBottom: 15,
        marginHorizontal: 10,  // Reduced margin for more width
    },
    tabButtonContainer: {
        flexDirection: "row",
        overflow: "hidden",
        marginBottom: 10,
        marginTop: 0,
        width: "100%",
        backgroundColor: '#fff',
        paddingHorizontal: 0,  // Remove padding for full width
    },
    tabButton: {
        flex: 1,
        paddingVertical: 15,
        alignItems: "center",
        backgroundColor: "#f2f2f2",
        borderBottomWidth: 3,
        borderBottomColor: 'transparent',
    },
    activeTabButton: {
        backgroundColor: "#fff",
        borderBottomColor: '#A31D1D',
    },
    tabButtonText: {
        fontWeight: "600",
        color: "#333",
        fontSize: 14,
    },
    activeTabText: {
        color: "#A31D1D",
    },
    goalsContainer: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#fff',
        borderRadius: 10,
        marginHorizontal: 10,  // Reduced margin for more width
    },
    input: {
        backgroundColor: "#f2f2f2",
        borderRadius: 10,
        padding: 15,
        fontSize: 16,
        marginBottom: 15,
        width: "100%",  // Full width of container
        color: 'black',
    },
    smallButton: {
        backgroundColor: "#A31D1D",
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: "center",
        marginLeft: 10,
        justifyContent: "center",
    },
    goalBlock: {
        marginBottom: 20,
        backgroundColor: '#f9f9f9',
        padding: 15,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        width: '100%',  // Ensure full width
    },
    macroLabel: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#A31D1D",
        marginBottom: 8,
    },
    currentValueText: {
        fontSize: 14,
        color: "#555",
        marginBottom: 10,
    },
    inputRow: {
        flexDirection: "row",
        alignItems: "center",
        width: '100%',  // Full width
    },
    smallButtonText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "bold",
    },
    unitText: {
        fontSize: 14,
        color: "#555",
        marginLeft: 10,
    },
});