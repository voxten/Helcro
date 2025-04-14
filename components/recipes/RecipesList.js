import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  Modal, 
  ActivityIndicator, 
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Dimensions 
} from "react-native";
import RecipeCard from "./RecipeCard";
import styles2 from "./RecipesStyles";
import Icon from "react-native-vector-icons/FontAwesome6";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { API_BASE_URL } from '@env';

const { height } = Dimensions.get('window');

const RecipesList = ({ navigation }) => {
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [recipes, setRecipes] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [viewMode, setViewMode] = useState('grid');
    
    const fetchRecipesWithCategories = async (category = null) => {
        try {
            setLoading(true);
            let url = `${API_BASE_URL}/api/recipes`;
            if (category) {
                url = `${API_BASE_URL}/api/recipes/category/${encodeURIComponent(category)}`;
                setViewMode('grid');
            } else {
                setViewMode('category');
            }
            
            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${user?.token}`
                }
            });
            
            // No need to process categories here as the API now returns them
            setRecipes(response.data);
        } catch (error) {
            console.error("Error fetching recipes:", error);
            Alert.alert("Error", "Failed to load recipes");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };
    
    const fetchCategories = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/categories`, {
                headers: {
                    Authorization: `Bearer ${user?.token}`
                }
            });
            setCategories(response.data);
        } catch (error) {
            console.error("Error fetching categories:", error);
            Alert.alert("Error", "Failed to load categories");
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchRecipesWithCategories(selectedCategory);
    };

    useEffect(() => {
        fetchRecipesWithCategories();
        fetchCategories();
    }, []);

    const handleCategorySelect = (categoryName) => {
        setSelectedCategory(categoryName);
        setModalVisible(false);
        fetchRecipesWithCategories(categoryName);
    };

    const handleSearch = () => {
        if (!searchQuery) {
            fetchRecipesWithCategories(selectedCategory);
            return;
        }
        const filtered = recipes.filter(recipe => 
            recipe.Name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setRecipes(filtered);
    };

    const handleClearFilters = () => {
        setSelectedCategory(null);
        setSearchQuery("");
        fetchRecipesWithCategories();
    };

    const groupRecipesByCategory = () => {
        const grouped = {};
        
        // Initialize with all known categories
        categories.forEach(category => {
            grouped[category.Name] = [];
        });
        
        // Group recipes by their categories
        recipes.forEach(recipe => {
            if (recipe.categories && recipe.categories.length > 0) {
                recipe.categories.forEach(categoryName => {
                    if (grouped[categoryName]) {
                        grouped[categoryName].push(recipe);
                    }
                });
            } else {
                if (!grouped["Uncategorized"]) {
                    grouped["Uncategorized"] = [];
                }
                grouped["Uncategorized"].push(recipe);
            }
        });
        // Then populate with recipes
        recipes.forEach(recipe => {
            console.log("recipe.categories:", recipe.categories, "isArray?", Array.isArray(recipe.categories));
            if (recipe.categories && recipe.categories.length > 0) {
                recipe.categories.forEach(category => {
                    const categoryName = category.Name || category; // Obsługuje przypadki gdy to string lub obiekt
                    if (grouped[categoryName]) {
                        if (!grouped[categoryName].some(r => r.RecipeId === recipe.RecipeId)) {
                            grouped[categoryName].push(recipe);
                        }
                    }
                });
            } else {
                if (!grouped["Uncategorized"]) {
                    grouped["Uncategorized"] = [];
                }
                grouped["Uncategorized"].push(recipe);
            }
        });
        
        // Filter out empty categories and sort by category name
        const filteredGroups = {};
    Object.keys(grouped)
        .sort()
        .forEach(category => {
            if (grouped[category].length > 0) {
                filteredGroups[category] = grouped[category];
            }
        });
    
    return filteredGroups;
};

    const renderCategorySection = (category, recipes) => (
        <View key={category} style={styles.categorySection}>
            <Text style={styles.categoryTitle}>{category}</Text>
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScrollContent}
            >
                {recipes.map(recipe => (
                    <View key={recipe.RecipeId} style={styles.horizontalCard}>
                        <RecipeCard recipe={recipe} />
                    </View>
                ))}
            </ScrollView>
        </View>
    );

    if (loading && recipes.length === 0) {
        return (
            <View style={styles2.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <View style={styles2.container}>
            <TextInput
                style={styles2.searchInput}
                placeholder="Search recipes..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
            />

            <TouchableOpacity 
                style={styles2.button} 
                onPress={() => setModalVisible(true)}
            >
                <Icon name="clipboard-list" size={20} color="white" style={styles2.icon} />
                <Text style={styles2.buttonText}>
                    {selectedCategory || "Categories"}
                </Text>
            </TouchableOpacity>

            {user && (
                <TouchableOpacity 
                    style={styles2.button} 
                    onPress={() => navigation.navigate("RecipesAdd")}
                >
                    <Icon name="plus" size={20} color="white" style={styles2.icon} />
                    <Text style={styles2.buttonText}>Add Recipe</Text>
                </TouchableOpacity>
            )}

            {(selectedCategory || searchQuery) && (
                <TouchableOpacity 
                    style={styles2.clearButton}
                    onPress={handleClearFilters}
                >
                    <Text style={styles2.clearButtonText}>Clear Filters</Text>
                </TouchableOpacity>
            )}

            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles2.modalContainer}>
                    <View style={[styles2.modalContent, { maxHeight: height * 0.7 }]}>
                        <View style={styles2.modalHeader}>
                            <Text style={styles2.modalTitle}>Choose a category</Text>
                            <TouchableOpacity 
                                style={styles2.modalCloseButton} 
                                onPress={() => setModalVisible(false)}
                            >
                                <Icon name="times" size={20} color="#333" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles2.modalScroll}>
                            {categories.map((category) => (
                                <TouchableOpacity 
                                    key={category.CategoryId} 
                                    onPress={() => handleCategorySelect(category.Name)}
                                    style={styles2.modalItem}
                                >
                                    <Text style={styles2.modalButton}>{category.Name}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {viewMode === 'grid' ? (
                <FlatList
                    key="grid"
                    data={recipes}
                    renderItem={({ item }) => (
                        <View style={styles2.gridWrapper}>
                            <RecipeCard recipe={item} />
                        </View>
                    )}
                    keyExtractor={(item) => item.RecipeId.toString()}
                    numColumns={2}
                    columnWrapperStyle={styles2.gridRow}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                        />
                    }
                />
            ) : (
                <FlatList
                    key="category"
                    data={Object.entries(groupRecipesByCategory())}
                    renderItem={({ item: [category, categoryRecipes] }) => 
                        renderCategorySection(category, categoryRecipes)
                    }
                    keyExtractor={([category]) => category}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                        />
                    }
                    ListEmptyComponent={
                        <Text style={styles2.noRecipesText}>No recipes found</Text>
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    categorySection: {
        marginBottom: 10,
    },
    categoryTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
        marginBottom: 5,
        color: '#333',
    },
    horizontalScrollContent: {
        paddingHorizontal: 10,
    },
    horizontalCard: {
        marginRight: 10,
    },
});

export default RecipesList;