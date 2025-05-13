import { ScrollView, StyleSheet, Text, View, TouchableOpacity, Modal, Image } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import MealType from "./MealType";
import Icon from "react-native-vector-icons/FontAwesome6";
import Meal from "./Meal";
import MealActions from './MealActions';
import React, { useEffect, useState } from "react";
import { useIsFocused } from '@react-navigation/native';

import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { API_BASE_URL } from '@env';

import { useAccessibility } from "../AccessibleView/AccessibleView";




export default function Menu({ navigation }) {
    const { user } = useAuth();
    const isFocused = useIsFocused();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showCalendar, setShowCalendar] = useState(false);
    const [showMealType, setShowMealType] = useState(false);
    const [showMeal, setShowMeal] = useState(false);
    const [meals, setMeals] = useState([]);
    const [expandedMeal, setExpandedMeal] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showProductDetail, setShowProductDetail] = useState(false);
    const [targetNutrition, setTargetNutrition] = useState({
        calories: 1500,
        proteins: 100,
        fats: 50,
        carbohydrates: 200
    });
    useEffect(() => {
        const fetchUserGoals = async () => {
            if (!user?.UserId) return;
            
            try {
                const response = await axios.get(`${API_BASE_URL}/api/goal/${user.UserId}`);
                if (response.data) {
                    setTargetNutrition({
                        calories: parseFloat(response.data.DailyCalories) || 1500,
                        proteins: parseFloat(response.data.DailyProteins) || 100,
                        fats: parseFloat(response.data.DailyFats) || 50,
                        carbohydrates: parseFloat(response.data.DailyCarbs) || 200
                    });
                } else {
                    setTargetNutrition({
                        calories: 1500,
                        proteins: 100,
                        fats: 50,
                        carbohydrates: 200
                    });
                }
            } catch (error) {
                if (error.response?.status !== 404) {
                    console.error("Error fetching user goals:", error);
                }
                setTargetNutrition({
                    calories: 1500,
                    proteins: 100,
                    fats: 50,
                    carbohydrates: 200
                });
            }
        };
    
        if (isFocused) {
            fetchUserGoals();
        }
    }, [user?.UserId, isFocused]);

    useEffect(() => {
        if (!user) {
            setMeals([]);
            return; // Exit early, don't try to fetch
        }

        const fetchMealsForDate = async () => {
            try {
                if (user && selectedDate) {
                    const formattedDate = selectedDate.toISOString().split('T')[0];

                    const response = await axios.get(`${API_BASE_URL}/intakeLog`, {
                        params: {
                            userId: user.UserId,
                            date: formattedDate
                        }
                    });

                    const fetchedMeals = response.data?.meals || [];

                    setMeals(fetchedMeals.map(meal => ({
                        ...meal,
                        id: meal.id || meal.mealId, // Ensure we have the id
                        time: new Date(),
                        date: formattedDate
                    })));

                }
            } catch (error) {
                console.error("Error fetching intake log:", {
                    message: error.message,
                    response: error.response?.data,
                    config: error.config
                });
                setMeals([]);
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

    const handleAddMeal = async (mealType, mealTime, mealName) => {
        const mealTitle = mealType === 'Other' ? mealName : mealType;

        // For "Other" meals, we need to check both type AND name
        const existingMealIndex = meals.findIndex(meal =>
            meal.type === mealType &&
            (mealType !== 'Other' || meal.name === mealName)
        );

        if (existingMealIndex >= 0) {
            setExpandedMeal(mealType + existingMealIndex);
            setShowMealType(false);
            setShowMeal(true);
        } else {
            try {
                // Create new meal object
                const newMeal = {
                    type: mealType,
                    name: mealTitle,
                    time: mealTime,
                    products: []
                };

                setMeals([...meals, newMeal]);
                setShowMealType(false);
                setExpandedMeal(mealType + meals.length);
                setShowMeal(true);
            } catch (error) {
                console.error("Error creating meal:", error);
                setMeals(meals.filter(m => m.name !== mealTitle));
            }
        }
    };

    const handleAddProducts = (newProducts, shouldRefresh = false) => {
        if (shouldRefresh) {
            // If we need to refresh, refetch the data for the current date
            const fetchData = async () => {
                try {
                    if (user && selectedDate) {
                        const formattedDate = selectedDate.toISOString().split('T')[0];
                        const response = await axios.get(`${API_BASE_URL}/intakeLog`, {
                            params: {
                                userId: user.UserId,
                                date: formattedDate
                            }
                        });

                        const fetchedMeals = response.data?.meals || [];
                        setMeals(fetchedMeals.map(meal => ({
                            ...meal,
                            id: meal.id || meal.mealId,
                            time: new Date(),
                            date: formattedDate
                        })));
                    }
                } catch (error) {
                    console.error("Error refreshing intake log:", error);
                }
            };
            fetchData();
        } else {
            // Original logic for adding products without refresh
            setMeals(prevMeals => {
                if (expandedMeal) {
                    return prevMeals.map(meal => {
                        if (meal.type + prevMeals.indexOf(meal) === expandedMeal) {
                            const existingProductIds = meal.products.map(p => p.ProductId || p.productId);
                            const uniqueNewProducts = newProducts.filter(
                                newProd => !existingProductIds.includes(newProd.ProductId || newProd.productId)
                            );
                            return {
                                ...meal,
                                products: [...meal.products, ...uniqueNewProducts]
                            };
                        }
                        return meal;
                    });
                } else {
                    const updatedMeals = [...prevMeals];
                    if (updatedMeals.length > 0) {
                        const lastMealIndex = updatedMeals.length - 1;
                        const existingProductIds = updatedMeals[lastMealIndex].products.map(
                            p => p.ProductId || p.productId
                        );
                        const uniqueNewProducts = newProducts.filter(
                            newProd => !existingProductIds.includes(newProd.ProductId || newProd.productId)
                        );
                        updatedMeals[lastMealIndex] = {
                            ...updatedMeals[lastMealIndex],
                            products: [...updatedMeals[lastMealIndex].products, ...uniqueNewProducts]
                        };
                    }
                    return updatedMeals;
                }
            });
        }
        setShowMeal(false);
    };

    const calculateTotalNutrition = (products) => {
        return products.reduce((acc, product) => {
            // Use the pre-calculated values from the server
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

    const handleMealCopied = (products, newMeal) => {
        setMeals(prevMeals =>
            prevMeals.map(m =>
                m.id === newMeal.id
                    ? { ...m, products: products, name: newMeal.name }
                    : m
            )
        );
    };

    const NutritionSlider = ({ label, current, target }) => {
        const percentage = Math.min((current / target) * 100, 100);
        const sliderWidth = 85;

        return (
            <View style={[localStyles.sliderContainer, { width: sliderWidth }]}>
                <Text
                    style={[localStyles.sliderLabel, highContrast && localStyles.nutritionContrast]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                >
                    {`${label}: ${Math.round(current)}/${target}`}
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
    const { highContrast } = useAccessibility();
    return (
        
        <View style={[localStyles.container, highContrast && localStyles.highContrastBackground]}>
    <View style={[localStyles.nutritionContainer, highContrast && localStyles.highContrastBox]}>
        <View style={[localStyles.nutritionFooter, highContrast && localStyles.nutritionContrast]}>
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

    <View style={localStyles.dateContainer}>
        <TouchableOpacity onPress={() => changeDay(-1)}>
            <AntDesign name="left" size={20} color={highContrast ? "#FFF" : "brown"} />
        </TouchableOpacity>
        <Text style={[localStyles.dateText, highContrast && { color: '#FFF' }]}>
            {formatDate(selectedDate)}
        </Text>
        <TouchableOpacity onPress={() => changeDay(1)}>
            <AntDesign name="right" size={20} color={highContrast ? "#FFF" : "brown"} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowCalendar(true)}>
            <AntDesign name="calendar" size={24} color={highContrast ? "#FFF" : "brown"} />
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
                                    <MealActions
                                        meal={meal}
                                        onMealDeleted={(deletedMealId) => {
                                            setMeals(meals.filter(m => m.id !== deletedMealId));
                                        }}
                                        onMealRenamed={(mealId, newName) => {
                                            setMeals(meals.map(m =>
                                                m.id === mealId ? {...m, name: newName} : m
                                            ));
                                        }}
                                        onMealCopied={handleMealCopied}
                                        hasProducts={meal.products && meal.products.length > 0}
                                    />
                                    <TouchableOpacity
                                        style={localStyles.addButton}
                                        onPress={() => {
                                            if (expandedMeal !== meal.type + index) {
                                                setExpandedMeal(meal.type + index);
                                            }
                                            setShowMeal(true);
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
                                            <TouchableOpacity
                                                key={`${index}-${productIndex}`}
                                                style={localStyles.productItem}
                                                onPress={() => navigation.navigate('ProductDetail', { product })}
                                            >
                                                {product.image && (
                                                    <Image
                                                        source={{ uri: product.image || "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg" }}
                                                        style={localStyles.productImage}
                                                        resizeMode="contain"
                                                    />
                                                )}
                                                <View style={localStyles.productTextContainer}>
                                                    <Text style={[localStyles.productName, highContrast && localStyles.nutritionContrast]}>
                                                        {product.product_name} ({product.grams}g)
                                                    </Text>
                                                    <Text style={localStyles.productDetails}>
                                                        {product.calories} kcal | {product.proteins}g protein | {product.fats}g fat | {product.carbohydrates}g carbs
                                                    </Text>
                                                </View>
                                            </TouchableOpacity>
                                        ))
                                    )}
                                </View>
                            )}
                        </View>
                    ))
                )}
            </ScrollView>

            <TouchableOpacity
                style={localStyles.button}
                onPress={() => {
                    setShowMealType(true);
                    // Reset expanded meal when adding a new meal
                    setExpandedMeal(null);
                }}
            >
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
                    onSave={(newProducts, shouldRefresh) => handleAddProducts(newProducts, shouldRefresh)}
                    existingProducts={
                        expandedMeal !== null ?
                            meals.find(meal => meal.type + meals.indexOf(meal) === expandedMeal)?.products || []
                            : meals[meals.length - 1]?.products || []
                    }
                    selectedDate={selectedDate}
                    mealType={
                        expandedMeal !== null ?
                            meals.find(meal => meal.type + meals.indexOf(meal) === expandedMeal)?.type
                            : meals[meals.length - 1]?.type
                    }
                    mealName={
                        expandedMeal !== null ?
                            meals.find(meal => meal.type + meals.indexOf(meal) === expandedMeal)?.name
                            : meals[meals.length - 1]?.name
                    }
                />
            </Modal>
        </View>
    );
}

const localStyles = StyleSheet.create({
    nutritionContrast: {
        backgroundColor: "#454343",
        color:'white',
    },
    highContrastBackground: {
        backgroundColor: '#2e2c2c', 
    },
    nutritionContainer:{
    },  
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
        elevation: 3,
        
    },
    sliderContainer: {
        
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
    dateText: {
        fontSize: 18,
        marginHorizontal: 10,
        color: 'brown',
        textAlign: 'center',
        width: 220, // Fixed width to accommodate the widest expected date
    },
    mealList: {
        flex: 1,
        marginBottom: 10
    },
    mealText: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
        color: 'gray'
    },
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