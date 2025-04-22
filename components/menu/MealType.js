import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, TextInput, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from "@react-native-picker/picker";
import mainStyles from "../../styles/MainStyles";
import styles from "./MealStyles";
import axios from 'axios';
import { API_BASE_URL } from '@env';
import { useAuth } from "../context/AuthContext";

export default function MealType({ onClose, onSubmit, isCopyAction = false }) {
  const { user } = useAuth();
  const [mealTypes, setMealTypes] = useState([]);
  const [mealTime, setMealTime] = useState(new Date());
  const [mealName, setMealName] = useState('');
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedMealId, setSelectedMealId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMealTypes = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/meals`);
        // Ensure we only use existing meal types from database
        setMealTypes(response.data.map(meal => ({
          MealId: meal.MealId,
          MealType: meal.MealType
        })));
      } catch (error) {
        console.error("Error fetching meal types:", error);
        // Fallback to default types if API fails
        setMealTypes([
          { MealId: 1, MealType: 'Breakfast' },
          { MealId: 2, MealType: 'Second Breakfast' },
          { MealId: 3, MealType: 'Lunch' },
          { MealId: 4, MealType: 'Afternoon Snack' },
          { MealId: 5, MealType: 'Dinner' },
          { MealId: 6, MealType: 'Other' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchMealTypes();
  }, []);

  const handleSubmit = () => {
    if (isCopyAction) {
      onSubmit(selectedMealId, null, null);
    } else {
      const mealType = mealTypes.find(m => m.MealId === selectedMealId)?.MealType || 'Other';
      onSubmit(mealType, mealTime, mealName);
    }
  };

  const handleTimeChange = (event, selectedDate) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedDate) setMealTime(selectedDate);
  };

  const handleMealNameChange = (text) => {
    setMealName(text);
  };

  const selectedMeal = mealTypes.find(m => m.MealId === selectedMealId)?.MealType || null;

  const isNextButtonDisabled = loading || !selectedMealId ||
      (!isCopyAction && selectedMeal === 'Other' && mealName.trim() === '');

  if (loading) {
    return (
        <View style={mainStyles.overlay}>
          <View style={mainStyles.modalContainer}>
            <Text>Loading meal types...</Text>
          </View>
        </View>
    );
  }

  return (
      <View style={mainStyles.overlay}>
        <View style={mainStyles.modalContainer}>
          <Text style={mainStyles.header}>
            {isCopyAction ? 'Select Target Meal Type' : 'Select Meal Type'}
          </Text>

          <View style={styles.pickerContainer}>
            <Picker
                selectedValue={selectedMealId}
                onValueChange={(value) => setSelectedMealId(value)}
            >
              <Picker.Item label="Select a meal type..." value={null} />
              {mealTypes.map(meal => (
                  <Picker.Item
                      key={meal.MealId}
                      label={meal.MealType}
                      value={meal.MealId}
                  />
              ))}
            </Picker>
          </View>

          {!isCopyAction && selectedMeal === 'Other' && (
              <View style={styles.otherMealContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Enter meal name"
                    value={mealName}
                    onChangeText={handleMealNameChange}
                />
              </View>
          )}

          {!isCopyAction && selectedMeal && (
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