import React, { useState, useEffect } from "react";
import {View, Text, TouchableOpacity, TextInput, Platform, StyleSheet} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from "@react-native-picker/picker";
import axios from 'axios';
import { API_BASE_URL } from '@env';

export default function MealType({ onClose, onSubmit, isCopyAction = false, showOverlay = true }) {
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
        <View style={localStyles.overlay}>
          <View style={localStyles.modalContainer}>
            <Text>Loading meal types...</Text>
          </View>
        </View>
    );
  }

  return (
      <View style={[localStyles.overlay, !showOverlay && { backgroundColor: 'transparent' }]}>
        <View style={localStyles.modalContainer}>
          <Text style={localStyles.header}>
            {isCopyAction ? 'Select Target Meal Type' : 'Select Meal Type'}
          </Text>

          <View style={localStyles.pickerContainer}>
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
              <View style={localStyles.otherMealContainer}>
                <TextInput
                    style={localStyles.input}
                    placeholder="Enter meal name"
                    value={mealName}
                    onChangeText={handleMealNameChange}
                />
              </View>
          )}

          {!isCopyAction && selectedMeal && (
              <View style={localStyles.timeBox}>
                <Text style={localStyles.timeText}>Select Time</Text>
                <TouchableOpacity
                    onPress={() => setShowTimePicker(true)}
                    style={localStyles.timePickerButton}
                >
                  <Text style={localStyles.timePickerText}>
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

          <View style={localStyles.buttons}>
            <TouchableOpacity style={localStyles.closeButton} onPress={onClose}>
              <Text style={localStyles.closeButtonText}>Close</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[localStyles.submitButton, isNextButtonDisabled && localStyles.disabledButton]}
                onPress={handleSubmit}
                disabled={isNextButtonDisabled}
            >
              <Text style={localStyles.submitButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
  );
}

const localStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContainer: {
    width: "90%",
    maxWidth: 400,
    padding: 25,
    backgroundColor: '#fff',
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 20,
    color: '#333',
  },
  pickerContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    width: '100%',
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  picker: {
    height: 50,
    width: '100%',
    color: '#333',
  },
  otherMealContainer: {
    width: '100%',
    marginTop: 10,
  },
  input: {
    width: '100%',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#f8f8f8',
    fontSize: 16,
    color: '#333',
  },
  timeBox: {
    marginTop: 20,
    width: "100%",
    padding: 20,
    borderRadius: 10,
    backgroundColor: "#f8f8f8",
    alignItems: "center",
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  timeText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#555",
    marginBottom: 15,
  },
  timePickerButton: {
    backgroundColor: "brown", // Brown color
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  timePickerText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "500",
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 25,
  },
  closeButton: {
    backgroundColor: "brown", // Brown color
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  submitButton: {
    backgroundColor: "brown", // Brown color
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  disabledButton: {
    backgroundColor: '#e0e0e0',
    opacity: 0.7,
  },
});