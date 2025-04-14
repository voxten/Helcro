import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from "@react-native-picker/picker";
import mainStyles from "../../styles/MainStyles";
import styles from "./MealStyles";

export default function MealType({ onClose, onSubmit }) {
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [mealTime, setMealTime] = useState(new Date());
  const [mealName, setMealName] = useState('');
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleTimeChange = (event, selectedDate) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedDate) setMealTime(selectedDate);
  };

  const handleMealNameChange = (text) => {
    setMealName(text);
  };

  const handleSubmit = () => {
    onSubmit(selectedMeal, mealTime, mealName);
  };

  const isNextButtonDisabled = !selectedMeal || (selectedMeal === 'Other' && mealName.trim() === '');

  return (
      <View style={mainStyles.overlay}>
        <View style={mainStyles.modalContainer}>
          <Text style={mainStyles.header}>Select Meal Type</Text>

          <View style={styles.pickerContainer}>
            <Picker
                selectedValue={selectedMeal}
                onValueChange={(value) => setSelectedMeal(value)}
                style={styles.picker}
                dropdownIconColor="black" // Optional: to make dropdown icon visible
            >
              <Picker.Item label="Select a meal type..." value={null} />
              <Picker.Item label="Breakfast" value="Breakfast" />
              <Picker.Item label="Second Breakfast" value="Second Breakfast" />
              <Picker.Item label="Lunch" value="Lunch" />
              <Picker.Item label="Afternoon Snack" value="Afternoon Snack" />
              <Picker.Item label="Dinner" value="Dinner" />
              <Picker.Item label="Other" value="Other" />
            </Picker>
          </View>


          {selectedMeal === 'Other' && (
              <View style={styles.otherMealContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Enter meal name"
                    value={mealName}
                    onChangeText={handleMealNameChange}
                />
              </View>
          )}

          {selectedMeal && (
              <View style={styles.timeBox}>
                <Text style={styles.timeText}>Select Time</Text>
                <TouchableOpacity
                    onPress={() => setShowTimePicker(true)}
                    style={styles.timePickerButton}
                >
                  <Text style={styles.timePickerText}>
                    {mealTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </Text>
                </TouchableOpacity>
                {showTimePicker && (
                    <DateTimePicker
                        value={mealTime}
                        mode="time"
                        display="spinner"
                        onChange={handleTimeChange}
                    />
                )}
              </View>
          )}

          <View style={styles.buttons}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.submitButton, isNextButtonDisabled && styles.disabledButton]}
                onPress={handleSubmit}
                disabled={isNextButtonDisabled}
            >
              <Text style={styles.submitButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
  );
}
