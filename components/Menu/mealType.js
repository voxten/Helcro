import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import styles from "../../styles/MealStyles";

export default function MealType({ onClose }) {
  const [selectedMeal, setSelectedMeal] = useState(null);  // Przechowuje wybrany posiłek
  const [mealTime, setMealTime] = useState({ hours: '', minutes: '' });  // Przechowuje godzinę posiłku (godziny i minuty)
  const [mealName, setMealName] = useState('');  // Przechowuje nazwę posiłku dla opcji 'Inne'
  const [isMealTimeVisible, setMealTimeVisible] = useState(false);  // Pokazuje/ukrywa box godziny

  const handleMealClick = (meal) => {
    if (selectedMeal === meal) {
      setMealTimeVisible(false);
      setSelectedMeal(null);
    } else {
      setSelectedMeal(meal);
      setMealTimeVisible(true);
    }
  };

  const buttonStyle = (meal) => ({
    ...styles.button,
    backgroundColor: selectedMeal === meal ? '#8e44ad' : '#ddd',
  });

  const handleTimeChange = (type, value) => {
    // Zabezpieczenie przed wpisaniem niepoprawnych wartości
    if (type === 'hours') {
      const hours = Math.max(0, Math.min(23, parseInt(value) || 0));  // Ograniczamy godzinę do 0-23
      setMealTime((prevTime) => ({ ...prevTime, hours: hours.toString() }));
    } else if (type === 'minutes') {
      const minutes = Math.max(0, Math.min(59, parseInt(value) || 0));  // Ograniczamy minutę do 0-59
      setMealTime((prevTime) => ({ ...prevTime, minutes: minutes.toString() }));
    }
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.modalContainer}>
        <Text style={styles.header}>Wybierz typ posiłku</Text>

        {/* ScrollView dla przycisków */}
        <ScrollView style={styles.buttonScrollContainer}>
          {['Śniadanie', 'Drugie Śniadanie', 'Obiad', 'Podwieczorek', 'Kolacja', 'Inne'].map((meal) => (
            <TouchableOpacity
              key={meal}
              style={buttonStyle(meal)}
              onPress={() => handleMealClick(meal)}
              disabled={selectedMeal && selectedMeal !== meal}
            >
              <Text style={styles.buttonText}>{meal}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Wybór godziny */}
        {isMealTimeVisible && selectedMeal && (
          <View style={styles.timeBox}>
            <Text style={styles.timeText}>Wybierz godzinę</Text>
            <View style={styles.timeInputContainer}>
              <TextInput
                style={styles.timeInput}
                value={mealTime.hours}
                onChangeText={(value) => handleTimeChange('hours', value)}
                placeholder="Godz."
                keyboardType="numeric"
                maxLength={2}
              />
              <Text style={styles.separator}>:</Text>
              <TextInput
                style={styles.timeInput}
                value={mealTime.minutes}
                onChangeText={(value) => handleTimeChange('minutes', value)}
                placeholder="Min."
                keyboardType="numeric"
                maxLength={2}
              />
            </View>
          </View>
        )}

        {/* Pole do wpisania nazwy posiłku (tylko przy "Inne") */}
        {selectedMeal === 'Inne' && (
          <View style={styles.nameBox}>
            <TextInput
              style={styles.nameInput}
              value={mealName}
              onChangeText={setMealName}
              placeholder="Wpisz nazwę posiłku"
            />
          </View>
        )}

        {/* Przycisk "Dalej" i "Zamknij" */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Zamknij</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            disabled={!mealTime.hours || !mealTime.minutes || (selectedMeal === 'Inne' && !mealName)}
          >
            <Text style={styles.closeButtonText}>Dalej</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
