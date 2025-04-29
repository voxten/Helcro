import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import Menu from '../components/menu/Menu';
import ProductDetail from '../components/menu/ProductDetail';

const Stack = createStackNavigator();

export default function DietStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: { backgroundColor: "white" },
                headerTintColor: "black"
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