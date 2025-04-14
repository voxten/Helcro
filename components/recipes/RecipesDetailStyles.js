import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
        padding: 15,
        backgroundColor: '#fff'
    },
    detailTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#333'
    },
    userName: {
        fontSize: 16,
        color: '#666',
        marginBottom: 15
    },
    detailImage: {
        width: '100%',
        height: 250,
        borderRadius: 10,
        marginBottom: 15
    },
    detailRating: {
        fontSize: 18,
        color: '#FFD700',
        marginBottom: 15
    },
    detailDescription: {
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 20,
        color: '#444'
    },
    detailSection: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 15,
        marginBottom: 10,
        color: '#333'
    },
    nutritionBox: {
        backgroundColor: '#f8f8f8',
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#e0e0e0'
    },
    nutritionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
        textAlign: 'center'
    },
    nutritionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8
    },
    nutritionLabel: {
        fontSize: 16,
        color: '#555'
    },
    nutritionValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333'
    },
    categoriesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 10
    },
    categoryPill: {
        backgroundColor: '#e0e0e0',
        borderRadius: 15,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginRight: 8,
        marginBottom: 8
    },
    categoryText: {
        fontSize: 14,
        color: '#333'
    },
    ingredientRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
        paddingHorizontal: 10
    },
    ingredientName: {
        fontSize: 16,
        color: '#444',
        flex: 2
    },
    ingredientAmount: {
        fontSize: 16,
        color: '#666',
        flex: 1,
        textAlign: 'right'
    },
    stepContainer: {
        flexDirection: 'row',
        marginBottom: 10,
        paddingHorizontal: 10
    },
    stepNumber: {
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 10,
        color: '#333'
    },
    stepText: {
        fontSize: 16,
        color: '#444',
        flex: 1,
        lineHeight: 22
    },
    bottomSpacer: {
        height: 50
    }
});