import { useState } from "react";
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, Modal } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import MealType from "./mealType"; // Importujemy MealType
import styles from "../../styles/MainStyles"

export default function Menu() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [showMealType, setShowMealType] = useState(false);

  const formatDate = (date) => {
    return date.toLocaleDateString("pl-PL", { weekday: 'long', day: 'numeric', month: 'long' });
  };

  const changeDay = (days) => {
    setSelectedDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setDate(prevDate.getDate() + days);
      return newDate;
    });
  };

  return (
    <View style={localStyles.container}>
      {/* Sekcja wartości odżywczych */}
      <View style={localStyles.nutritionContainer}>
        <Text style={localStyles.nutritionText}>Kcal: 0 | Białko: 0g | Tłuszcz: 0g | Węglowodany: 0g</Text>
        <TouchableOpacity onPress={() => setShowCalendar(true)}>
          <AntDesign name="calendar" size={24} color="brown" />
        </TouchableOpacity>
      </View>

      {/* Data */}
      <View style={localStyles.dateContainer}>
        <TouchableOpacity onPress={() => changeDay(-1)}>
          <AntDesign name="left" size={20} color="brown" />
        </TouchableOpacity>
        <Text style={localStyles.dateText}>{formatDate(selectedDate)}</Text>
        <TouchableOpacity onPress={() => changeDay(1)}>
          <AntDesign name="right" size={20} color="brown" />
        </TouchableOpacity>
      </View>

      {/* Kalendarz */}
      {showCalendar && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowCalendar(false);
            if (date) setSelectedDate(date);
          }}
        />
      )}

      {/* Lista posiłków */}
      <ScrollView style={localStyles.mealList}>
        <Text style={localStyles.mealText}>Brak posiłków na ten dzień</Text>
      </ScrollView>

      {/* Przycisk dodawania posiłku */}
      <TouchableOpacity style={styles.submitButton} onPress={() => setShowMealType(true)}>
        <Text style={styles.submitButtonText}>Dodaj posiłek</Text>
      </TouchableOpacity>

      {/* Modal na MealType */}
      <Modal
        visible={showMealType}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowMealType(false)}
      >
        <MealType onClose={() => setShowMealType(false)} />
      </Modal>
    </View>
  );
}

const localStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#eee', paddingHorizontal: 20, paddingTop: 40 },
  header: { fontSize: 26, textAlign: 'center', color: 'brown', marginBottom: 20 },
  nutritionContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, backgroundColor: '#fff', borderRadius: 10, elevation: 3 },
  nutritionText: { fontSize: 16 },
  dateContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginVertical: 15 },
  dateText: { fontSize: 18, marginHorizontal: 10, color: 'brown' },
  mealList: { flex: 1 },
  mealText: { fontSize: 16, textAlign: 'center', marginTop: 20, color: 'gray' },

});
