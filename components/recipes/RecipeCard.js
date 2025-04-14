import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import styles2 from "./RecipesStyles";

const RecipeCard = ({ recipe }) => {
    const navigation = useNavigation();
    
    const photoSource = recipe?.Image || recipe?.photo 
        ? { uri: recipe.Image || recipe.photo } 
        : { uri: "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg" };

    const recipeName = recipe?.Name || recipe?.name || "Unnamed Recipe";

    return (
        <TouchableOpacity 
            onPress={() => navigation.navigate("RecipeDetail", { 
                recipeId: recipe.RecipeId || recipe.id,
                initialRecipe: { // Pass minimal data for instant display
                    Name: recipe.Name || recipe.name,
                    Image: recipe.Image || recipe.photo,
                    UserName: recipe.UserName || recipe.userName,
                    rating: recipe.rating || 4.5,
                    categories: recipe.categories || []
                }
            })}
            activeOpacity={0.8}
        >
            <View style={styles2.recipeCard}>
                <Image source={photoSource} style={styles2.recipeImage} />
                <Text numberOfLines={2} ellipsizeMode="tail" style={styles2.recipeName}>
                    {recipeName}
                </Text>
                <Text style={styles2.recipeRating}>⭐ {recipe?.rating || "4.5"}</Text>
            </View>
        </TouchableOpacity>
    );
};

export default RecipeCard;