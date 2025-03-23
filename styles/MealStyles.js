import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        width: 300,
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        alignItems: 'center',
    },
    header: {
        fontSize: 20,
        marginBottom: 10,
    },
    button: {
        padding: 15,
        marginVertical: 10,
        borderRadius: 5,
        width: '100%',
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 14,
        color: 'black',
    },
    buttonScrollContainer: {
        width: '100%',
        maxHeight: 200,
    },
    input: {
        width: '100%',
        padding: 10,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#ccc',
        marginBottom: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 20,
    },
    closeButton: {
        marginTop: 20,
        padding: 10,
        backgroundColor: 'brown',
        borderRadius: 5,
        alignItems: 'center',
    },
    closeButtonText: {
        color: 'white',
        fontSize: 16,
    },
    productText: {
        marginTop: 10,
        fontSize: 16,
    },
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
    separator: {
        fontSize: 18,
        marginHorizontal: 5,
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
    }
});

export default styles;
