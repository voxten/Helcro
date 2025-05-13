import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { Image, View, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useAuth } from '../components/context/AuthContext';
import Menu from "./menu/Menu";
import MoreStack from "../navigation/MoreStack";
import AuthNavigator from "../navigation/AuthNavigator";
import RecipesStack from "../navigation/RecipesStack";
import DietStack from "../navigation/DietStack";
import { TouchableOpacity, Switch } from "react-native";
import { useAccessibility } from "./AccessibleView/AccessibleView";
import Icon1 from "react-native-vector-icons/FontAwesome6";
import Icon2 from 'react-native-vector-icons/Feather'; // lub FontAwesome, jeśli wolisz

const Tab = createBottomTabNavigator();

export default function BottomNav() {
    const { user } = useAuth();

    return (
        <NavigationContainer>
            <Tab.Navigator
                screenOptions={{
                   headerTitle: () => (
                    <Image
                        source={require('../assets/logo.png')}
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

                    
                    headerTitleAlign: 'center',
                    headerStyle: styles.header,
                    tabBarStyle: styles.tabBar,
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
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    logo: {
        width: 120,
        height: 40,
        resizeMode: 'contain',
        tintColor: '#FFF'
    },
    header: {
        backgroundColor: '#752122',
    },
    tabBar: {
        backgroundColor: '#752122',
        height: 70,
        borderTopWidth: 0,
        paddingBottom: 8,
        paddingTop: 8,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
    },
    tabLabel: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 4,
        letterSpacing: 0.3,
    },
    activeIndicator: {
        position: 'absolute',
        top: -8,
        height: 3,
        width: '50%',
        backgroundColor: '#FFF',
        borderBottomLeftRadius: 3,
        borderBottomRightRadius: 3,
    },
});