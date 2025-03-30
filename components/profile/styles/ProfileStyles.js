import {StyleSheet} from "react-native";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#eee",
        alignItems: "center",
    },
    title: {
        color: "white",
        fontSize: 24,
        marginBottom: 20,
    },
    profilePicContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        overflow: "hidden",
        marginBottom: 20,
    },
    profilePic: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
    input: {
        width: "100%",
        padding: 10,
        justifyContent: 'space-between',
        marginBottom: 15,
        backgroundColor: "#fff",
        borderRadius: 10,
        elevation: 3,
    },
    submitButton: {
        width: "100%",
        backgroundColor: "brown",
        padding: 15,
        borderRadius: 10,
        marginVertical: 5,
    },
    submitButtonText: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
        textAlign: "center",
    },
});

export default styles;
