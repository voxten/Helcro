import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import RecipesList from "../components/recipes/RecipesList";
import RecipeDetail from "../components/recipes/RecipeDetail"; // Importujemy ekran RecipeDetail

const Stack = createStackNavigator();

export default function RecipesStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen name="RecipesList" component={RecipesList} options={{ title: "Recipes" }} />
            <Stack.Screen name="RecipeDetail" component={RecipeDetail} options={{ title: "Recipe Detail" }} />
        </Stack.Navigator>
    );
}
