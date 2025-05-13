import React, { useState } from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Modal, TextInput, ScrollView, KeyboardAvoidingView, Platform} from 'react-native';
import { Menu, Divider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import { API_BASE_URL } from '@env';
import { useAuth } from "../context/AuthContext";
import MealType from "./MealType";
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAccessibility } from "../AccessibleView/AccessibleView";
const MealActions = ({ meal, onMealDeleted, onMealRenamed, onMealCopied, hasProducts }) => {
    const { highContrast } = useAccessibility();
    const { user } = useAuth();
    const [visible, setVisible] = useState(false);
    const [renameModalVisible, setRenameModalVisible] = useState(false);
    const [copyFromModalVisible, setCopyFromModalVisible] = useState(false);
    const [copyToModalVisible, setCopyToModalVisible] = useState(false);
    const [newMealName, setNewMealName] = useState(meal.name);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    const openMenu = () => setVisible(true);
    const closeMenu = () => setVisible(false);

    const handleDeleteMeal = async () => {
        try {
            await axios.delete(`${API_BASE_URL}/intakeLog/meal`, {
                data: {
                    userId: user.UserId,
                    mealId: meal.id
                }
            });
            onMealDeleted(meal.id);
            closeMenu();
        } catch (error) {
            console.error("Error deleting meal:", error);
        }
    };

    const handleRenameMeal = async () => {
        try {
            await axios.put(`${API_BASE_URL}/intakeLog/meal`, {
                userId: user.UserId,
                mealId: meal.id,
                newMealName
            });
            onMealRenamed(meal.id, newMealName);
            setRenameModalVisible(false);
            closeMenu();
        } catch (error) {
            console.error("Error renaming meal:", error);
        }
    };

    const handleCopyFrom = async (selectedMealId) => {
        try {
            const fromDate = selectedDate.toISOString().split('T')[0];

            const response = await axios.post(`${API_BASE_URL}/intakeLog/copyMeal`, {
                userId: user.UserId,
                fromDate,
                fromMealId: selectedMealId,
                toDate: meal.date,
                toMealId: meal.id
            });

            // Call the onMealCopied callback with the copied products and updated meal
            onMealCopied(response.data.products, response.data.meal);
            setCopyFromModalVisible(false);
            closeMenu();
        } catch (error) {
            console.error("Error copying meal:", error.response?.data || error.message);
            alert(`Error copying meal: ${error.response?.data?.message || error.message}`);
        }
    };


    const handleCopyTo = async (selectedMealId) => {
        try {
            const toDate = selectedDate.toISOString().split('T')[0];

            const response = await axios.post(`${API_BASE_URL}/intakeLog/copyMeal`, {
                userId: user.UserId,
                fromDate: meal.date,
                fromMealId: meal.id,  // Now using meal ID
                toDate,
                toMealId: selectedMealId  // Using selected meal ID
            });

            alert('Meal copied successfully!');
            setCopyToModalVisible(false);

            // Refresh the target date's meals if needed
        } catch (error) {
            console.error("Error copying meal:", error);
            alert(`Error copying meal: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setSelectedDate(selectedDate);
        }
    };

    return (
        <View style={[styles.container, highContrast && styles.highContrastBackground]}>
    <Menu
        visible={visible}
        onDismiss={closeMenu}
        anchor={
            <TouchableOpacity onPress={openMenu}>
                <Icon name="dots-vertical" size={24} color={highContrast ? "#FFFFFF" : "brown"} />
            </TouchableOpacity>
        }
        contentStyle={highContrast && styles.highContrastMenuContent}
    >
        {hasProducts && (
            <>
                <Menu.Item
                    onPress={() => {
                        setCopyToModalVisible(true);
                        closeMenu();
                    }}
                    title="Copy Meal To"
                    titleStyle={highContrast && styles.highContrastMenuText}
                />
                <Divider style={highContrast && styles.highContrastDivider} />
            </>
        )}
        <Menu.Item
            onPress={handleDeleteMeal}
            title="Delete"
            titleStyle={[highContrast && styles.highContrastMenuText, { color: highContrast ? "#FF0000" : 'red' }]}
        />
    </Menu>

    {/* Rename Modal */}
    <Modal
        visible={renameModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setRenameModalVisible(false)}
    >
        <View style={[styles.renamingModalContainer, highContrast && styles.highContrastModalOverlay]}>
            <View style={[styles.renamingModalContent, highContrast && styles.highContrastModalContent]}>
                <Text style={[styles.renamingModalTitle, highContrast && styles.highContrastText]}>Rename Meal</Text>
                <TextInput
                    style={[styles.renamingInput, highContrast && styles.highContrastInput]}
                    value={newMealName}
                    onChangeText={setNewMealName}
                    placeholder="Enter new meal name"
                    placeholderTextColor={highContrast ? "#AAAAAA" : "#999"}
                    autoFocus={true}
                />
                <View style={styles.renamingModalButtons}>
                    <TouchableOpacity
                        style={[styles.renamingCancelButton, highContrast && styles.highContrastCancelButton]}
                        onPress={() => setRenameModalVisible(false)}
                    >
                        <Text style={[styles.renamingCancelButtonText, highContrast && styles.highContrastButtonText]}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.renamingSaveButton, highContrast && styles.highContrastSaveButton]}
                        onPress={handleRenameMeal}
                    >
                        <Text style={[styles.renamingButtonText, highContrast && styles.highContrastButtonText]}>Save Changes</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    </Modal>

    {/* Copy From Modal */}
    <Modal
        visible={copyFromModalVisible}
        transparent={true}
        onRequestClose={() => setCopyFromModalVisible(false)}
    >
        <KeyboardAvoidingView
            style={[styles.modalContainer, highContrast && styles.highContrastModalOverlay]}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView contentContainerStyle={[styles.scrollModalContent, highContrast && styles.highContrastModalContent]}>
                <View style={[styles.modalContent, { padding: 0 }, highContrast && styles.highContrastModalSection]}>
                    <View style={[styles.datePickerContainer, highContrast && styles.highContrastDatePickerContainer]}>
                        <Text style={[styles.modalTitle, highContrast && styles.highContrastText]}>Select Source Date</Text>
                        <TouchableOpacity
                            onPress={() => setShowDatePicker(true)}
                            style={[styles.datePickerButton, highContrast && styles.highContrastDatePickerButton]}
                        >
                            <Text style={[styles.datePickerText, highContrast && styles.highContrastText]}>
                                {selectedDate.toLocaleDateString()}
                            </Text>
                        </TouchableOpacity>
                        {showDatePicker && (
                            <DateTimePicker
                                value={selectedDate}
                                mode="date"
                                display="default"
                                onChange={handleDateChange}
                            />
                        )}
                    </View>
                    <MealType
                        onClose={() => setCopyFromModalVisible(false)}
                        onSubmit={handleCopyFrom}
                        showCancel={true}
                        isCopyAction={true}
                        showOverlay={false}
                        highContrast={highContrast}
                    />
                </View>
                <View style={[styles.modalContent2, highContrast && styles.highContrastModalSection]} />
            </ScrollView>
        </KeyboardAvoidingView>
    </Modal>

    {/* Copy To Modal */}
    <Modal
        visible={copyToModalVisible}
        transparent={true}
        onRequestClose={() => setCopyToModalVisible(false)}
    >
        <KeyboardAvoidingView
            style={[styles.modalContainer, highContrast && styles.highContrastModalOverlay]}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView contentContainerStyle={[styles.scrollModalContent, highContrast && styles.highContrastModalContent]}>
                <View style={[styles.modalContent, { padding: 0 }, highContrast && styles.highContrastModalSection]}>
                    <View style={[styles.datePickerContainer, highContrast && styles.highContrastDatePickerContainer]}>
                        <Text style={[styles.modalTitle, highContrast && styles.highContrastText]}>Select Target Date</Text>
                        <TouchableOpacity
                            onPress={() => setShowDatePicker(true)}
                            style={[styles.datePickerButton, highContrast && styles.highContrastDatePickerButton]}
                        >
                            <Text style={[styles.datePickerText, highContrast && styles.highContrastText]}>
                                {selectedDate.toLocaleDateString()}
                            </Text>
                        </TouchableOpacity>
                        {showDatePicker && (
                            <DateTimePicker
                                value={selectedDate}
                                mode="date"
                                display="default"
                                onChange={handleDateChange}
                            />
                        )}
                    </View>
                </View>
                <View style={[styles.modalContent2, highContrast && styles.highContrastModalSection]}>
                    <MealType
                        onClose={() => setCopyToModalVisible(false)}
                        onSubmit={handleCopyTo}
                        isCopyAction={true}
                        showOverlay={false}
                        highContrast={highContrast}
                    />
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    </Modal>
</View>
    );
};

const styles = StyleSheet.create({
     highContrastBackground: {
        backgroundColor: '#121212',
    },
    highContrastText: {
        color: '#FFFFFF',
    },
    highContrastMenuContent: {
        backgroundColor: '#242424',
    },
    highContrastMenuText: {
        color: '#FFFFFF',
    },
    highContrastDivider: {
        backgroundColor: '#FFFFFF',
    },
    highContrastModalOverlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
    },
    highContrastModalContent: {
        backgroundColor: '#121212',
        borderColor: '#FFFFFF',
        borderWidth: 1,
    },
    highContrastInput: {
        color: '#FFFFFF',
        backgroundColor: '#242424',
        borderColor: '#FFFFFF',
    },
    highContrastCancelButton: {
        backgroundColor: '#242424',
        borderColor: '#FFFFFF',
        borderWidth: 1,
    },
    highContrastSaveButton: {
        backgroundColor: '#242424',
        borderColor: '#FFFFFF',
        borderWidth: 1,
    },
    highContrastButtonText: {
        color: '#FFFFFF',
    },
    highContrastModalSection: {
        borderColor: '#FFFFFF',
        borderWidth: 1,
    },
    highContrastDatePickerContainer: {
        borderColor: '#FFFFFF',
    },
    highContrastDatePickerButton: {
        backgroundColor: '#242424',
        borderColor: '#FFFFFF',
    },
    container: {
        marginRight: 10,
        height: '100%',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    modalContent: {
        borderRadius: 15,
        width: '90%',
        maxWidth: 400,
        padding: 25,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 10,
    },
    modalContent2: {
        width: '100%',
        marginVertical: 20,
    },
    scrollModalContent: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 20,
        color: '#333',
        textAlign: 'center',
    },
    input: {
        width: '100%',
        padding: 15,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        backgroundColor: '#f8f8f8',
        fontSize: 16,
        color: '#333',
        marginBottom: 20,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 15,
    },
    cancelButton: {
        backgroundColor: '#e0e0e0',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        flex: 1,
        marginRight: 10,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    saveButton: {
        backgroundColor: 'brown', // Brown color
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        flex: 1,
        marginLeft: 10,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
    },
    cancelButtonText: {
        color: '#333',
    },
    datePickerContainer: {
        width: '100%',
        padding: 20,
        borderRadius: 10,
        backgroundColor: "#f8f8f8",
        alignItems: "center",
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    datePickerButton: {
        backgroundColor: "brown",
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 8,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    datePickerText: {
        fontSize: 16,
        color: "#fff",
        fontWeight: "500",
    },
    menuItem: {
        padding: 10,
    },
    menuItemText: {
        fontSize: 16,
    },
    deleteText: {
        color: 'red',
    },
    renamingModalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    renamingModalContent: {
        backgroundColor: '#fff',
        borderRadius: 12,
        width: '85%',
        maxWidth: 380,
        padding: 22,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 15,
        borderWidth: 1,
        borderColor: 'rgba(165, 42, 42, 0.1)',
    },
    renamingModalTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 18,
        color: 'brown',
        textAlign: 'center',
        letterSpacing: 0.5,
    },
    renamingInput: {
        width: '100%',
        padding: 14,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        backgroundColor: '#fafafa',
        fontSize: 16,
        color: '#333',
        marginBottom: 22,
        fontWeight: '500',
    },
    renamingModalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 10,
    },
    renamingCancelButton: {
        backgroundColor: '#f5f5f5',
        paddingVertical: 12,
        paddingHorizontal: 22,
        borderRadius: 8,
        flex: 1,
        marginRight: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    renamingSaveButton: {
        backgroundColor: 'brown',
        paddingVertical: 12,
        paddingHorizontal: 22,
        borderRadius: 8,
        flex: 1,
        marginLeft: 8,
        alignItems: 'center',
        shadowColor: "brown",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    renamingButtonText: {
        color: 'white',
        fontSize: 15,
        fontWeight: '600',
    },
    renamingCancelButtonText: {
        color: '#555',
        fontSize: 15,
        fontWeight: '500',
    },
});


export default MealActions;