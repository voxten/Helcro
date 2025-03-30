import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import FontIcon from "react-native-vector-icons/FontAwesome";
import Font5Icon from "react-native-vector-icons/FontAwesome5";
import Menu from "./menu/Menu";
import MoreStack from "../navigation/MoreStack";
import AuthNavigator from "../navigation/AuthNavigator";
import RecipesStack from "../navigation/RecipesStack";
import { useAuth } from '../components/context/AuthContext';

// Create bottom tab navigator
const Tab = createBottomTabNavigator();

export default function BottomNav() {
    return (
        <NavigationContainer>
            <Tab.Navigator
                screenOptions={{
                    headerTitle: "HELCRO",
                    headerTitleStyle: { color: 'white' },
                    headerStyle: { backgroundColor: 'brown' },
                    tabBarStyle: { backgroundColor: "black", height: 60 },
                    tabBarActiveTintColor: "white",
                    tabBarInactiveTintColor: "gray",
                    tabBarShowLabel: true,
                }}
            >
                <Tab.Screen
                    name="Menu"
                    component={Menu}
                    options={{
                        tabBarIcon: ({ color }) => <FontIcon name="cutlery" size={20} color={color} />,
                    }}
                />
                <Tab.Screen
                    name="Recipes"
                    component={RecipesStack} // <--- Zmienione z RecipesList na RecipesStack
                    options={{
                        tabBarIcon: ({ color }) => <FontIcon name="book" size={20} color={color} />,
                    }}
                />
                <Tab.Screen
                    name="More"
                    component={MoreStack}
                    options={{
                        tabBarIcon: ({ color }) => <FontIcon name="bars" size={20} color={color} />,
                    }}
                />
                <Tab.Screen
                    name="Auth"
                    component={AuthNavigator}
                    options={{
                        tabBarIcon: ({ color }) => <Font5Icon name="key" size={20} color={color} />,
                    }}
                />
            </Tab.Navigator>
        </NavigationContainer>
    );
}
