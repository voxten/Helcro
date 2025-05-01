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
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from "react-native-vector-icons/FontAwesome5";
import api from '../../utils/api';

const CompleteProfileScreen = ({ route, navigation }) => {
    const { userId, email } = route.params;     
    const [form, setForm] = useState({
      Height: '',
      Weight: '',
      Birthday: '',
      Gender: 'M'
    });
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleChange = (name, value) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      handleChange('Birthday', formattedDate);
    }
  };

  const handleSubmit = async () => {
    if (!form.Height || !form.Weight || !form.Birthday) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    try {
        await api.post('/api/auth/complete-profile', {
          userId,
          Height: parseFloat(form.Height),
          Weight: parseFloat(form.Weight),
          Birthday: form.Birthday,
          Gender: form.Gender
        });
  
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      } catch (error) {
        Alert.alert('Error', 'Failed to save profile data');
      }
    }; 

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Complete Your Profile</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Height (cm) *"
          value={form.Height}
          onChangeText={(text) => handleChange('Height', text)}
          keyboardType="numeric"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Weight (kg) *"
          value={form.Weight}
          onChangeText={(text) => handleChange('Weight', text)}
          keyboardType="numeric"
        />
        
        <TouchableOpacity 
          onPress={() => setShowDatePicker(true)} 
          style={styles.input}
          activeOpacity={0.8}
        >
          <Text style={[styles.birthdayText, !form.Birthday && styles.placeholderText]}>
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
          <Text style={styles.radioLabel}>Gender:</Text>
          {['M', 'W'].map((gender) => (
            <TouchableOpacity
              key={gender}
              style={[
                styles.radioButton,
                form.Gender === gender && styles.radioButtonSelected,
              ]}
              onPress={() => handleChange('Gender', gender)}
            >
              <Text style={styles.radioText}>
                {gender === 'M' ? 'Men' : 'Women'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Icon name="check" size={20} color="white" style={styles.icon} />
          <Text style={styles.buttonText}>Complete Profile</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// Użyj tych samych styli co w RegisterScreen lub dostosuj według potrzeb
const styles = StyleSheet.create({
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
    justifyContent: 'center',
  },
  birthdayText: {
    fontSize: 16,
  },
  placeholderText: {
    color: '#888',
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

export default CompleteProfileScreen;