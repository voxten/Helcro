import { ScrollView, StyleSheet, Text, View, TouchableOpacity, Modal, Image, Slider } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import MealType from "./MealType";
import styles from "../../styles/MainStyles";
import Icon from "react-native-vector-icons/FontAwesome6";
import Meal from "./Meal";
import React, { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { API_BASE_URL } from '@env';

export default function Menu() {
    const { user } = useAuth();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showCalendar, setShowCalendar] = useState(false);
    const [showMealType, setShowMealType] = useState(false);
    const [showMeal, setShowMeal] = useState(false);
    const [meals, setMeals] = useState([]);
    const [expandedMeal, setExpandedMeal] = useState(null);
    const [targetNutrition, setTargetNutrition] = useState({
        calories: 1500,
        proteins: 100,
        fats: 50,
        carbohydrates: 200
    });

    // In your Menu component
    useEffect(() => {
        const fetchMealsForDate = async () => {
            try {
                if (user && selectedDate) {
                    const formattedDate = selectedDate.toISOString().split('T')[0];
                    const response = await axios.get(`${API_BASE_URL}/intakeLog`, {
                        params: {
                            userId: user.id,
                            date: formattedDate
                        }
                    });

                    // Ensure we always have an array, even if empty
                    const fetchedMeals = response.data?.meals || [];

                    // Update state with properly formatted meals
                    setMeals(fetchedMeals.map(meal => ({
                        ...meal,
                        time: new Date(meal.time) // Ensure time is Date object
                    })));
                }
            } catch (error) {
                console.error("Error fetching intake log:", error);
                setMeals([]); // Reset to empty array on error
            }
        };

        fetchMealsForDate();
    }, [selectedDate, user]);

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

    const toggleMeal = (mealId) => {
        setExpandedMeal(expandedMeal === mealId ? null : mealId);
    };

// Update handleAddMeal to potentially save to database immediately
    const handleAddMeal = async (mealType, mealTime, mealName) => {
        const mealTitle = mealType === 'Other' ? mealName : mealType;

        // Check if meal of this type already exists
        const existingMealIndex = meals.findIndex(meal =>
            meal.type === mealType &&
            (mealType !== 'Other' || meal.name === mealName)
        );

        if (existingMealIndex >= 0) {
            setShowMealType(false);
            setShowMeal(true);
        } else {
            try {
                // Create new meal object for local state first
                const newMeal = {
                    type: mealType,
                    name: mealTitle,
                    time: mealTime,
                    products: []
                };

                // Update local state immediately for better UX
                setMeals([...meals, newMeal]);
                setShowMealType(false);
                setShowMeal(true);

                // The actual database save will happen when products are added
                // via the saveIntakeLog function in the Meal component
            } catch (error) {
                console.error("Error creating meal:", error);
                // Rollback local state if needed
                setMeals(meals.filter(m => m.name !== mealTitle));
            }
        }
    };


    const handleAddProducts = (newProducts) => {
        if (meals.length > 0) {
            const updatedMeals = [...meals];
            const lastMealIndex = updatedMeals.length - 1;

            // Check if this meal type already exists (excluding the last one we just created)
            const existingMealIndex = meals.findIndex((meal, index) =>
                index !== lastMealIndex &&
                meal.type === updatedMeals[lastMealIndex].type &&
                (meal.type !== 'Other' || meal.name === updatedMeals[lastMealIndex].name)
            );

            if (existingMealIndex >= 0) {
                // Append new products to existing meal
                updatedMeals[existingMealIndex].products = [
                    ...updatedMeals[existingMealIndex].products,
                    ...newProducts
                ];
                // Remove the newly created empty meal
                updatedMeals.splice(lastMealIndex, 1);
            } else {
                // Add products to the new meal
                updatedMeals[lastMealIndex].products = [
                    ...updatedMeals[lastMealIndex].products,
                    ...newProducts
                ];
            }

            setMeals(updatedMeals);
        }
        setShowMeal(false);
    };

    const calculateTotalNutrition = (products) => {
        return products.reduce((acc, product) => {
            return {
                calories: acc.calories + parseFloat(product.calories || 0),
                proteins: acc.proteins + parseFloat(product.proteins || 0),
                fats: acc.fats + parseFloat(product.fats || 0),
                carbohydrates: acc.carbohydrates + parseFloat(product.carbohydrates || 0)
            };
        }, { calories: 0, proteins: 0, fats: 0, carbohydrates: 0 });
    };

    const totalNutrition = calculateTotalNutrition(
        meals.flatMap(meal => meal.products)
    );


    const NutritionSlider = ({ label, current, target }) => {
        const percentage = Math.min((current / target) * 100, 100);
        const sliderWidth = 85; // Slightly wider to accommodate text

        return (
            <View style={[localStyles.sliderContainer, { width: sliderWidth }]}>
                <Text
                    style={localStyles.sliderLabel}
                    numberOfLines={1}  // Prevent text wrapping
                    ellipsizeMode="tail"  // Add ... if text is too long
                >
                    {`${label}: ${current.toFixed(0)}/${target}`}
                </Text>
                <View style={localStyles.sliderTrack}>
                    <View
                        style={[
                            localStyles.sliderFill,
                            {
                                width: `${percentage}%`,
                                backgroundColor: percentage >= 100 ? '#ff4444' : '#4CAF50'
                            }
                        ]}
                    />
                </View>
            </View>
        );
    };

    return (
        <View style={localStyles.container}>


            <View style={localStyles.dateContainer}>
                <TouchableOpacity onPress={() => changeDay(-1)}>
                    <AntDesign name="left" size={20} color="brown" />
                </TouchableOpacity>
                <Text style={localStyles.dateText}>{formatDate(selectedDate)}</Text>
                <TouchableOpacity onPress={() => changeDay(1)}>
                    <AntDesign name="right" size={20} color="brown" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowCalendar(true)}>
                    <AntDesign name="calendar" size={24} color="brown" />
                </TouchableOpacity>
            </View>

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

            <View style={localStyles.nutritionContainer}>
                <View style={localStyles.nutritionFooter}>
                    <NutritionSlider
                        label="Kcal"
                        current={totalNutrition.calories || 0}
                        target={targetNutrition.calories}
                    />
                    <NutritionSlider
                        label="Protein"
                        current={totalNutrition.proteins || 0}
                        target={targetNutrition.proteins}
                    />
                    <NutritionSlider
                        label="Fat"
                        current={totalNutrition.fats || 0}
                        target={targetNutrition.fats}
                    />
                    <NutritionSlider
                        label="Carbs"
                        current={totalNutrition.carbohydrates || 0}
                        target={targetNutrition.carbohydrates}
                    />
                </View>
            </View>

            <ScrollView style={localStyles.mealList}>
                {meals.length === 0 ? (
                    <Text style={localStyles.mealText}>No meals for this day</Text>
                ) : (
                    meals.map((meal, index) => (
                        <View key={index} style={localStyles.mealContainer}>
                            <TouchableOpacity
                                style={localStyles.mealHeader}
                                onPress={() => toggleMeal(meal.type + index)}
                            >
                                <View style={localStyles.mealHeaderLeft}>
                                    <Text style={localStyles.mealName}>{meal.name}</Text>
                                    <Text style={localStyles.mealTime}>
                                        {new Date(meal.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                </View>
                                <View style={localStyles.mealHeaderRight}>
                                    <TouchableOpacity
                                        style={localStyles.addButton}
                                        onPress={() => {
                                            // Find the current expanded meal
                                            const currentMeal = meals.find(meal =>
                                                meal.type + meals.indexOf(meal) === expandedMeal
                                            );

                                            if (currentMeal) {
                                                // Set the meal type to match the current meal
                                                setShowMealType(false);
                                                setShowMeal(true);
                                            }
                                        }}
                                    >
                                        <Text style={localStyles.addButtonText}>+</Text>
                                    </TouchableOpacity>
                                    <AntDesign
                                        name={expandedMeal === meal.type + index ? "up" : "down"}
                                        size={16}
                                        color="brown"
                                    />
                                </View>
                            </TouchableOpacity>

                            {expandedMeal === meal.type + index && (
                                <View style={localStyles.mealContent}>
                                    {meal.products.length === 0 ? (
                                        <Text style={localStyles.noProductsText}>No products added</Text>
                                    ) : (
                                        meal.products.map((product, productIndex) => (
                                            <View key={`${index}-${productIndex}`} style={localStyles.productItem}>
                                                {product.image && (
                                                    <Image
                                                        source={{ uri: product.image }}
                                                        style={localStyles.productImage}
                                                        resizeMode="contain"
                                                    />
                                                )}
                                                <View style={localStyles.productTextContainer}>
                                                    <Text style={localStyles.productName}>
                                                        {product.product_name} ({product.grams}g)
                                                    </Text>
                                                    <Text style={localStyles.productDetails}>
                                                        {product.calories} kcal | {product.proteins}g protein | {product.fats}g fat | {product.carbohydrates}g carbs
                                                    </Text>
                                                </View>
                                            </View>
                                        ))
                                    )}
                                </View>
                            )}
                        </View>
                    ))
                )}
            </ScrollView>

            <TouchableOpacity style={localStyles.button} onPress={() => setShowMealType(true)}>
                <Icon name="bowl-food" size={20} color="white" style={localStyles.icon} />
                <Text style={localStyles.buttonText}>Add Meal</Text>
            </TouchableOpacity>

            <Modal
                visible={showMealType}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setShowMealType(false)}
            >
                <MealType
                    onClose={() => setShowMealType(false)}
                    onSubmit={(mealType, mealTime, mealName) =>
                        handleAddMeal(mealType, mealTime, mealName)
                    }
                />
            </Modal>


            <Modal
                visible={showMeal}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setShowMeal(false)}
            >
                <Meal
                    onClose={() => setShowMeal(false)}
                    onSave={(newProducts) => handleAddProducts(newProducts)}
                    existingProducts={
                        expandedMeal ?
                            meals.find(meal => meal.type + meals.indexOf(meal) === expandedMeal)?.products || []
                            : []
                    }
                    selectedDate={selectedDate}
                    mealType={
                        expandedMeal ?
                            meals.find(meal => meal.type + meals.indexOf(meal) === expandedMeal)?.type
                            : meals[meals.length - 1]?.type
                    }
                    mealName={
                        expandedMeal ?
                            meals.find(meal => meal.type + meals.indexOf(meal) === expandedMeal)?.name
                            : meals[meals.length - 1]?.name
                    }
                />
            </Modal>
        </View>
    );
}

const localStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#eee',
        paddingHorizontal: 20,
        paddingTop: 40
    },
    header: {
        fontSize: 26,
        textAlign: 'center',
        color: 'brown',
        marginBottom: 20
    },
    nutritionFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 10,
        marginBottom: 10,
        elevation: 3
    },
    sliderContainer: {
        marginHorizontal: 2,
    },
    sliderLabel: {
        fontSize: 12,
        marginBottom: 4,
        textAlign: 'center',
        flexShrink: 1, // Allows text to shrink if needed
        width: '100%', // Ensures text container takes full width
    },
    sliderTrack: {
        height: 6,
        backgroundColor: '#e0e0e0',
        borderRadius: 3,
        overflow: 'hidden',
    },
    sliderFill: {
        height: '100%',
        borderRadius: 3,
    },
    dateContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 15
    },
    dateText: { fontSize: 18, marginHorizontal: 10, color: 'brown' },
    mealList: { flex: 1, marginBottom: 10 },
    mealText: { fontSize: 16, textAlign: 'center', marginTop: 20, color: 'gray' },
    mealContainer: {
        backgroundColor: '#fff',
        borderRadius: 10,
        marginBottom: 10,
        overflow: 'hidden',
        elevation: 2
    },
    mealHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee'
    },
    mealHeaderLeft: {
        flex: 1
    },
    mealHeaderRight: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    mealName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'brown'
    },
    mealTime: {
        fontSize: 14,
        color: '#666',
        marginTop: 5
    },
    addButton: {
        backgroundColor: 'brown',
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        lineHeight: 20
    },
    mealContent: {
        padding: 15
    },
    productItem: {
        flexDirection: 'row',
        marginBottom: 10,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        alignItems: 'center'
    },
    productImage: {
        width: 40,
        height: 40,
        borderRadius: 5,
        marginRight: 10
    },
    productName: {
        fontSize: 14,
        fontWeight: '500'
    },
    productDetails: {
        fontSize: 12,
        color: '#666',
        marginTop: 3
    },
    productTextContainer: {
        flex: 1
    },
    noProductsText: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center'
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
    }
});