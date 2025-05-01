import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const ProductDetail = ({ route }) => {
    const { product } = route.params;

    const nutritionFacts = [
        { label: 'Calories', value: product.calories, unit: 'kcal' },
        { label: 'Proteins', value: product.proteins, unit: 'g' },
        { label: 'Fats', value: product.fats, unit: 'g' },
        { label: 'Carbs', value: product.carbohydrates, unit: 'g' },
        { label: 'Sugars', value: product.sugars, unit: 'g' },
        { label: 'Fibers', value: product.fibers, unit: 'g' },
        { label: 'Salt', value: product.salt, unit: 'g' }
    ];

    return (
        <ScrollView style={styles.container}>
            {product.image && (
                <Image
                    source={{ uri: product.image || "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg" }}
                    style={styles.productImage}
                />
            )}

            <Text style={styles.productName}>{product.product_name}</Text>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Nutrition Facts</Text>
                <View style={styles.nutritionGrid}>
                    {nutritionFacts.map((item, index) => (
                        <View key={index} style={styles.nutritionItem}>
                            <Text style={styles.nutritionLabel}>{item.label}</Text>
                            <Text style={styles.nutritionValue}>
                                {item.value || 0}{item.unit}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20
    },
    productImage: {
        width: '100%',
        height: 250,
        borderRadius: 10,
        marginBottom: 20
    },
    productName: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center'
    },
    section: {
        marginBottom: 20
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333'
    },
    nutritionGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between'
    },
    nutritionItem: {
        width: '48%',
        padding: 12,
        marginBottom: 10,
        backgroundColor: '#f8f8f8',
        borderRadius: 8
    },
    nutritionLabel: {
        fontSize: 14,
        color: '#666'
    },
    nutritionValue: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 5
    }
});

export default ProductDetail;