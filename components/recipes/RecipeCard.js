import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import styles2 from "./RecipesStyles";
import { useNavigation } from "@react-navigation/native";

const RecipeCard = ({ recipe }) => {
    const navigation = useNavigation();
    
    // Safely handle recipe data
    const photoSource = recipe?.Image 
        ? { uri: recipe.Image } 
        : { uri: "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg" };

    const recipeName = recipe?.Name || "Unnamed Recipe";

    return (
        <TouchableOpacity onPress={() => navigation.navigate("RecipeDetail", { recipe })}>
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