import React, { useState , useEffect} from "react";
import {ScrollView, View, Text, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import DateTimePicker from "@react-native-community/datetimepicker";
import styles from "../../styles/MainStyles";

import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from '@env';
const apiUrl = `${API_BASE_URL}`;
export default function DietaryGoalsScreen() {
    const { user } = useAuth();
    const [goal, setGoal] = useState("");
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
        if (age && weight && height && user.Gender && goal) {
          axios
            .post(`${apiUrl}/api/calculate-goals`, {
              age,
              weight: parseFloat(weight),
              height: parseFloat(height),
              gender: user.Gender,
              goal,
            })
            .then((response) => {
                setProposedGoals(response.data);
                setEditableGoals(response.data); // ✅ Copy into editable state
                alert("Goals generated successfully!");
                setActiveTab("result");
            })
            .catch((err) => {
              console.error("Error calculating goals:", err);
              alert("There was an error generating your goals.");
            });
        } else {
          alert("Please fill in all fields first.");
        }
      };

    return (
        <ScrollView style={styles.container}>
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
                <View style={styles.tabContent}>
                    <Text style={localStyles.label}>Weight (kg)</Text>
                    <TextInput
                        style={styles.input}
                        value={weight}
                        onChangeText={setWeight}
                        placeholder="Enter your weight"
                        keyboardType="numeric"
                    />

                    <Text style={localStyles.label}>Height (cm)</Text>
                    <TextInput
                        style={styles.input}
                        value={height}
                        onChangeText={setHeight}
                        placeholder="Enter your height"
                        keyboardType="numeric"
                    />

                    <Text style={localStyles.label}>Date of Birth</Text>
                    <TouchableOpacity style={styles.input} onPress={() => setShowPicker(true)}>
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

                    <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                        <Text style={styles.submitButtonText}>Submit</Text>
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
                            style={styles.submitButton} 
                            onPress={handleSaveGoal}
                        >
                            <Text style={styles.submitButtonText}>Save All Changes</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </ScrollView>
    );
}
const localStyles = StyleSheet.create({
    label: {
      fontSize: 18,
      marginBottom: 8,
      color: "black",
      alignSelf: "center",
    },
    pickerContainer: {
        backgroundColor: "#f2f2f2",
        borderRadius: 10,
        marginBottom: 15,
        paddingHorizontal: 10,
        justifyContent: 'center', // Ensures text is vertically centered
        
    },
    picker: {
        height: 50,
        width: "100%",
        color: 'black',
        textAlign: 'left', // Aligns the selected text to the left
        paddingLeft: 0, // Removes any default padding
        marginLeft: -8, // Compensates for default padding on some devices
    },
    
    
    tabContent: {
      padding: 20,
      backgroundColor: "#fff",
      borderRadius: 10,
      marginBottom: 15,
    },
    tabButtonContainer: {
      flexDirection: "row",
      borderRadius: 10,
      overflow: "hidden",
      marginBottom: 10,
      marginTop: 0,
      width: "100%",
    },
    tabButton: {
      flex: 1,
      paddingVertical: 12,
      alignItems: "center",
      backgroundColor: "#d3d3d3",
    },
    activeTabButton: {
      backgroundColor: "#A31D1D",
    },
    tabButtonText: {
      fontWeight: "600",
      color: "#333",
    },
    activeTabText: {
      color: "white",
    },
    goalsContainer: {
      paddingHorizontal: 20,
      paddingBottom: 30,
    },
    input: {
      backgroundColor: "#f2f2f2",
      borderRadius: 10,
      padding: 12,
      fontSize: 16,
      marginBottom: 10,
      width: "100%",
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
    smallButtonText: {
      color: "#fff",
      fontSize: 14,
      fontWeight: "bold",
    },
    goalBlock: {
        marginBottom: 20,
      },
      
      macroLabel: {
        fontSize: 16,
        fontWeight: "bold",
        color: "black",
        marginBottom: 4,
      },
      
      currentValueText: {
        fontSize: 14,
        color: "black",
        marginBottom: 6,
        alignSelf: "flex-start",
      },
      
      inputRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      },
      
      input: {
        backgroundColor: "#f2f2f2",
        borderRadius: 10,
        padding: 10,
        fontSize: 16,
        flex: 1,
      },
      
      smallButton: {
        backgroundColor: "#A31D1D",
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 12,
      },
      
      smallButtonText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "bold",
      },
      
  });