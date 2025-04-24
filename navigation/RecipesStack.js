import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import RecipesList from "../components/recipes/RecipesList";
import RecipeDetail from "../components/recipes/RecipeDetail";
import RecipesAdd from "../components/recipes/RecipesAdd";

const Stack = createStackNavigator();

export default function RecipesStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen 
                name="RecipesList" 
                component={RecipesList} 
                options={{ 
                    headerShown: false // This hides the header for RecipesList
                }} 
            />
            <Stack.Screen 
                name="RecipeDetail" 
                component={RecipeDetail} 
                options={{ 
                    title: "Recipe Detail",
                    headerStyle: { backgroundColor: 'white' },
                    headerTintColor: 'black'
                }}
            />
            <Stack.Screen 
                name="RecipesAdd" 
                component={RecipesAdd} 
                options={{ 
                    title: 'Add Recipe',
                    headerStyle: { backgroundColor: 'white' },
                    headerTintColor: 'black'
                }} 
            />
        </Stack.Navigator>
    );
}