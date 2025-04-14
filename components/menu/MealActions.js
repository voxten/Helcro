import React, { useState } from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Modal, TextInput} from 'react-native';
import { Menu, Divider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import { API_BASE_URL } from '@env';
import { useAuth } from "../context/AuthContext";

const MealActions = ({ meal, onMealDeleted, onMealRenamed }) => {
    const { user } = useAuth();
    const [visible, setVisible] = useState(false);
    const [renameModalVisible, setRenameModalVisible] = useState(false);
    const [newMealName, setNewMealName] = useState(meal.name);

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
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginRight: 10,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        width: '80%',
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
});

export default MealActions;