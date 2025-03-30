import { useState } from "react";
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, Modal } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import MealType from "./MealType";

import Icon from "react-native-vector-icons/FontAwesome6";
import Meal from "./Meal";

export default function Menu() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showCalendar, setShowCalendar] = useState(false);
    const [showMealType, setShowMealType] = useState(false);
    const [showMeal, setShowMeal] = useState(false);

    const formatDate = (date) => {
        return date.toLocaleDateString("en-GB", { weekday: 'long', day: 'numeric', month: 'long' });
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
            {/* Nutrition Values Section */}
            <View style={localStyles.nutritionContainer}>
                <Text style={localStyles.nutritionText}>Kcal: 0 | Protein: 0g | Fat: 0g | Carbs: 0g</Text>
                <TouchableOpacity onPress={() => setShowCalendar(true)}>
                    <AntDesign name="calendar" size={24} color="brown" />
                </TouchableOpacity>
            </View>

            {/* Date */}
            <View style={localStyles.dateContainer}>
                <TouchableOpacity onPress={() => changeDay(-1)}>
                    <AntDesign name="left" size={20} color="brown" />
                </TouchableOpacity>
                <Text style={localStyles.dateText}>{formatDate(selectedDate)}</Text>
                <TouchableOpacity onPress={() => changeDay(1)}>
                    <AntDesign name="right" size={20} color="brown" />
                </TouchableOpacity>
            </View>

            {/* Calendar */}
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

            {/* Meal List */}
            <ScrollView style={localStyles.mealList}>
                <Text style={localStyles.mealText}>No meals for this day</Text>
            </ScrollView>

            {/* Add Meal Button */}
            <TouchableOpacity style={localStyles.button} onPress={() => setShowMealType(true)}>
                <Icon name="bowl-food" size={20} color="white" style={localStyles.icon} />
                <Text style={localStyles.buttonText}>Add Meal</Text>
            </TouchableOpacity>

            {/* Modal for MealType */}
            <Modal
                visible={showMealType}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setShowMealType(false)}
            >
                <MealType onClose={() => setShowMealType(false)} onSubmit={() => { setShowMealType(false); setShowMeal(true); }} />

            </Modal>

            {/* Modal for Meal */}
            <Modal
                visible={showMeal}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setShowMeal(false)}
            >
                <Meal onClose={() => setShowMeal(false)} />
            </Modal>
            
        </View>
    );
}

const localStyles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#eee', paddingHorizontal: 20, paddingTop: 40 },
    header: { fontSize: 26, textAlign: 'center', color: 'brown', marginBottom: 20 },
    nutritionContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 10,
        elevation: 3
    },
    nutritionText: { fontSize: 16 },
    dateContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 15
    },
    dateText: { fontSize: 18, marginHorizontal: 10, color: 'brown' },
    mealList: { flex: 1 },
    mealText: { fontSize: 16, textAlign: 'center', marginTop: 20, color: 'gray' },
    submitButton: {
        backgroundColor: "#156dc9",
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 5,
        flex: 1,
        marginLeft: 5,
        alignItems: "center",
    },
    button: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "brown",
        paddingVertical: 15,
        paddingHorizontal: 20,
        marginVertical: 15,
        borderRadius: 8,
    },
    icon: {
        marginRight: 10,
    },
    buttonText: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
    },
    submitButtonText: {
        color: 'white',
        fontSize: 16,
    },
});
