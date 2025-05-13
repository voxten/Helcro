import React, { useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet,ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/FontAwesome6";
import axios from "axios";
import { API_BASE_URL } from '@env';
import { useAccessibility } from "../AccessibleView/AccessibleView";
const RecipeCard = ({ recipe, onRatingUpdate }) => {
    const { highContrast } = useAccessibility();
    const navigation = useNavigation();
    const [currentRecipe, setCurrentRecipe] = useState(recipe);
    const [isLoading, setIsLoading] = useState(false);
    const [recipes, setRecipes] = useState([]);

    // Efekt do śledzenia zmian w propie recipe
    useEffect(() => {
        if (!currentRecipe?.averageRating) {
            refreshRecipeData(); // od razu ładuj oceny jak są puste
          }
        const loadRecipes = async () => {
          const res = await axios.get(`${API_BASE_URL}/api/recipes`);
          const enrichedRecipes = res.data.map(recipe => ({
            ...recipe,
            averageRating: recipe.averageRating || 0,
            ratingCount: recipe.ratingCount || 0
          }));
          setRecipes(enrichedRecipes);
        };
      
        loadRecipes();
      }, []);

    // Funkcja do odświeżania danych przepisu
    const refreshRecipeData = async () => {
        if (!currentRecipe?.RecipeId && !currentRecipe?.id) return;
        
        setIsLoading(true);
        try {
            const response = await axios.get(
                `${API_BASE_URL}/api/recipes/detail/${currentRecipe.RecipeId || currentRecipe.id}`
            );
            setCurrentRecipe(response.data);
            if (onRatingUpdate) {
                onRatingUpdate(response.data);
            }
        } catch (error) {
            console.error("Error refreshing recipe data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const photoSource = currentRecipe?.Image || currentRecipe?.photo
        ? { uri: currentRecipe.Image || currentRecipe.photo }
        : { uri: "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg" };

    const recipeName = currentRecipe?.Name || currentRecipe?.name || "Unnamed Recipe";

    return (
        <TouchableOpacity
    onPress={() => {
        // Najpierw odśwież dane przed nawigacją
        refreshRecipeData().then(() => {
            navigation.navigate("RecipeDetail", {
                recipeId: currentRecipe.RecipeId || currentRecipe.id,
                initialRecipe: {
                    ...currentRecipe,
                    Name: currentRecipe.Name || currentRecipe.name,
                    Image: currentRecipe.Image || currentRecipe.photo,
                    UserName: currentRecipe.UserName || currentRecipe.userName,
                    categories: currentRecipe.categories || []
                }
            });
        });
    }}
    activeOpacity={0.8}
    style={[styles.cardContainer, highContrast && styles.highContrastCardContainer]}
>
    <View style={[styles.card, highContrast && styles.highContrastCard]}>
        <Image source={photoSource} style={styles.image} />
        <View style={styles.content}>
            <Text numberOfLines={2} style={[styles.title, highContrast && styles.highContrastText]}>
                {recipeName}
            </Text>
            <View style={styles.ratingContainer}>
                {isLoading ? (
                    <ActivityIndicator size="small" color={highContrast ? "#FFFFFF" : "#FFC107"} />
                ) : (
                    <>
                        <Icon 
                            name="star" 
                            size={14} 
                            color={highContrast ? "#FFFFFF" : "#FFC107"} 
                            solid 
                        />
                        <Text style={[styles.ratingText, highContrast && styles.highContrastText]}>
                            {currentRecipe.averageRating 
                                ? parseFloat(currentRecipe.averageRating).toFixed(1) 
                                : 'Brak ocen'}
                        </Text>
                        <Text style={[styles.ratingCount, highContrast && styles.highContrastSecondaryText]}>
                            ({currentRecipe.ratingCount || 0})
                        </Text>
                    </>
                )}
            </View>
        </View>
    </View>
</TouchableOpacity>
    );
};

const styles = StyleSheet.create({
     highContrastCardContainer: {
        backgroundColor: '#121212',
    },
    highContrastCard: {
        borderColor: '#FFFFFF',
        borderWidth: 1,
    },
    highContrastText: {
        color: '#FFFFFF',
    },
    highContrastSecondaryText: {
        color: '#CCCCCC',
    },
    cardContainer: {
        width: '100%',
        marginBottom: 16,
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#5D4037',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    image: {
        width: '100%',
        height: 140,
        resizeMode: 'cover',
    },
    content: {
        padding: 12,
    },
    title: {
        fontSize: 15,
        fontWeight: '600',
        color: '#5D4037',
        marginBottom: 8,
        height: 40,
        lineHeight: 20,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        fontSize: 14,
        color: '#8D6E63',
        marginLeft: 6,
        minWidth: 30,
    },
    ratingCount: {
        fontSize: 12,
        color: '#8D6E63',
        marginLeft: 4,
    },
});

export default RecipeCard;