import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import RecipesList from "../components/recipes/RecipesList";
import RecipeDetail from "../components/recipes/RecipeDetail";
import RecipesAdd from "../components/recipes/RecipesAdd";
import { useAccessibility } from "../components/AccessibleView/AccessibleView";
const Stack = createStackNavigator();

export default function RecipesStack() {
    const { highContrast } = useAccessibility();
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
                    headerStyle: { backgroundColor: highContrast ?  "#454343":'#FFFFFF' },
                    headerTintColor: highContrast ?  "white":'black'
                }}
            />
            <Stack.Screen 
                name="RecipesAdd" 
                component={RecipesAdd} 
                options={{ 
                    title: 'Add Recipe',
                    headerStyle: { backgroundColor: highContrast ?  "#454343":'#FFFFFF'},
                    headerTintColor: highContrast ?  "white":'black'
                }} 
            />
        </Stack.Navigator>
    );
}