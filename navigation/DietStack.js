import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import Menu from '../components/menu/Menu';
import ProductDetail from '../components/menu/ProductDetail';
import { useAccessibility } from "../components/AccessibleView/AccessibleView";
const Stack = createStackNavigator();

export default function DietStack() {
    const { highContrast } = useAccessibility();
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: { backgroundColor: highContrast ?  "#454343":'#FFFFFF' }, 
                headerTintColor: highContrast ?  "white":'black' 
            }}
        >
            <Stack.Screen
                name="Diet"
                component={Menu}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="ProductDetail"
                component={ProductDetail}
                options={{ title: 'Product Details' }}
            />
        </Stack.Navigator>
    );
}