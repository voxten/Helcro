import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { View, Text } from "react-native";
import FontIcon from "react-native-vector-icons/FontAwesome";
import CommunityIcon from "react-native-vector-icons/MaterialCommunityIcons";
import Meal from "../components/Menu/meal";
import Menu from "../components/Menu/menu";
import MoreStack from "../navigation/MoreStack";
import AuthNavigator from "../components/navigation/AuthNavigator";

const RecipesScreen = () => <View><Text>Recipes Screen</Text></View>;
const MoreScreen = () => <View><Text>More Screen</Text></View>;

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
                    name="Meals"
                    component={Meal}
                    options={{
                        tabBarIcon: ({ color }) => <CommunityIcon name="food-apple" size={20} color={color} />,
                    }}
                />
                <Tab.Screen
                    name="Recipes"
                    component={RecipesScreen}
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
                        tabBarIcon: ({ color }) => <FontIcon name="bars" size={20} color={color} />,
                    }}
                />
            </Tab.Navigator>
        </NavigationContainer>
    );
}
