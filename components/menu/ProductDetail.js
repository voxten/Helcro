import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAccessibility } from "../AccessibleView/AccessibleView";
const ProductDetail = ({ route }) => {
    const { product } = route.params;
    const { highContrast } = useAccessibility();
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
        <ScrollView style={[styles.container, highContrast && styles.highContrastBackground]}>
            {product.image && (
                <Image
                    source={{ uri: product.image || "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg" }}
                    style={styles.productImage}
                />
            )}

            <Text style={[styles.productName, highContrast && styles.highContrastBackground]}>{product.product_name}</Text>

            <View style={[styles.section, highContrast && styles.highContrastBackground]}>
                <Text style={[styles.sectionTitle, highContrast && styles.highContrastBackground]}>Nutrition Facts</Text>
                <View style={[styles.nutritionGrid, highContrast && styles.highContrastBackground]}>
                    {nutritionFacts.map((item, index) => (
                        <View key={index} style={[styles.nutritionItem, highContrast && styles.secondContrast]}>
                            <Text style={[styles.nutritionLabel, highContrast && styles.secondContrast]}>{item.label}</Text>
                            <Text style={[styles.nutritionValue, highContrast && styles.secondContrast]}>
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
    highContrastBackground: {
        backgroundColor: '#2e2c2c', 
        color:'white',
    },
    secondContrast: {
        backgroundColor: "#454343",
        color:'white',
    },
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