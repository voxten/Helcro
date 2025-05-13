import React from "react";
import { SafeAreaView } from "react-native";
import BottomNav from "./components/BottomNav";
import { AuthProvider } from './components/context/AuthContext';
import { Provider as PaperProvider } from 'react-native-paper';
import { AccessibilityProvider } from "./components/AccessibleView/AccessibleView";

export default function App() {
  return (
    <AccessibilityProvider>
    <AuthProvider>
        <PaperProvider>
          <SafeAreaView style={{ flex: 1 }}>
            <BottomNav />
          </SafeAreaView>
        </PaperProvider>
      </AuthProvider>
      </AccessibilityProvider>
  );
}
