import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import MoreScreen from "./MoreScreen";
import ProfileScreen from "../components/profile/ProfileScreen";
import DietaryGoalsScreen from "../components/profile/DietaryGoalsScreen";
import WeightHistoryScreen from "../components/profile/WeightHistoryScreen";
import LogoutScreen from "../components/screens/auth/LogoutScreen";
import ChangePasswordScreen from "../components/screens/auth/ChangePasswordScreen";
import ExportDataScreen from "../components/export/ExportDataScreen";

const Stack = createStackNavigator();

export default function MoreStack() {
    return (
        <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: "white" }, headerTintColor: "black" }}>
            <Stack.Screen name="More" component={MoreScreen} />
            <Stack.Screen name="User Profile" component={ProfileScreen} />
            <Stack.Screen name="Dietary Goals" component={DietaryGoalsScreen} />
            <Stack.Screen name="Weight History" component={WeightHistoryScreen} />
            <Stack.Screen name="Export Data" component={ExportDataScreen} />
            <Stack.Screen name="Logout" component={LogoutScreen} />
            <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ title: 'Change Password' }}/>
        </Stack.Navigator>
    );
}