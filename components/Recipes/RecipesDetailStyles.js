import { StyleSheet } from "react-native";

const detailStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
        padding: 15,
        
    },
    detailTitle: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 10,
        color: "#333",
    },
    detailImage: {
        width: "100%",
        height: 250,
        borderRadius: 10,
        alignSelf: "center",
        marginBottom: 15,
        resizeMode: "cover",
    },
    detailRating: {
        fontSize: 18,
        textAlign: "center",
        marginBottom: 10,
        color: "#ff9800",
        fontWeight: "bold",
    },
    detailDescription: {
        fontSize: 16,
        textAlign: "justify",
        marginBottom: 15,
        color: "#555",
    },
    detailSection: {
        fontSize: 18,
        fontWeight: "bold",
        marginTop: 10,
        marginBottom: 5,
        color: "#444",
    },
    detailCategory: {
        fontSize: 16,
        backgroundColor: "#e0e0e0",
        padding: 8,
        borderRadius: 5,
        marginBottom: 5,
        textAlign: "center",
    },
    detailIngredient: {
        fontSize: 16,
        paddingVertical: 5,
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
    },
    bottom: {
        marginBottom: 25,
    },
    detailStep: {
        fontSize: 16,
        paddingVertical: 5,
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
        marginLeft: 10,
        marginRight: 10,
    }
    
});

export default detailStyles;
