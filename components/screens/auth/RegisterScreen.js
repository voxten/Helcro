import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  Alert,
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  KeyboardAvoidingView,
  Platform 
} from 'react-native';
import api from '../../utils/api';
import Icon from "react-native-vector-icons/FontAwesome5";
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAccessibility } from "../../AccessibleView/AccessibleView";
const RegisterScreen = ({ onLoginPress, onRegisterSuccess }) => {
  const { highContrast } = useAccessibility();
  const [form, setForm] = useState({
    UserName: '',
    Email: '',
    Password: '',
    PotwierdzPassword: '',
    Height: '',
    Weight: '',
    Gender: 'M',
    Birthday: ''
  });

  

  const handleChange = (name, value) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };
  const [showDatePicker, setShowDatePicker] = useState(false); // ✅ move here
  const handleDateChange = (event, selectedDate) => { // ✅ move here too
    setShowDatePicker(false);
    if (selectedDate) {
      const isoDate = selectedDate.toISOString().split('T')[0];
      handleChange('Birthday', isoDate);
    }
  };
  const handleRegister = async () => {
    // Walidacja
    if (form.Password !== form.PotwierdzPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (!form.UserName || !form.Email || !form.Password) {
      Alert.alert('Error', 'Fill in all required fields');
      return;
    }

    try {
      const response = await api.post('/api/auth/register', {
        UserName: form.UserName,
        Email: form.Email,
        Password: form.Password,
        Height: form.Height ? parseFloat(form.Height) : null,
        Weight: form.Height ? parseFloat(form.Weight) : null,
        Gender: form.Gender,
        Birthday: form.Birthday,
        AvatarImage: "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y",
      });

      Alert.alert('Success', 'Account has been successfully created', [
        { 
          text: 'OK', 
          onPress: () => onRegisterSuccess() 
        }
      ]);
    } catch (error) {
      console.error('Registration error:', error);
      let errorMessage = 'An error occurred during registration';
      
      if (error.response) {
        if (error.response.data.error.includes('Email')) {
          errorMessage = 'The provided email is already taken';
        } else if (error.response.data.error.includes('UserName')) {
          errorMessage = 'The provided username is already taken';
        }
      } else if (error.message.includes('Network Error')) {
        errorMessage = 'No connection to the server. Please check your internet connection.';
      }

      Alert.alert('Error', errorMessage);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, highContrast && styles.highContrastBackground]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.title, highContrast && styles.highContrastBackground]}>Registration</Text>
        
        <TextInput
          style={[styles.input, highContrast && styles.secondContrast]}
          placeholderTextColor={highContrast ? '#FFFFFF' : '#999999'}
          placeholder="User name *"
          value={form.UserName}
          onChangeText={(text) => handleChange('UserName', text)}
          autoCapitalize="none"
        />
        
        <TextInput
          style={[styles.input, highContrast && styles.secondContrast]}
          placeholderTextColor={highContrast ? '#FFFFFF' : '#999999'}
          placeholder="Email *"
          value={form.Email}
          onChangeText={(text) => handleChange('Email', text)}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <TextInput
          style={[
            styles.input,
            highContrast && styles.secondContrast,
            { color: highContrast ? '#FFFFFF' : '#000000' }  // dynamicznie ustawiamy kolor tekstu
          ]}
          placeholderTextColor={highContrast ? '#FFFFFF' : '#999999'}
          placeholder="Password *"
          value={form.Password}
          onChangeText={(text) => handleChange('Password', text)}
          secureTextEntry
        />
        
        <TextInput
          style={[
            styles.input,
            highContrast && styles.secondContrast,
            { color: highContrast ? '#FFFFFF' : '#000000' }
          ]}
          placeholderTextColor={highContrast ? '#FFFFFF' : '#999999'}
          placeholder="Confirm password *"
          value={form.PotwierdzPassword}
          onChangeText={(text) => handleChange('PotwierdzPassword', text)}
          secureTextEntry
        />

        
        <TextInput
          style={[styles.input, highContrast && styles.secondContrast]}
          placeholderTextColor={highContrast ? '#FFFFFF' : '#999999'}
          placeholder="Height (cm)"
          value={form.Height}
          onChangeText={(text) => handleChange('Height', text)}
          keyboardType="numeric"
        />
        
        <TextInput
          style={[styles.input, highContrast && styles.secondContrast]}
          placeholderTextColor={highContrast ? '#FFFFFF' : '#999999'}
          placeholder="Weight (kg)"
          value={form.Weight}
          onChangeText={(text) => handleChange('Weight', text)}
          keyboardType="numeric"
        />
        <TouchableOpacity 
          onPress={() => setShowDatePicker(true)} 
          style={[styles.input, highContrast && styles.secondContrast]}
          
          activeOpacity={0.8}
        >
          <Text
            style={[
              (highContrast ? styles.birthdayTextContrast: styles.birthdayText),
              !form.Birthday && (highContrast ? styles.placeholderTextHighContrast : styles.placeholderText)
            ]}
          >
            {form.Birthday ? form.Birthday : 'Select Birthday *'}
          </Text>
        </TouchableOpacity>

        {showDatePicker && (
            <DateTimePicker
                value={form.Birthday ? new Date(form.Birthday) : new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                maximumDate={new Date()}
            />
        )}
        
        <View style={styles.radioGroup}>
          <Text style={[styles.radioLabel, highContrast && styles.highContrastBackground]}>Gender:</Text>
          {['M', 'W'].map((gender) => (
          <TouchableOpacity
            key={gender}
             style={[
              styles.radioButton,
              highContrast && styles.secondContrast,
              form.Gender === gender && styles.radioButtonSelected,
              form.Gender === gender && highContrast && styles.secondContrast,
            ]}
            onPress={() => handleChange('Gender', gender)}
          >
            <Text style={[styles.radioLabel, highContrast && styles.secondContrast]}>
              {gender === 'M' ? 'Men' : 'Women'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Icon name="user-plus" size={20} color="white" style={styles.icon} />
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={onLoginPress}
          style={styles.secondaryButton}
        >
          <Text style={[styles.secondaryButtonText, highContrast && styles.highContrastBackground]}>Have an account? Log in</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  birthdayTextContrast:{
    fontSize: 15,
    color: 'white',
    paddingVertical: 13,
  },
  placeholderTextHighContrast: {
    color: '#FFFFFF',
  },
   highContrastBackground: {
        backgroundColor: '#2e2c2c', 
        color:'white',
    },
    secondContrast: {
        backgroundColor: "#454343",
        color:'white',
    },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
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
  secondaryButton: {
    padding: 10,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 14,
    marginTop: 10,
  },
  birthdayText: {
    fontSize: 15,
    color: '#000',
    paddingVertical: 13,
  },
  
  placeholderText: {
    color: '#000',
    fontSize: 15,
  },
});

export default RegisterScreen;