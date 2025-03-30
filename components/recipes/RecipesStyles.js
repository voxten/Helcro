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
    gridRow: {
        justifyContent: "space-between",
        marginBottom: 15,
    },
    gridWrapper: {
        width: "48%", // Keeps grid items close together
        marginBottom: 10, // Less spacing in the grid
        alignItems: "center",
    },

    /** LIST VIEW STYLES */
    listContainer: {
        paddingVertical: 10,
        paddingHorizontal: 5,
    },
    listWrapper: {
        marginRight: 15, // Adds space between horizontal items
    },
    recipeWrapper: {
        width: 160, // Ensures uniform size for both grid & list
        marginBottom: 15,
        alignItems: "center",
    },
    /** LIST VIEW STYLES */
    horizontalList: {
        paddingVertical: 10,
        paddingHorizontal: 5,
    },

    /** RECIPE CARD */
    recipeCard: {
        backgroundColor: "white",
        borderRadius: 10,
        padding: 10,
        width: 160, // Fixed width
        height: 220, // Fixed height
        alignItems: "center",
        justifyContent: "space-between",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    recipeImage: {
        width: 140, // Fixed width for consistency
        height: 120, // Fixed height for uniformity
        borderRadius: 10,
        marginBottom: 5,
        resizeMode: "cover", // Ensures images scale properly
    },
    recipeName: {
        fontSize: 14,
        fontWeight: "bold",
        textAlign: "center",
        maxWidth: 140,
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
    modalButton: {
        padding: 10,
        fontSize: 16,
        borderBottomColor: "#ddd"
    },
    closeButton: {
        backgroundColor: "brown",
        borderRadius: 5,
        padding: 10,
        marginRight: 5,
        alignItems: "center",
    },
    closeButtonText: {
        color: 'white',
        fontSize: 16,
    },

    clearCategory: {
        textAlign: "center",
        color: "#ff0000",
        marginTop: 10,
        fontWeight: "bold"
    },
    button: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "brown",
        paddingVertical: 15,
        paddingHorizontal: 20,
        marginVertical: 15,
        borderRadius: 8,
    },
    icon: {
        marginRight: 20,
    },
    buttonText: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
    },
});

export default styles2;
