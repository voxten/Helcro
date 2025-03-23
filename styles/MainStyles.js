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
        backgroundColor: '#eee',
        borderRadius: 10,
        alignItems: 'center',
    },
    header: {
        fontSize: 20,
        marginBottom: 10,
    },
    container: {
        flex: 1,
        backgroundColor: '#eee',
        paddingHorizontal: 20,
        paddingTop: 40
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 10,
        elevation: 3,
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
    submitButton: {
        backgroundColor: "brown",
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
        marginVertical: 20
    },
    submitButtonText: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold"
    },
});

export default styles;
