import { useState } from "react";
import { ScrollView,StyleSheet, Text, View } from 'react-native';

export default function menu() {

    const [selectedDate, setSelectedDate] = useState(new Date());

    const changeDay = (days) => {
      setSelectedDate(prevDate => {
        const newDate = new Date(prevDate);
        newDate.setDate(prevDate.getDate() + days);
        return newDate;
      });
  
}

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Helcro</Text>

      <View style={styles.nutritionContainer}>
        <Text style={styles.nutritionText}>Kcal: 0 | Białko: 0g | Tłuszcz: 0g | Węglowodany: 0g</Text>
        <TouchableOpacity onPress={() => changeDay(1)}>
          <AntDesign name="calendar" size={24} color="brown" />
        </TouchableOpacity>
      </View>

      {/* Data wybranego dnia */}
      <View style={styles.dateContainer}>
        <TouchableOpacity onPress={() => changeDay(-1)}>
          <AntDesign name="left" size={20} color="brown" />
        </TouchableOpacity>
        <Text style={styles.dateText}>{selectedDate.toDateString()}</Text>
        <TouchableOpacity onPress={() => changeDay(1)}>
          <AntDesign name="right" size={20} color="brown" />
        </TouchableOpacity>
      </View>

      {/* Lista posiłków */}
      <ScrollView style={styles.mealList}>
        <Text style={styles.mealText}>Brak posiłków na ten dzień</Text>
      </ScrollView>
    </View>
  );
}


const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#eee',
      paddingHorizontal: 20,
      paddingTop: 40,
    },
    header: {
      fontSize: 26,
      textAlign: 'center',
      color: 'brown',
      marginBottom: 20,
    },
    nutritionContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 10,
      backgroundColor: '#fff',
      borderRadius: 10,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 5,
      elevation: 3,
    },
    nutritionText: {
      fontSize: 16,
    },
    dateContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginVertical: 15,
    },
    dateText: {
      fontSize: 18,
      marginHorizontal: 10,
      color: 'brown',
    },
    mealList: {
      flex: 1,
    },
    mealText: {
      fontSize: 16,
      textAlign: 'center',
      marginTop: 20,
      color: 'gray',
    }
  });
