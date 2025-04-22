import React, { createContext, useState, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const login = async (token, userData) => {
    // Przekształć obiekt userData, aby używał spójnych nazw pól
    const fullUserData = {
      UserId: userData.UserId,       // Mapowanie UserId → id
      Email: userData.Email,
      UserName: userData.UserName,
      Height: userData.Height,
      Weight: userData.Weight,
      Gender: userData.Gender,
      Birthday: userData.Birthday
    };
  
    setToken(token);
    setUser(fullUserData); // Zapisujemy pełne dane
    await AsyncStorage.setItem('userToken', token);
    await AsyncStorage.setItem('userData', JSON.stringify(fullUserData));
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userData');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);