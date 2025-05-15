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
import Icon from "react-native-vector-icons/FontAwesome";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { API_BASE_URL } from '@env';
import { useAccessibility } from "../AccessibleView/AccessibleView";
const { height } = Dimensions.get('window');

const RecipesList = ({ navigation }) => {
    const { highContrast } = useAccessibility();
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
            <View style={[styles.loadingContainer, highContrast && styles.highContrastBackground]}
>
                <ActivityIndicator size="large" color="#5D4037" />
            </View>
        );
    }

    return (
        <View style={[styles.container, highContrast && styles.highContrastBackground]}>
    {/* Search and Filter Bar */}
    <View style={[styles.searchContainer, highContrast && styles.highContrastBackground]}>
        <View style={[styles.searchInputContainer, highContrast && styles.secondContrast]}>
            <Icon name="search" size={16} color={highContrast ? '#FFFFFF' : '#999999'} style={styles.searchIcon} />
            <TextInput
                style={[styles.searchInput, highContrast && styles.highContrastTextInput]}
                placeholderTextColor={highContrast ? '#FFFFFF' : '#999999'}
                placeholder="Search recipes..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
            />
        </View>

        <View style={styles.buttonRow}>
            <TouchableOpacity
                style={styles.filterButton}
                onPress={() => setModalVisible(true)}
            >
                <Icon name="filter" size={16} color="#FFF" />
                <Text style={styles.filterButtonText}>
                    {selectedCategory || "Categories"}
                </Text>
            </TouchableOpacity>

            {user && (
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => navigation.navigate("RecipesAdd")}
                >
                    <Icon name="plus" size={16} color="#FFF" />
                </TouchableOpacity>
            )}
        </View>
    </View>

    {(selectedCategory || searchQuery) && (
        <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearFilters}
        >
            <Text style={styles.clearButtonText}>Clear Filters</Text>
            <Icon name="times" size={14} color="#FFF" />
        </TouchableOpacity>
    )}

    {/* Category Modal */}
    <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
            <View style={[styles.modalContainer, highContrast && styles.secondContrast]}>
                <View style={styles.modalHeader}>
                    <Text style={[styles.modalTitle, highContrast && styles.highContrastText]}>Select Category</Text>
                    <TouchableOpacity
                        onPress={() => setModalVisible(false)}
                    >
                        <Icon name="times" size={20} color={highContrast ? '#FFFFFF' : '#999999'} />
                    </TouchableOpacity>
                </View>
                <ScrollView style={styles.modalContent}>
                    {categories.map((category) => (
                        <TouchableOpacity
                            key={category.CategoryId}
                            onPress={() => handleCategorySelect(category.Name)}
                            style={[styles.categoryItem, highContrast && styles.highContrastListItem]}
                        >
                            <Text style={[styles.categoryText, highContrast && styles.highContrastText]}>{category.Name}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        </View>
    </Modal>

    {/* Recipe List */}
    {viewMode === 'grid' ? (
        <FlatList
            key="grid"
            data={recipes}
            renderItem={({ item }) => (
                <View style={[styles.gridItem, highContrast && styles.highContrastListItem]}>
                    <RecipeCard recipe={item} highContrast={highContrast} />
                </View>
            )}
            keyExtractor={(item) => item.RecipeId.toString()}
            numColumns={2}
            columnWrapperStyle={[styles.gridRow, highContrast && styles.highContrastBackground]}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={highContrast ? ['#FFFFFF'] : ['#5D4037']}
                />
            }
            contentContainerStyle={[styles.listContent, highContrast && styles.highContrastBackground]}
        />
    ) : (
        <FlatList
            key="category"
            data={Object.entries(groupRecipesByCategory())}
            renderItem={({ item: [category, categoryRecipes] }) => (
                <View style={[styles.categorySection, highContrast && styles.highContrastBackground]}>
                    <Text style={[styles.categoryTitle, highContrast && styles.highContrastText]}>{category}</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={[styles.horizontalList, highContrast && styles.highContrastBackground]}
                    >
                        {categoryRecipes.map(recipe => (
                            <View key={recipe.RecipeId} style={[styles.horizontalItem, highContrast && styles.highContrastListItem]}>
                                <RecipeCard recipe={recipe} highContrast={highContrast} />
                            </View>
                        ))}
                    </ScrollView>
                </View>
            )}
            keyExtractor={([category]) => category}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={highContrast ? ['#FFFFFF'] : ['#5D4037']}
                />
            }
            contentContainerStyle={[styles.listContent, highContrast && styles.highContrastBackground]}
            ListEmptyComponent={
                <View style={[styles.emptyState, highContrast && styles.highContrastBackground]}>
                    <Icon name="bowl-food" size={40} color={highContrast ? '#FFFFFF' : '#BCAAA4'} />
                    <Text style={[styles.emptyText, highContrast && styles.highContrastText]}>No recipes found</Text>
                </View>
            }
        />
    )}
</View>
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
    highContrastText: {
        color: '#FFFFFF', // Biały tekst
    },
    highContrastTextInput: {
        color: '#FFFFFF', // Biały tekst w inputach
        borderColor: '#FFFFFF', // Białe obramowania
    },
    highContrastListItem: {
        borderColor: '#FFFFFF', // Białe obramowania dla elementów listy
    },
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
    },
    searchContainer: {
        padding: 16,
        paddingBottom: 8,
    },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 10,
        paddingHorizontal: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#D7CCC8',
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        height: 48,
        color: '#5D4037',
        fontSize: 16,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'brown',
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 16,
        flex: 1,
        marginRight: 10,
    },
    filterButtonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 8,
    },
    addButton: {
        backgroundColor: 'brown',
        width: 48,
        height: 48,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    clearButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#D32F2F',
        padding: 10,
        marginHorizontal: 16,
        marginBottom: 12,
        borderRadius: 8,
    },
    clearButtonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '500',
        marginRight: 6,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        width: '80%',
        maxHeight: height * 0.7,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#EFEBE9',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#5D4037',
    },
    modalContent: {
        padding: 8,
    },
    categoryItem: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#EFEBE9',
    },
    categoryText: {
        fontSize: 16,
        color: '#5D4037',
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    gridRow: {
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    gridItem: {
        width: '48%',
    },
    categorySection: {
        marginBottom: 24,
    },
    categoryTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#5D4037',
        marginBottom: 12,
        paddingLeft: 8,
    },
    horizontalList: {
        paddingLeft: 8,
    },
    horizontalItem: {
        marginRight: 12,
        width: 160,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        fontSize: 16,
        color: '#8D6E63',
        marginTop: 12,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF8F6',
    },
});

export default RecipesList;