import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform, FlatList } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import moment from 'moment';

import { API_BASE_URL } from '@env';

export default function ExportDataScreen() {
    const { user } = useAuth();
    const [format, setFormat] = useState("csv");
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [exports, setExports] = useState([]);

    // Load saved exports on component mount
    useEffect(() => {
        loadSavedExports();
    }, []);

    const loadSavedExports = async () => {
        try {
            const exportsDir = `${FileSystem.documentDirectory}exports/`;
            const dirInfo = await FileSystem.getInfoAsync(exportsDir);

            // Create exports directory if it doesn't exist
            if (!dirInfo.exists) {
                await FileSystem.makeDirectoryAsync(exportsDir, { intermediates: true });
                return;
            }

            // Read all files in the exports directory
            const files = await FileSystem.readDirectoryAsync(exportsDir);
            const exportFiles = await Promise.all(
                files.map(async (file) => {
                    const fileInfo = await FileSystem.getInfoAsync(`${exportsDir}${file}`);
                    return {
                        name: file,
                        uri: `${exportsDir}${file}`,
                        size: fileInfo.size,
                        modified: fileInfo.modificationTime,
                    };
                })
            );

            setExports(exportFiles.sort((a, b) => b.modified - a.modified));
        } catch (error) {
            console.error("Error loading exports:", error);
        }
    };

    const handleExport = async () => {
        if (isExporting) return;

        setIsExporting(true);

        try {
            const formattedStartDate = formatDateForAPI(startDate);
            const formattedEndDate = formatDateForAPI(endDate);

            // First get the data from the server
            const response = await axios.get(`${API_BASE_URL}/api/export/nutrition-data`, {
                params: {
                    startDate: formattedStartDate,
                    endDate: formattedEndDate,
                    format: format,
                    userId: user.UserId
                },
                responseType: 'blob',
                headers: {
                    Authorization: `Bearer ${user.token}`,
                }
            });

            // Create exports directory if it doesn't exist
            const exportsDir = `${FileSystem.documentDirectory}exports/`;
            await FileSystem.makeDirectoryAsync(exportsDir, { intermediates: true });

            // Generate filename with timestamp
            const timestamp = moment().format('YYYYMMDD_HHmmss');
            const filename = `nutrition_${timestamp}.${getFileExtension(format)}`;
            const fileUri = `${exportsDir}${filename}`;

            // Convert the blob to base64 and write to file
            const reader = new FileReader();
            reader.onload = async () => {
                const base64data = reader.result.split(',')[1];
                await FileSystem.writeAsStringAsync(fileUri, base64data, {
                    encoding: FileSystem.EncodingType.Base64,
                });

                // Refresh the exports list
                await loadSavedExports();

                Alert.alert(
                    'Export Successful',
                    `File saved as ${filename}`,
                    [
                        { text: 'OK', onPress: () => {} },
                        { text: 'Share', onPress: () => shareFile(fileUri) }
                    ]
                );
            };
            reader.readAsDataURL(response.data);

        } catch (error) {
            console.error('Export failed:', error);
            Alert.alert(
                'Export Failed',
                error.response?.data?.error || 'There was an error exporting your data. Please try again.'
            );
        } finally {
            setIsExporting(false);
        }
    };

    const shareFile = async (fileUri) => {
        try {
            await Sharing.shareAsync(fileUri, {
                mimeType: getMimeType(format),
                dialogTitle: 'Share Nutrition Data',
                UTI: getUTI(format)
            });
        } catch (error) {
            console.error('Sharing failed:', error);
            Alert.alert('Sharing Failed', 'Could not share the file');
        }
    };

    const deleteExport = async (fileUri) => {
        try {
            await FileSystem.deleteAsync(fileUri);
            await loadSavedExports();
            Alert.alert('Success', 'Export file deleted');
        } catch (error) {
            console.error('Delete failed:', error);
            Alert.alert('Error', 'Could not delete the file');
        }
    };

    const formatDateForAPI = (date) => {
        return date.toISOString().split('T')[0];
    };

    const getFileExtension = (format) => {
        switch (format) {
            case 'excel': return 'xlsx';
            case 'pdf': return 'pdf';
            case 'txt': return 'txt';
            default: return 'csv';
        }
    };

    const getMimeType = (format) => {
        switch (format.toLowerCase()) {
            case 'excel': return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            case 'pdf': return 'application/pdf';
            case 'txt': return 'text/plain';
            default: return 'text/csv';
        }
    };

    const getUTI = (format) => {
        switch (format.toLowerCase()) {
            case 'excel': return 'com.microsoft.excel.xlsx';
            case 'pdf': return 'com.adobe.pdf';
            case 'txt': return 'public.plain-text';
            default: return 'public.comma-separated-values-text';
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const renderExportItem = ({ item }) => (
        <View style={styles.exportItem}>
            <View style={styles.exportInfo}>
                <Text style={styles.exportName}>{item.name}</Text>
                <Text style={styles.exportDetails}>
                    {formatFileSize(item.size)} • {moment(item.modified * 1000).format('MMM D, YYYY h:mm A')}
                </Text>
            </View>
            <View style={styles.exportActions}>
                <TouchableOpacity onPress={() => downloadExport(item.uri, item.name)}>
                    <Icon name="download" size={20} color="green" style={styles.exportIcon} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => shareFile(item.uri)}>
                    <Icon name="share" size={20} color="brown" style={styles.exportIcon} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteExport(item.uri)}>
                    <Icon name="trash" size={20} color="red" style={styles.exportIcon} />
                </TouchableOpacity>
            </View>
        </View>
    );

    const downloadExport = async (fileUri, fileName) => {
        try {
            if (Platform.OS === 'android') {
                const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

                if (!permissions.granted) {
                    return;
                }

                const fileContent = await FileSystem.readAsStringAsync(fileUri, {
                    encoding: FileSystem.EncodingType.Base64,
                });

                await FileSystem.StorageAccessFramework.createFileAsync(
                    permissions.directoryUri,
                    fileName,
                    getMimeType(fileName.split('.').pop())
                )
                    .then(async (newUri) => {
                        await FileSystem.writeAsStringAsync(newUri, fileContent, {
                            encoding: FileSystem.EncodingType.Base64,
                        });
                        Alert.alert('Success', 'File downloaded successfully');
                    })
                    .catch(e => {
                        Alert.alert('Error', 'Failed to save file');
                    });
            } else {
                // On iOS, we can use the sharing dialog as a download option
                await Sharing.shareAsync(fileUri, {
                    mimeType: getMimeType(fileName.split('.').pop()),
                    dialogTitle: 'Download Nutrition Data',
                    UTI: getUTI(fileName.split('.').pop())
                });
            }
        } catch (error) {
            console.error('Download failed:', error);
            Alert.alert('Error', 'Failed to download file');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Export Nutrition Data</Text>

            <View style={styles.section}>
                <Text style={styles.label}>Date Range:</Text>
                <View style={styles.dateRow}>
                    <TouchableOpacity
                        style={styles.dateButton}
                        onPress={() => setShowStartDatePicker(true)}
                    >
                        <Text style={styles.dateButtonText}>
                            From: {startDate.toLocaleDateString()}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.dateButton}
                        onPress={() => setShowEndDatePicker(true)}
                    >
                        <Text style={styles.dateButtonText}>
                            To: {endDate.toLocaleDateString()}
                        </Text>
                    </TouchableOpacity>
                </View>

                {showStartDatePicker && (
                    <DateTimePicker
                        value={startDate}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={(event, selectedDate) => {
                            setShowStartDatePicker(Platform.OS === 'ios');
                            if (selectedDate) setStartDate(selectedDate);
                        }}
                    />
                )}

                {showEndDatePicker && (
                    <DateTimePicker
                        value={endDate}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={(event, selectedDate) => {
                            setShowEndDatePicker(Platform.OS === 'ios');
                            if (selectedDate) setEndDate(selectedDate);
                        }}
                    />
                )}
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>Export Format:</Text>
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={format}
                        onValueChange={(itemValue) => setFormat(itemValue)}
                        style={styles.picker}
                    >
                        <Picker.Item label="CSV" value="csv" />
                        <Picker.Item label="Excel" value="excel" />
                        <Picker.Item label="PDF" value="pdf" />
                        <Picker.Item label="Text" value="txt" />
                    </Picker>
                </View>
            </View>

            <TouchableOpacity
                style={[styles.exportButton, isExporting && styles.exportButtonDisabled]}
                onPress={handleExport}
                disabled={isExporting}
            >
                <Icon name="download" size={20} color="white" style={styles.icon} />
                <Text style={styles.exportButtonText}>
                    {isExporting ? 'Exporting...' : 'Export Data'}
                </Text>
            </TouchableOpacity>

            <Text style={styles.subtitle}>Saved Exports</Text>
            {exports.length > 0 ? (
                <FlatList
                    data={exports}
                    renderItem={renderExportItem}
                    keyExtractor={(item) => item.uri}
                    style={styles.exportsList}
                />
            ) : (
                <Text style={styles.noExportsText}>No exports saved yet</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#f4f4f4",
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 20,
        color: "brown",
        textAlign: "center",
    },
    subtitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginTop: 30,
        marginBottom: 10,
        color: "brown",
    },
    section: {
        marginBottom: 25,
    },
    label: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 10,
        color: "#333",
    },
    dateRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    dateButton: {
        backgroundColor: "white",
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#ddd",
        width: "48%",
    },
    dateButtonText: {
        color: "#333",
        textAlign: "center",
    },
    pickerContainer: {
        backgroundColor: "white",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#ddd",
    },
    picker: {
        height: 50,
        width: "100%",
    },
    exportButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "brown",
        padding: 15,
        borderRadius: 8,
        marginTop: 10,
    },
    exportButtonDisabled: {
        opacity: 0.6,
    },
    exportButtonText: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
        marginLeft: 10,
    },
    exportsList: {
        flex: 1,
        marginTop: 10,
    },
    exportItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "white",
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#eee",
    },
    exportInfo: {
        flex: 1,
    },
    exportName: {
        fontWeight: "bold",
        marginBottom: 5,
    },
    exportDetails: {
        fontSize: 12,
        color: "#666",
    },
    exportActions: {
        flexDirection: "row",
    },
    exportIcon: {
        marginLeft: 15,
    },
    noExportsText: {
        textAlign: "center",
        color: "#666",
        marginTop: 20,
    },
    icon: {
        marginRight: 10,
    },
});