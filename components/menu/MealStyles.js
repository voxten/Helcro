import {StyleSheet} from "react-native";

const styles = StyleSheet.create({
    nameInput: {
        width: '80%',
        padding: 10,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#ccc',
        textAlign: 'center',
    },
    nameBox: {
        marginTop: 10,
        width: '100%',
        alignItems: 'center',
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
    button: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "brown",
        paddingVertical: 15,
        paddingHorizontal: 20,
        marginTop: 15,
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
    submitButtonText: {
        color: 'white',
        fontSize: 16,
    },
    separator: {
        fontSize: 18,
        marginHorizontal: 5,
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
    timeBox: {
        marginTop: 20,
        width: "100%",
        padding: 15,
        borderRadius: 10,
        backgroundColor: "#f7f7f7",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3, // For Android shadow
    },
    timeText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#333",
        marginBottom: 10,
    },
    timePickerButton: {
        backgroundColor: "brown",
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 8,
        alignItems: "center",
    },
    timePickerText: {
        fontSize: 18,
        color: "#fff",
        fontWeight: "bold",
    },
    modalContainer: {
        flex: 1, // Sprawia, że kontener modalny wypełnia całą dostępną przestrzeń
        justifyContent: 'flex-start', // Ustawia elementy w kontenerze od góry
        alignItems: 'center', // Centrowanie zawartości kontenera
        paddingHorizontal: 20, // Dodaj trochę przestrzeni po bokach
      },
      disabledButton: {
        backgroundColor: '#ddd',
        opacity: 0.5,
      },
      buttonScrollContainer: {
        width: '100%',
        maxHeight: 300,
    },

});

export default styles;