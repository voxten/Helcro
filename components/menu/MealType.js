import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import mainStyles from "../../styles/MainStyles";
import styles from "./MealStyles";

export default function MealType({ onClose, onSubmit }) {
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [mealTime, setMealTime] = useState(new Date());
  const [mealName, setMealName] = useState('');
  const [isMealTimeVisible, setMealTimeVisible] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleMealClick = (meal) => {
    if (selectedMeal === meal) {
      setSelectedMeal(null);
      setMealTimeVisible(false);
    } else {
      setSelectedMeal(meal);
      setMealTimeVisible(true);
    }
  };

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

  const buttonStyle = (meal) => ({
    ...mainStyles.button,
    backgroundColor: selectedMeal === meal ? 'brown' : '#ddd',
  });

  return (
      <View style={mainStyles.overlay}>
        <View style={mainStyles.modalContainer}>
          <Text style={mainStyles.header}>Select Meal Type</Text>

          {["Breakfast", "Second Breakfast", "Lunch", "Afternoon Snack", "Dinner", "Other"].map((meal) => (
              <TouchableOpacity
                  key={meal}
                  style={buttonStyle(meal)}
                  onPress={() => handleMealClick(meal)}
                  disabled={selectedMeal && selectedMeal !== meal}
              >
                <Text style={mainStyles.buttonText}>{meal}</Text>
              </TouchableOpacity>
          ))}

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

          {isMealTimeVisible && selectedMeal && (
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