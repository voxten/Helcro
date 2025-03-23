import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, Modal, StyleSheet, ScrollView } from "react-native";
import { LineChart } from "react-native-chart-kit";
import DateTimePicker from "@react-native-community/datetimepicker";
import Icon from "react-native-vector-icons/FontAwesome";
import mainStyles from "../../styles/MainStyles"

export default function WeightHistoryScreen() {
    const [weightHistory, setWeightHistory] = useState({
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        datasets: [
            {
                data: [70, 72, 71, 75, 73, 74, 72, 70, 71, 73, 72, 71],
                strokeWidth: 2,
                color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`,
            },
        ],
    });

    const [weights, setWeights] = useState([
        { date: "2025-01-15", weight: 70 },
        { date: "2025-02-10", weight: 72 },
        { date: "2025-03-05", weight: 71 },
        { date: "2025-04-20", weight: 75 },
        { date: "2025-05-18", weight: 73 },
        { date: "2025-06-12", weight: 74 },
        { date: "2025-07-09", weight: 72 },
        { date: "2025-08-14", weight: 70 },
        { date: "2025-09-07", weight: 71 },
        { date: "2025-10-22", weight: 73 },
        { date: "2025-11-16", weight: 72 },
        { date: "2025-12-28", weight: 71 },
    ]);

    const [modalVisible, setModalVisible] = useState(false);
    const [newWeight, setNewWeight] = useState("");
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    const handleAddWeight = () => {
        setModalVisible(false);

        const formattedDate = selectedDate.toISOString().split("T")[0];

        setWeightHistory((prev) => ({
            ...prev,
            datasets: [
                {
                    ...prev.datasets[0],
                    data: [...prev.datasets[0].data, parseFloat(newWeight)],
                },
            ],
        }));

        setWeights((prev) => [
            ...prev,
            { date: formattedDate, weight: parseFloat(newWeight) },
        ]);

        setNewWeight("");
    };

    return (
        <View style={styles.container}>
            <LineChart
                data={weightHistory}
                width={350}
                height={220}
                chartConfig={{
                    backgroundColor: "#eee",
                    backgroundGradientFrom: "black",
                    backgroundGradientTo: "black",
                    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                }}
                bezier
                fromZero={true}
                yAxisInterval={1}
                yAxisSuffix=" kg"
                yAxisMin={Math.min(...weightHistory.datasets[0].data) - 5}
                yAxisMax={Math.max(...weightHistory.datasets[0].data) + 5}
            />

            <TouchableOpacity
                style={styles.addButton}
                onPress={() => setModalVisible(true)}
            >
                <Icon name="plus" size={20} color="white" />
                <Text style={styles.addButtonText}>Add Weight</Text>
            </TouchableOpacity>

            {/* Scrollable List of Weights */}
            <ScrollView style={styles.scrollContainer}>
                {weights.map((item, index) => (
                    <View key={index} style={styles.listItem}>
                        <Text style={styles.listText}>
                            {item.date}: {item.weight} kg
                        </Text>
                    </View>
                ))}
            </ScrollView>

            {/* Modal for Adding New Weight */}
            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={mainStyles.overlay}>
                    <View style={mainStyles.modalContainer}>
                        <Text style={styles.modalTitle}>Add Weight</Text>

                        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePickerButton}>
                            <Text style={styles.dateText}>{selectedDate.toDateString()}</Text>
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
                            <TouchableOpacity style={styles.submitButton} onPress={handleAddWeight}>
                                <Text style={styles.submitButtonText}>Submit</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                                <Text style={styles.closeButtonText}>Close</Text>
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
        paddingVertical: 20,
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
        marginRight: 5,
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
        marginLeft: 5,
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
    }

});
