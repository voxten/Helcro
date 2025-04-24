import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    Image,
    ScrollView,
    StyleSheet,
    ActivityIndicator
} from "react-native";
import { useRoute } from "@react-navigation/native";
import axios from "axios";
import { API_BASE_URL } from '@env';
import { useAuth } from "../context/AuthContext";
import detailStyles from "./RecipesDetailStyles";
import Icon from "react-native-vector-icons/AntDesign";

const RecipeDetail = () => {
    const route = useRoute();
    const { recipe: initialRecipe, recipeId } = route.params;
    const { user } = useAuth();
    const [recipe, setRecipe] = useState(initialRecipe || null);
    const [loading, setLoading] = useState(!initialRecipe);
    const [error, setError] = useState(null);

    useEffect(() => {
        console.log("Initial recipe data:", initialRecipe);
        if (!initialRecipe && recipeId) {
            fetchRecipeDetails(recipeId);
        }
    }, []);

    const fetchRecipeDetails = async (id) => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/api/recipes/detail/${id}`, {
                headers: {
                    Authorization: `Bearer ${user?.token}`
                }
            });
            console.log("Fetched recipe details:", response.data);
            setRecipe(response.data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching recipe details:", err);
            setError("Failed to load recipe details");
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#5D4037" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Icon name="error-outline" size={40} color="#D32F2F" />
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    if (!recipe) {
        return (
            <View style={styles.errorContainer}>
                <Icon name="search-off" size={40} color="#5D4037" />
                <Text style={styles.errorText}>Recipe not found</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            {/* Recipe Header */}
            <View style={styles.header}>
                <Text style={styles.title}>{recipe.name || recipe.Name}</Text>
                <Text style={styles.author}>By {recipe.UserName}</Text>
            </View>

            {/* Hero Image */}
            <Image
                source={{ uri: recipe.Image }}
                style={styles.image}
                resizeMode="cover"
            />

            {/* Rating and Categories */}
            <View style={styles.metaContainer}>
                <View style={styles.ratingContainer}>
                    <Icon name="star" size={20} color="#FFC107" solid />
                    <Text style={styles.ratingText}>
                        {recipe.rating?.toFixed(1) || "4.5"}
                    </Text>
                </View>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoriesContainer}
                >
                    {(recipe.categories || []).map((category, index) => (
                        <View key={index} style={styles.categoryPill}>
                            <Text style={styles.categoryText}>{category}</Text>
                        </View>
                    ))}
                </ScrollView>
            </View>

            {/* Description */}
            {recipe.description && (
                <View style={styles.section}>
                    <Text style={styles.description}>{recipe.description}</Text>
                </View>
            )}

            {/* Nutrition Summary */}
            {recipe.totalNutrition && (
                <View style={styles.nutritionCard}>
                    <Text style={styles.sectionTitle}>Nutrition Facts</Text>
                    <View style={styles.divider} />

                    <View style={styles.nutritionGrid}>
                        <View style={styles.nutritionItem}>
                            <Text style={styles.nutritionValue}>
                                {Math.round(recipe.totalNutrition.calories || 0)}
                            </Text>
                            <Text style={styles.nutritionLabel}>Calories</Text>
                        </View>

                        <View style={styles.nutritionItem}>
                            <Text style={styles.nutritionValue}>
                                {Math.round(recipe.totalNutrition.proteins || 0)}g
                            </Text>
                            <Text style={styles.nutritionLabel}>Protein</Text>
                        </View>

                        <View style={styles.nutritionItem}>
                            <Text style={styles.nutritionValue}>
                                {Math.round(recipe.totalNutrition.fats || 0)}g
                            </Text>
                            <Text style={styles.nutritionLabel}>Fat</Text>
                        </View>

                        <View style={styles.nutritionItem}>
                            <Text style={styles.nutritionValue}>
                                {Math.round(recipe.totalNutrition.carbohydrates || 0)}g
                            </Text>
                            <Text style={styles.nutritionLabel}>Carbs</Text>
                        </View>
                    </View>
                </View>
            )}

            {/* Ingredients */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Ingredients</Text>
                <View style={styles.divider} />

                <View style={styles.ingredientsList}>
                    {(recipe.products || []).map((product, index) => (
                        <View key={index} style={styles.ingredientItem}>
                            <View style={styles.ingredientBullet} />
                            <Text style={styles.ingredientText}>
                                {product.name} <Text style={styles.ingredientAmount}>({product.amount}g)</Text>
                            </Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Instructions */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Instructions</Text>
                <View style={styles.divider} />

                <View style={styles.instructionsList}>
                    {(recipe.steps || []).map((step, index) => (
                        <View key={index} style={styles.stepItem}>
                            <View style={styles.stepNumberContainer}>
                                <Text style={styles.stepNumber}>{index + 1}</Text>
                            </View>
                            <Text style={styles.stepText}>{step}</Text>
                        </View>
                    ))}
                </View>
            </View>

            <View style={styles.bottomSpacer} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF8F6',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF8F6',
        padding: 20,
    },
    errorText: {
        fontSize: 18,
        color: '#5D4037',
        marginTop: 16,
        textAlign: 'center',
    },
    header: {
        padding: 24,
        paddingBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#5D4037',
        marginBottom: 4,
    },
    author: {
        fontSize: 16,
        color: '#8D6E63',
        fontStyle: 'italic',
    },
    image: {
        width: '100%',
        height: 280,
        backgroundColor: '#EFEBE9',
    },
    metaContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 16,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 20,
        paddingVertical: 6,
        paddingHorizontal: 12,
        elevation: 2,
    },
    ratingText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#5D4037',
        marginLeft: 6,
    },
    categoriesContainer: {
        flexDirection: 'row',
    },
    categoryPill: {
        backgroundColor: '#5D4037',
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginLeft: 8,
    },
    categoryText: {
        fontSize: 14,
        color: '#FFF',
        fontWeight: '500',
    },
    section: {
        padding: 24,
        paddingTop: 0,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '600',
        color: '#5D4037',
        marginBottom: 16,
    },
    divider: {
        height: 2,
        backgroundColor: '#D7CCC8',
        marginBottom: 16,
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
        color: '#5D4037',
    },
    nutritionCard: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        marginHorizontal: 24,
        marginBottom: 24,
        padding: 20,
        elevation: 3,
        shadowColor: '#5D4037',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    nutritionGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    nutritionItem: {
        width: '48%',
        alignItems: 'center',
        marginBottom: 16,
    },
    nutritionValue: {
        fontSize: 24,
        fontWeight: '700',
        color: '#5D4037',
    },
    nutritionLabel: {
        fontSize: 14,
        color: '#8D6E63',
        marginTop: 4,
    },
    ingredientsList: {
        marginTop: 8,
    },
    ingredientItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    ingredientBullet: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#5D4037',
        marginTop: 8,
        marginRight: 12,
    },
    ingredientText: {
        fontSize: 16,
        color: '#5D4037',
        flex: 1,
        lineHeight: 24,
    },
    ingredientAmount: {
        color: '#8D6E63',
    },
    instructionsList: {
        marginTop: 8,
    },
    stepItem: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    stepNumberContainer: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#5D4037',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    stepNumber: {
        color: '#FFF',
        fontWeight: '600',
        fontSize: 14,
    },
    stepText: {
        fontSize: 16,
        color: '#5D4037',
        flex: 1,
        lineHeight: 24,
    },
    bottomSpacer: {
        height: 40,
    },
});

export default RecipeDetail;