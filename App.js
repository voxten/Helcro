import React from "react";
import { SafeAreaView } from "react-native";
import BottomNav from "./components/BottomNav";
import { AuthProvider } from './components/context/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <BottomNav />
      </SafeAreaView>
      </AuthProvider>
  );
}
