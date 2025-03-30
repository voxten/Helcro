import { StyleSheet } from "react-native";

const styles2 = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
        padding: 10,
    },
    categoryContainer: {
        backgroundColor: "#e0e0e0",
        padding: 10,
        marginBottom: 15,
        borderRadius: 10,
    },
    categoryTitle: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 10,
        color: "#333",
    },
    recipeCard: {
        backgroundColor: "white",
        borderRadius: 10,
        padding: 10,
        marginRight: 10,
        alignItems: "center",
        width: 150,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    recipeImage: {
        width: 120,
        height: 120,
        borderRadius: 10,
        marginBottom: 5,
    },
    recipeName: {
        fontSize: 16,
        fontWeight: "bold",
        textAlign: "center",
    },
    recipeRating: {
        fontSize: 14,
        color: "#666",
    },
    searchInput: {
        height: 40,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        paddingHorizontal: 10,
        marginVertical: 10,
        backgroundColor: "#fff"
    },
    
    categoryButton: {
        padding: 10,
        backgroundColor: "#007bff",
        borderRadius: 8,
        alignItems: "center",
        marginVertical: 10
    },
    
    categoryButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold"
    },
    
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)"
    },
    
    modalContent: {
        width: "80%",
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 10
    },
    
    modalItem: {
        padding: 10,
        fontSize: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#ddd"
    },
    
    clearCategory: {
        textAlign: "center",
        color: "#ff0000",
        marginTop: 10,
        fontWeight: "bold"
    }
    
});

export default styles2;
