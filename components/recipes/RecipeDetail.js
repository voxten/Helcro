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
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    if (!recipe) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Recipe not found</Text>
            </View>
        );
    }

    console.log("Rendering recipe:", recipe);

    return (
        <ScrollView style={detailStyles.container}>
            <Text style={detailStyles.detailTitle}>{recipe.name || recipe.Name}</Text>
            <Text style={detailStyles.userName}>Added by: {recipe.UserName}</Text>
            
            <Image 
                source={{ uri: recipe.Image }} 
                style={detailStyles.detailImage} 
                resizeMode="cover"
            />
            
            <Text style={detailStyles.detailRating}>⭐ {recipe.rating || "4.5"}</Text>
            
            {/* Description */}
            {recipe.description && (
                <Text style={detailStyles.detailDescription}>{recipe.description}</Text>
            )}

            {/* Nutrition Summary Box */}
            {recipe.totalNutrition && (
                <View style={detailStyles.nutritionBox}>
                    <Text style={detailStyles.nutritionTitle}>Nutrition Summary</Text>
                    <View style={detailStyles.nutritionRow}>
                        <Text style={detailStyles.nutritionLabel}>Calories:</Text>
                        <Text style={detailStyles.nutritionValue}>
                            {Math.round(recipe.totalNutrition.calories || 0)} kcal
                        </Text>
                    </View>
                    <View style={detailStyles.nutritionRow}>
                        <Text style={detailStyles.nutritionLabel}>Proteins:</Text>
                        <Text style={detailStyles.nutritionValue}>
                            {Math.round(recipe.totalNutrition.proteins || 0)}g
                        </Text>
                    </View>
                    <View style={detailStyles.nutritionRow}>
                        <Text style={detailStyles.nutritionLabel}>Fats:</Text>
                        <Text style={detailStyles.nutritionValue}>
                            {Math.round(recipe.totalNutrition.fats || 0)}g
                        </Text>
                    </View>
                    <View style={detailStyles.nutritionRow}>
                        <Text style={detailStyles.nutritionLabel}>Carbs:</Text>
                        <Text style={detailStyles.nutritionValue}>
                            {Math.round(recipe.totalNutrition.carbohydrates || 0)}g
                        </Text>
                    </View>
                </View>
            )}

            {/* Categories */}
            <Text style={detailStyles.detailSection}>Categories:</Text>
            <View style={detailStyles.categoriesContainer}>
                {(recipe.categories || []).map((category, index) => (
                    <View key={index} style={detailStyles.categoryPill}>
                        <Text style={detailStyles.categoryText}>{category}</Text>
                    </View>
                ))}
            </View>

            {/* Ingredients */}
            <Text style={detailStyles.detailSection}>Ingredients:</Text>
            {(recipe.products || []).map((product, index) => (
                <View key={index} style={detailStyles.ingredientRow}>
                    <Text style={detailStyles.ingredientName}>
                        • {product.name} ({product.amount}g)
                    </Text>
                </View>
            ))}

            {/* Instructions */}
            <Text style={detailStyles.detailSection}>Instructions:</Text>
            {(recipe.steps || []).map((step, index) => (
                <View key={index} style={detailStyles.stepContainer}>
                    <Text style={detailStyles.stepNumber}>{index + 1}.</Text>
                    <Text style={detailStyles.stepText}>{step}</Text>
                </View>
            ))}

            <View style={detailStyles.bottomSpacer} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    errorText: {
        fontSize: 18,
        color: 'red'
    }
});

export default RecipeDetail;