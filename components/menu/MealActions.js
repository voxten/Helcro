import React, { useState } from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Modal, TextInput, ScrollView, KeyboardAvoidingView, Platform} from 'react-native';
import { Menu, Divider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import { API_BASE_URL } from '@env';
import { useAuth } from "../context/AuthContext";
import MealType from "./MealType";
import DateTimePicker from '@react-native-community/datetimepicker';

const MealActions = ({ meal, onMealDeleted, onMealRenamed, onMealCopied, hasProducts }) => {
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
        <View style={styles.container}>
            <Menu
                visible={visible}
                onDismiss={closeMenu}
                anchor={
                    <TouchableOpacity onPress={openMenu}>
                        <Icon name="dots-vertical" size={24} color="brown" />
                    </TouchableOpacity>
                }
            >
                {!hasProducts && (
                    <>
                        <Menu.Item
                            onPress={() => {
                                setCopyFromModalVisible(true);
                                closeMenu();
                            }}
                            title="Copy Meal From"
                        />
                        <Divider />
                    </>
                )}
                {hasProducts && (
                    <>
                        <Menu.Item
                            onPress={() => {
                                setCopyToModalVisible(true);
                                closeMenu();
                            }}
                            title="Copy Meal To"
                        />
                        <Divider />
                    </>
                )}
                {meal.type === 'Other' && (
                    <>
                        <Menu.Item
                            onPress={() => {
                                setRenameModalVisible(true);
                                closeMenu();
                            }}
                            title="Rename"
                        />
                        <Divider />
                    </>
                )}
                <Menu.Item
                    onPress={handleDeleteMeal}
                    title="Delete"
                    titleStyle={{ color: 'red' }}
                />
            </Menu>

            {/* Rename Modal */}
            <Modal
                visible={renameModalVisible}
                transparent={true}
                onRequestClose={() => setRenameModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Rename Meal</Text>
                        <TextInput
                            style={styles.input}
                            value={newMealName}
                            onChangeText={setNewMealName}
                            placeholder="Enter new meal name"
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setRenameModalVisible(false)}
                            >
                                <Text style={styles.buttonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.saveButton}
                                onPress={handleRenameMeal}
                            >
                                <Text style={styles.buttonText}>Save</Text>
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
                    style={styles.modalContainer}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    <ScrollView contentContainerStyle={styles.scrollModalContent}>
                        <View style={[styles.modalContent, { padding: 0 }]}>
                            <View style={styles.datePickerContainer}>
                                <Text style={styles.modalTitle}>Select Source Date</Text>
                                <TouchableOpacity
                                    onPress={() => setShowDatePicker(true)}
                                    style={styles.datePickerButton}
                                >
                                    <Text style={styles.datePickerText}>
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
                            />
                        </View>
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
                    style={styles.modalContainer}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    <ScrollView contentContainerStyle={styles.scrollModalContent}>
                        <View style={[styles.modalContent, { padding: 0 }]}>
                            <View style={styles.datePickerContainer}>
                                <Text style={styles.modalTitle}>Select Target Date</Text>
                                <TouchableOpacity
                                    onPress={() => setShowDatePicker(true)}
                                    style={styles.datePickerButton}
                                >
                                    <Text style={styles.datePickerText}>
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
                                onClose={() => setCopyToModalVisible(false)}
                                onSubmit={handleCopyTo}
                                isCopyAction={true}
                            />
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </Modal>

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginRight: 10,
        height: '100%',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: 500,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 10,
        width: '90%',
        maxHeight: '100%',
    },
    scrollModalContent: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 15,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 15,
    },
    cancelButton: {
        backgroundColor: '#ccc',
        padding: 10,
        borderRadius: 5,
        flex: 1,
        marginRight: 5,
        alignItems: 'center',
    },
    saveButton: {
        backgroundColor: 'brown',
        padding: 10,
        borderRadius: 5,
        flex: 1,
        marginLeft: 5,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    datePickerContainer: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    datePickerButton: {
        padding: 15,
        backgroundColor: '#f0f0f0',
        borderRadius: 5,
        alignItems: 'center',
    },
    datePickerText: {
        color: 'black',
        fontSize: 16,
    },
});

export default MealActions;