import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, TextInput, Modal, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { LineChart } from "react-native-chart-kit";
import DateTimePicker from "@react-native-community/datetimepicker";
import Icon from "react-native-vector-icons/FontAwesome";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { API_BASE_URL } from '@env';
import { Dimensions } from "react-native";
import { useAccessibility } from "../AccessibleView/AccessibleView";
export default function WeightHistoryScreen() {
    const { highContrast } = useAccessibility();
    const { user } = useAuth();
    const [weights, setWeights] = useState([]);
    const [weightHistory, setWeightHistory] = useState({
        labels: [],
        datasets: [{ data: [], strokeWidth: 2, color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})` }]
    });
    const [modalVisible, setModalVisible] = useState(false);
    const [newWeight, setNewWeight] = useState("");
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchWeights();
        } else {
            setWeights([]);
            setWeightHistory({
                labels: [],
                datasets: [{ data: [], strokeWidth: 2 }]
            });
        }
    }, [user]);

    const fetchWeights = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(`${API_BASE_URL}/weight`, {
                params: { userId: user.UserId }
            });

            const weightsData = response.data.weights || [];
            setWeights(weightsData);

            // Prepare chart data - ensure we have valid numbers
            const validWeights = weightsData
                .filter(item => !isNaN(parseFloat(item.Weight)) && item.WeightDate)
                .sort((a, b) => new Date(a.WeightDate) - new Date(b.WeightDate));


            const labels = validWeights.map(item =>
                new Date(item.WeightDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            );

            const dataPoints = validWeights.map(item => parseFloat(item.Weight));

            setWeightHistory({
                labels,
                datasets: [{
                    data: dataPoints,
                    strokeWidth: 2,
                    color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`
                }]
            });
        } catch (error) {
            console.error("Error fetching weights:", error);
            setWeightHistory({
                labels: [],
                datasets: [{ data: [], strokeWidth: 2 }]
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddWeight = async () => {
        try {
            const formattedDate = selectedDate.toISOString().split("T")[0];
            const weightValue = parseFloat(newWeight);

            if (isNaN(weightValue)) {
                alert("Please enter a valid weight");
                return;
            }

            const response = await axios.post(`${API_BASE_URL}/weight`, {
                userId: user.UserId,
                date: formattedDate,
                weight: weightValue.toFixed(1)
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.success) {
                setModalVisible(false);
                setNewWeight("");
                fetchWeights();
            } else {
                alert("Failed to add weight: " + (response.data.message || "Unknown error"));
            }
        } catch (error) {
            console.error("Error adding weight:", error);
            alert(`Error adding weight: ${error.response?.data?.message || error.message}`);
        }
    };

    if (isLoading) {
        return (
            <View style={[styles.container, highContrast && styles.highContrastBackground]}>
                <ActivityIndicator size="large" color="brown" />
            </View>
        );
    }

    return (
        <View style={[styles.container, highContrast && styles.highContrastBackground]}>
            <View style={[styles.chartContainer, highContrast && styles.secondContrast]}>
                {weights.length > 0 && weightHistory.datasets[0].data.length > 0 ? (
                   <LineChart
                        data={weightHistory}
                        width={Dimensions.get("window").width - 65} // pełna szerokość z marginesem
                        height={220}
                        chartConfig={{
                            backgroundGradientFrom:  highContrast ?  "#454343":'white',
                            backgroundGradientTo:  highContrast ?  "#454343":'white',
                            decimalPlaces: 1,
                            color: (opacity = 1) => highContrast ?  "white":`rgba(165, 42, 42, ${opacity})`,
                            labelColor: (opacity = 1) => highContrast ?  "white":`rgba(165, 42, 42, ${opacity})`,
                            propsForDots: {
                                r: "5",
                                strokeWidth: "2",
                                stroke: highContrast ?  "white":"#8B4513"
                            }
                        }}
    bezier
    style={{
        borderRadius: 16
    }}
/>

                ) : (
                    <View style={[styles.noDataContainer, highContrast && styles.highContrastBackground]}>
                        <Icon name="exclamation-circle" size={24} color= {highContrast ?  "white":"#8B4513"} />
                        <Text style={[styles.noDataText, highContrast && styles.highContrastBackground]}>No weight data available</Text>
                    </View>
                )}
            </View>

            <TouchableOpacity
                style={styles.addButton}
                onPress={() => setModalVisible(true)}
            >
                <Icon name="plus" size={18} color="white" />
                <Text style={styles.addButtonText}>Add New Weight</Text>
            </TouchableOpacity>

            <ScrollView style={[styles.scrollContainer, highContrast && styles.highContrastBackground]}>
                {weights.map((item, index) => (
                    <View key={index} style={[styles.listItem, highContrast && styles.secondContrast]}>
                        <Icon name="balance-scale" size={16} color={highContrast ?  "white":"#5D4037"} style={[styles.listIcon, highContrast && styles.secondContrast]} />
                        <Text style={[styles.listText, highContrast && styles.secondContrast]}>
                            {new Date(item.WeightDate).toLocaleDateString()}
                        </Text>
                        <Text style={[styles.listWeight, highContrast && styles.secondContrast]}>{item.Weight} kg</Text>
                    </View>
                ))}
            </ScrollView>

            <Modal visible={modalVisible} transparent animationType="fade">
                <View style={styles.overlay}>
                    <View style={[styles.modalContainer, highContrast && styles.highContrastBackground]}>
                        <Text style={[styles.modalTitle, highContrast && styles.highContrastBackground]}>Add Weight Record</Text>

                        <View style={[styles.inputContainer, highContrast && styles.secondContrast]}>
                            <Icon name="calendar" size={18} color={highContrast ?  "white":"#5D4037"}style={styles.inputIcon} />
                            <TouchableOpacity
                                onPress={() => setShowDatePicker(true)}
                                style={[styles.dateInput, highContrast && styles.secondContrast]}
                            >
                                <Text style={[styles.dateText, highContrast && styles.secondContrast]}>
                                    {selectedDate.toLocaleDateString()}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {showDatePicker && (
                            <DateTimePicker
                                value={selectedDate}
                                mode="date"
                                display="default"
                                onChange={(event, date) => {
                                    setShowDatePicker(false);
                                    if (date) setSelectedDate(date);
                                }}
                            />
                        )}

                        <View style={[styles.inputContainer, highContrast && styles.secondContrast]}>
                            <Icon name="balance-scale" size={18} color={highContrast ?  "white":"#5D4037"} style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, highContrast && styles.secondContrast]}
                                placeholderTextColor={highContrast ? '#FFFFFF' : '#999999'}
                                value={newWeight}
                                onChangeText={setNewWeight}
                                placeholder="Weight in kg"
                                keyboardType="numeric"
                            />
                        </View>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.modalButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.submitButton]}
                                onPress={handleAddWeight}
                            >
                                <Text style={styles.modalButtonText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
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
    chartContainer: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        elevation: 3,
        shadowColor: 'brown',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
    },
    noDataContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    noDataText: {
        fontSize: 16,
        color: 'brown',
        marginLeft: 10,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'brown',
        padding: 14,
        borderRadius: 12,
        marginHorizontal: 20,
        marginBottom: 10,
        elevation: 3,
    },
    addButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
        marginLeft: 10,
    },
    scrollContainer: {
        flex: 1,
        marginHorizontal: 20,
        marginTop: 10,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 16,
        marginBottom: 10,
        borderRadius: 12,
        elevation: 2,
    },
    listIcon: {
        marginRight: 12,
    },
    listText: {
        flex: 1,
        fontSize: 15,
        color: 'brown',
    },
    listWeight: {
        fontSize: 15,
        fontWeight: '600',
        color: 'brown',
    },
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        width: '85%',
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 24,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: 'black',
        marginBottom: 20,
        textAlign: 'center',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 10,
        paddingHorizontal: 14,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#D7CCC8',
    },
    inputIcon: {
        marginRight: 10,
    },
    dateInput: {
        flex: 1,
        paddingVertical: 14,
    },
    input: {
        flex: 1,
        paddingVertical: 14,
        color: 'brown',
    },
    dateText: {
        fontSize: 15,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    modalButton: {
        flex: 1,
        padding: 14,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        backgroundColor: 'brown',
        marginRight: 8,
    },
    submitButton: {
        backgroundColor: 'brown',
        marginLeft: 8,
    },
    modalButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: 'white',
    },
});