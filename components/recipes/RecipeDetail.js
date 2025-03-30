import React from "react";
import { View, Text, Image, ScrollView } from "react-native";
import { useRoute } from "@react-navigation/native";
import detailStyles from "./RecipesDetailStyles";

const RecipeDetail = () => {
    const route = useRoute();
    const { recipe } = route.params;

    return (
        <ScrollView style={detailStyles.container}>
            <Text style={detailStyles.detailTitle}>{recipe.name}</Text>
            <Image source={recipe.photo} style={detailStyles.detailImage} />
            <Text style={detailStyles.detailRating}>⭐ {recipe.rating}</Text>
            <Text style={detailStyles.detailDescription}>{recipe.description}</Text>

            <Text style={detailStyles.detailSection}>Categories:</Text>
            {recipe.categories.map((category, index) => (
                <Text key={index} style={detailStyles.detailCategory}>{category}</Text>
            ))}

            <Text style={detailStyles.detailSection}>Ingredients:</Text>
            {recipe.products.map((product, index) => (
                <Text key={index} style={detailStyles.detailIngredient}>
                    {product.amount} {product.name}
                </Text>
            ))}

            {/* Przepis krok po kroku */}
            <Text style={detailStyles.detailSection}>Instructions:</Text>
            {recipe.steps.map((step, index) => (
                <Text key={index} style={detailStyles.detailStep}>
                    {index + 1}. {step}
                </Text>
            ))}

            <View style={detailStyles.bottom} />
        </ScrollView>
    );
};

export default RecipeDetail;
