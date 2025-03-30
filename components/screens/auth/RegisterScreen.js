import React, { useState } from 'react';
import { View, Text, TextInput, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import api from '../../utils/api'; // Importujemy nasz nowy plik api
import Icon from "react-native-vector-icons/FontAwesome5";

const RegisterScreen = ({ navigation }) => {
  const [form, setForm] = useState({
    NazwaUzytkownika: '',
    Email: '',
    Haslo: '',
    PotwierdzHaslo: '',
    Wzrost: '',
    Waga: '',
    Plec: 'M'
  });

  const handleChange = (name, value) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleRegister = async () => {
    // Walidacja
    if (form.Haslo !== form.PotwierdzHaslo) {
      Alert.alert('Błąd', 'Hasła nie są identyczne');
      return;
    }

    if (!form.NazwaUzytkownika || !form.Email || !form.Haslo) {
      Alert.alert('Błąd', 'Wypełnij wszystkie wymagane pola');
      return;
    }

    try {
      const response = await api.post('/api/auth/register', {
        NazwaUzytkownika: form.NazwaUzytkownika,
        Email: form.Email,
        Haslo: form.Haslo,
        Wzrost: form.Wzrost ? parseFloat(form.Wzrost) : null,
        Waga: form.Wzrost ? parseFloat(form.Waga) : null,
        Plec: form.Plec
      });

      Alert.alert('Sukces', 'Konto zostało utworzone pomyślnie');
      
    } catch (error) {
      console.error('Błąd rejestracji:', error);
      let errorMessage = 'Wystąpił błąd podczas rejestracji';
      
      if (error.response) {
        if (error.response.data.error.includes('Email')) {
          errorMessage = 'Podany email jest już zajęty';
        } else if (error.response.data.error.includes('NazwaUzytkownika')) {
          errorMessage = 'Podana nazwa użytkownika jest już zajęta';
        }
      } else if (error.message.includes('Network Error')) {
        errorMessage = 'Brak połączenia z serwerem. Sprawdź swoje połączenie internetowe';
      }

      Alert.alert('Błąd', errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rejestracja</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Nazwa użytkownika *"
        value={form.NazwaUzytkownika}
        onChangeText={(text) => handleChange('NazwaUzytkownika', text)}
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Email *"
        value={form.Email}
        onChangeText={(text) => handleChange('Email', text)}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Hasło *"
        value={form.Haslo}
        onChangeText={(text) => handleChange('Haslo', text)}
        secureTextEntry
      />
      
      <TextInput
        style={styles.input}
        placeholder="Potwierdź hasło *"
        value={form.PotwierdzHaslo}
        onChangeText={(text) => handleChange('PotwierdzHaslo', text)}
        secureTextEntry
      />
      
      <TextInput
        style={styles.input}
        placeholder="Wzrost (cm)"
        value={form.Wzrost}
        onChangeText={(text) => handleChange('Wzrost', text)}
        keyboardType="numeric"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Waga (kg)"
        value={form.Waga}
        onChangeText={(text) => handleChange('Waga', text)}
        keyboardType="numeric"
      />
      
      <View style={styles.radioGroup}>
        <Text style={styles.radioLabel}>Płeć:</Text>
        {['M', 'K', 'Inne'].map((gender) => (
          <TouchableOpacity
            key={gender}
            style={[
              styles.radioButton,
              form.Plec === gender && styles.radioButtonSelected
            ]}
            onPress={() => handleChange('Plec', gender)}
          >
            <Text style={styles.radioText}>
              {gender === 'M' ? 'Mężczyzna' : gender === 'K' ? 'Kobieta' : 'Inne'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Icon name="user-plus" size={20} color="white" style={styles.icon} />
        <Text style={styles.buttonText}>Zarejestruj się</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  radioGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  radioLabel: {
    marginRight: 10,
    fontSize: 16,
  },
  radioButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginRight: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  radioButtonSelected: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196F3',
  },
  radioText: {
    fontSize: 16,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "brown",
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 15,
    borderRadius: 8,
  },
  icon: {
    marginRight: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default RegisterScreen;