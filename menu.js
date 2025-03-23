import { useState } from "react";
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, Modal } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import MealType from "./mealType"; // Importujemy MealType

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
    <View style={styles.container}>
      <Text style={styles.header}>Hellcro</Text>

      {/* Sekcja wartości odżywczych */}
      <View style={styles.nutritionContainer}>
        <Text style={styles.nutritionText}>Kcal: 0 | Białko: 0g | Tłuszcz: 0g | Węglowodany: 0g</Text>
        <TouchableOpacity onPress={() => setShowCalendar(true)}>
          <AntDesign name="calendar" size={24} color="brown" />
        </TouchableOpacity>
      </View>

      {/* Data */}
      <View style={styles.dateContainer}>
        <TouchableOpacity onPress={() => changeDay(-1)}>
          <AntDesign name="left" size={20} color="brown" />
        </TouchableOpacity>
        <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
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
      <ScrollView style={styles.mealList}>
        <Text style={styles.mealText}>Brak posiłków na ten dzień</Text>
      </ScrollView>

      {/* Przycisk dodawania posiłku */}
      <TouchableOpacity style={styles.addButton} onPress={() => setShowMealType(true)}>
        <Text style={styles.addButtonText}>Dodaj posiłek</Text>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#eee', paddingHorizontal: 20, paddingTop: 40 },
  header: { fontSize: 26, textAlign: 'center', color: 'brown', marginBottom: 20 },
  nutritionContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, backgroundColor: '#fff', borderRadius: 10, elevation: 3 },
  nutritionText: { fontSize: 16 },
  dateContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginVertical: 15 },
  dateText: { fontSize: 18, marginHorizontal: 10, color: 'brown' },
  mealList: { flex: 1 },
  mealText: { fontSize: 16, textAlign: 'center', marginTop: 20, color: 'gray' },
  addButton: { backgroundColor: "brown", padding: 15, borderRadius: 10, alignItems: "center", marginVertical: 20 },
  addButtonText: { color: "white", fontSize: 18, fontWeight: "bold" },
});
