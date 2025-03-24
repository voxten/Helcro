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
    timeInput: {
        width: 50,
        padding: 10,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#ccc',
        textAlign: 'center',
    },
    timeInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    timeBox: {
        marginTop: 10,
        width: '100%',
        alignItems: 'center',
    },
    timeText: {
        fontSize: 16,
        marginBottom: 5,
    },
});

export default styles;