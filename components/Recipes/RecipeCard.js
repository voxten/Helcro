import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import styles2 from "./RecipesStyles";
import { useNavigation } from "@react-navigation/native";

const RecipeCard = ({ recipe }) => {
    const navigation = useNavigation();
    return (
        <TouchableOpacity onPress={() => navigation.navigate("RecipeDetail", { recipe })}>
            <View style={styles2.recipeCard}>
                <Image source={recipe.photo} style={styles2.recipeImage} />
                <Text style={styles2.recipeName}>{recipe.name}</Text>
                <Text style={styles2.recipeRating}>⭐ {recipe.rating}</Text>
            </View>
        </TouchableOpacity>
    );
};

export default RecipeCard;