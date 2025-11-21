import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { Image, StyleSheet, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Icon2 from "react-native-vector-icons/Feather";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "../components/context/AuthContext";
import { useAccessibility } from "./AccessibleView/AccessibleView";

import MoreStack from "../navigation/MoreStack";
import AuthNavigator from "../navigation/AuthNavigator";
import RecipesStack from "../navigation/RecipesStack";
import DietStack from "../navigation/DietStack";

const Tab = createBottomTabNavigator();

function Tabs() {
    const { user } = useAuth();
    const insets = useSafeAreaInsets(); // ✅ FIX

    return (
        <Tab.Navigator
            screenOptions={{
                headerTitle: () => (
                    <Image
                        source={require("../assets/logo.png")}
                        style={styles.logo}
                    />
                ),

                headerLeft: () => {
                    const { highContrast, setHighContrast } = useAccessibility();
                    return (
                        <TouchableOpacity
                            onPress={() => setHighContrast(prev => !prev)}
                            style={{ marginLeft: 15 }}
                        >
                            <Icon2
                                name={highContrast ? "sun" : "moon"}
                                size={20}
                                color={highContrast ? "#FFD700" : "white"}
                            />
                        </TouchableOpacity>
                    );
                },

                headerTitleAlign: "center",
                headerStyle: styles.header,

                // ✅ Safe & correct usage of safe area
                tabBarStyle: {
                    ...styles.tabBar,
                    paddingBottom: Math.max(insets.bottom, 10),
                    height: 70 + insets.bottom,
                },

                tabBarActiveTintColor: "#FFF",
                tabBarInactiveTintColor: "rgba(255,255,255,0.7)",
                tabBarShowLabel: true,
                tabBarLabelStyle: styles.tabLabel,
            }}
        >
            <Tab.Screen
                name="Diet"
                component={DietStack}
                options={{
                    tabBarIcon: ({ color }) => (
                        <Icon name="silverware" size={26} color={color} />
                    ),
                }}
            />

            <Tab.Screen
                name="Recipes"
                component={RecipesStack}
                options={{
                    tabBarIcon: ({ color }) => (
                        <Icon name="book-open" size={26} color={color} />
                    ),
                }}
            />

            {user ? (
                <Tab.Screen
                    name="Profile"
                    component={MoreStack}
                    options={{
                        tabBarIcon: ({ color }) => (
                            <Icon name="account" size={26} color={color} />
                        ),
                    }}
                />
            ) : (
                <Tab.Screen
                    name="Login"
                    component={AuthNavigator}
                    options={{
                        tabBarIcon: ({ color }) => (
                            <Icon name="login" size={26} color={color} />
                        ),
                    }}
                />
            )}
        </Tab.Navigator>
    );
}

export default function BottomNav() {
    return (
        <SafeAreaProvider>
            <NavigationContainer>
                <Tabs />
            </NavigationContainer>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    logo: {
        width: 120,
        height: 40,
        resizeMode: "contain",
        tintColor: "#FFF",
    },
    header: {
        backgroundColor: "#752122",
    },
    tabBar: {
        backgroundColor: "#752122",
        borderTopWidth: 0,
        paddingTop: 8,
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
    },
    tabLabel: {
        fontSize: 12,
        fontWeight: "600",
        marginBottom: 4,
        letterSpacing: 0.3,
    },
});
