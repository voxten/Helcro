import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, TextInput, Modal, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { LineChart } from "react-native-chart-kit";
import DateTimePicker from "@react-native-community/datetimepicker";
import Icon from "react-native-vector-icons/FontAwesome";
import mainStyles from "../../styles/MainStyles";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { API_BASE_URL } from '@env';

export default function WeightHistoryScreen() {
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
                weight: weightValue.toFixed(1) // Ensure consistent decimal format
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
            <View style={styles.container}>
                <ActivityIndicator size="large" color="brown" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {weights.length > 0 && weightHistory.datasets[0].data.length > 0 ? (
                <LineChart
                    data={weightHistory}
                    width={400}
                    height={250}
                    chartConfig={{
                        backgroundGradientFrom: "#eee",
                        backgroundGradientTo: "#eee",
                        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                        decimalPlaces: 1, // Ensure consistent decimal formatting
                    }}
                    bezier
                    fromZero={true}
                    yAxisSuffix=" kg"
                    yAxisMin={Math.min(...weightHistory.datasets[0].data) - 5}
                    yAxisMax={Math.max(...weightHistory.datasets[0].data) + 5}
                />
            ) : (
                <Text style={styles.noDataText}>No weight data available</Text>
            )}

            <TouchableOpacity
                style={styles.addButton}
                onPress={() => setModalVisible(true)}
            >
                <Icon name="plus" size={20} color="white" />
                <Text style={styles.addButtonText}>Add Weight</Text>
            </TouchableOpacity>

            <ScrollView style={styles.scrollContainer}>
                {weights.map((item, index) => (
                    <View key={index} style={styles.listItem}>
                        <Text style={styles.listText}>
                            {new Date(item.WeightDate).toLocaleDateString()}: {item.Weight} kg
                        </Text>
                    </View>
                ))}
            </ScrollView>

            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={mainStyles.overlay}>
                    <View style={mainStyles.modalContainer}>
                        <Text style={styles.modalTitle}>Add Weight</Text>

                        <TouchableOpacity
                            onPress={() => setShowDatePicker(true)}
                            style={styles.datePickerButton}
                        >
                            <Text style={styles.dateText}>
                                {selectedDate.toLocaleDateString()}
                            </Text>
                        </TouchableOpacity>

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

                        <TextInput
                            style={mainStyles.input}
                            value={newWeight}
                            onChangeText={setNewWeight}
                            placeholder="Enter weight (kg)"
                            keyboardType="numeric"
                        />
                        <View style={styles.buttons}>
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.closeButtonText}>Close</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.submitButton}
                                onPress={handleAddWeight}
                            >
                                <Text style={styles.submitButtonText}>Submit</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "center",
        backgroundColor: "#f4f4f4",
        paddingBottom: 20,
    },
    addButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "brown",
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
        marginVertical: 10,
    },
    addButtonText: {
        color: "white",
        fontSize: 18,
        marginLeft: 8,
        fontWeight: "bold"
    },
    scrollContainer: {
        flex: 1,
        width: "90%",
        marginTop: 10,
        marginBottom: 20,
    },
    listItem: {
        backgroundColor: "#fff",
        padding: 10,
        marginVertical: 5,
        borderRadius: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 3,
    },
    listText: {
        fontSize: 16,
        color: "black",
    },
    modalTitle: {
        fontSize: 20,
        marginBottom: 15,
        color: "brown",
        fontWeight: "bold",
    },
    datePickerButton: {
        backgroundColor: '#fff',
        padding: 10,
        marginBottom: 15,
        borderRadius: 10,
    },
    dateText: {
        color: "black",
        fontSize: 16,
    },
    submitButton: {
        backgroundColor: "#156dc9",
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 5,
        flex: 1,
        marginLeft: 5,
        alignItems: "center",
    },
    submitButtonText: {
        color: 'white',
        fontSize: 16,
    },
    closeButton: {
        backgroundColor: "brown",
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 5,
        flex: 1,
        marginRight: 5,
        alignItems: "center",
    },
    closeButtonText: {
        color: 'white',
        fontSize: 16,
    },
    buttons: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        marginTop: 10,
    },
    noDataText: {
        fontSize: 16,
        color: 'gray',
        textAlign: 'center',
        marginTop: 20
    }
});
