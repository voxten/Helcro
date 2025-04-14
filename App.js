import React from "react";
import { SafeAreaView } from "react-native";
import BottomNav from "./components/BottomNav";
import { AuthProvider } from './components/context/AuthContext';
import { Provider as PaperProvider } from 'react-native-paper';

export default function App() {
  return (
    <AuthProvider>
        <PaperProvider>
          <SafeAreaView style={{ flex: 1 }}>
            <BottomNav />
          </SafeAreaView>
        </PaperProvider>
      </AuthProvider>
  );
}
