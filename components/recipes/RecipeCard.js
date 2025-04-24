import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/FontAwesome6";

const RecipeCard = ({ recipe }) => {
    const navigation = useNavigation();

    const photoSource = recipe?.Image || recipe?.photo
        ? { uri: recipe.Image || recipe.photo }
        : { uri: "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg" };

    const recipeName = recipe?.Name || recipe?.name || "Unnamed Recipe";
    const rating = recipe?.rating || 4.5;

    return (
        <TouchableOpacity
            onPress={() => navigation.navigate("RecipeDetail", {
                recipeId: recipe.RecipeId || recipe.id,
                initialRecipe: {
                    Name: recipe.Name || recipe.name,
                    Image: recipe.Image || recipe.photo,
                    UserName: recipe.UserName || recipe.userName,
                    rating: rating,
                    categories: recipe.categories || []
                }
            })}
            activeOpacity={0.8}
            style={styles.cardContainer}
        >
            <View style={styles.card}>
                <Image source={photoSource} style={styles.image} />
                <View style={styles.content}>
                    <Text numberOfLines={2} style={styles.title}>
                        {recipeName}
                    </Text>
                    <View style={styles.ratingContainer}>
                        <Icon name="star" size={14} color="#FFC107" solid />
                        <Text style={styles.ratingText}>
                            {typeof rating === 'number' ? rating.toFixed(1) : rating}
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        width: '100%',
        marginBottom: 16,
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#5D4037',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    image: {
        width: '100%',
        height: 140,
        resizeMode: 'cover',
    },
    content: {
        padding: 12,
    },
    title: {
        fontSize: 15,
        fontWeight: '600',
        color: '#5D4037',
        marginBottom: 8,
        height: 40,
        lineHeight: 20,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        fontSize: 14,
        color: '#8D6E63',
        marginLeft: 6,
    },
    badge: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(255,255,255,0.9)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
});

export default RecipeCard;