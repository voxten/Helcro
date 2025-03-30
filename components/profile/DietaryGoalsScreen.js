import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import styles from "../../styles/MainStyles";

export default function DietaryGoalsScreen() {
    const [goal, setGoal] = useState("");
    const [weight, setWeight] = useState("");
    const [height, setHeight] = useState("");
    const [dob, setDob] = useState("");
    const [age, setAge] = useState(null);
    const [showPicker, setShowPicker] = useState(false);

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

    const handleSubmit = () => {
        console.log("Dietary Goals Submitted");
    };

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                value={weight}
                onChangeText={setWeight}
                placeholder="Enter your weight (kg)"
                keyboardType="numeric"
            />
            <TextInput
                style={styles.input}
                value={height}
                onChangeText={setHeight}
                placeholder="Enter your height (cm)"
                keyboardType="numeric"
            />
            <TouchableOpacity style={styles.input} onPress={() => setShowPicker(true)}>
                <Text style={{ color: dob ? "black" : "gray" }}>
                    {dob ? `Date of Birth: ${dob}` : "Select your date of birth"}
                </Text>
            </TouchableOpacity>

            {showPicker && (
                <DateTimePicker
                    value={dob ? new Date(dob) : new Date()}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                    maximumDate={new Date()} // Prevent future dates
                />
            )}
            <View style={localStyles.pickerContainer}>
                <Picker selectedValue={goal} onValueChange={setGoal} style={localStyles.picker}>
                    <Picker.Item label="Weight Loss" value="weight_loss" />
                    <Picker.Item label="Muscle Gain" value="muscle_gain" />
                    <Picker.Item label="Maintenance" value="maintenance" />
                </Picker>
            </View>
            <TouchableOpacity style={styles.submitButton} onPress={() => handleSubmit()}>
                <Text style={ styles.submitButtonText }>Submit</Text>
            </TouchableOpacity>
            { age &&
                <Text style={styles.text}>Your age: {age} years</Text>
            }
        </View>
    );
}
const localStyles = StyleSheet.create({
    title: {
        color: "white",
        fontSize: 24,
        marginBottom: 20,
    },
    pickerContainer: {
        backgroundColor: 'white',
        borderRadius: 5,
        borderColor: 'red',
        marginBottom: 15,
    },
    picker: {
        color: 'black',
    },
    ageText: {
        color: "white",
        fontSize: 18,
        marginTop: 10,
    },
});