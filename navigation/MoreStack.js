import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import MoreScreen from "./MoreScreen";
import ProfileScreen from "../components/Profile/ProfileScreen";
import DietaryGoalsScreen from "../components/Profile/DietaryGoalsScreen";
import WeightHistoryScreen from "../components/Profile/WeightHistoryScreen";

const Stack = createStackNavigator();

export default function MoreStack() {
    return (
        <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: "white" }, headerTintColor: "black" }}>
            <Stack.Screen name="More" component={MoreScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="Dietary Goals" component={DietaryGoalsScreen} />
            <Stack.Screen name="Weight History" component={WeightHistoryScreen} />
        </Stack.Navigator>
    );
}
