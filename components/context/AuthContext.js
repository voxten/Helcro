import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // Add useEffect to load user data on app start
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('userToken');
        const storedUser = await AsyncStorage.getItem('userData');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
      }
    };

    loadUserData();
  }, []);

  const login = async (token, userData) => {
    try {
      const fullUserData = {
        UserId: userData.UserId,
        Email: userData.Email,
        UserName: userData.UserName,
        Height: userData.Height,
        Weight: userData.Weight,
        Gender: userData.Gender,
        Birthday: userData.Birthday,
        AvatarImage: userData.AvatarImage
      };

      setToken(token);
      setUser(fullUserData);
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(fullUserData));
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      setToken(null);
      setUser(null);
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const updateAvatar = async (newAvatarUrl) => {
    try {
      if (!user) throw new Error("No user logged in");

      const updatedUser = {
        ...user,
        AvatarImage: newAvatarUrl
      };

      setUser(updatedUser);
      await AsyncStorage.mergeItem('userData', JSON.stringify({
        AvatarImage: newAvatarUrl
      }));
    } catch (error) {
      console.error('Failed to update avatar:', error);
      throw error;
    }
  };

  return (
      <AuthContext.Provider value={{
        user,
        token,
        login,
        logout,
        updateAvatar
      }}>
        {children}
      </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);