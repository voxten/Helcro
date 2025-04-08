import React, { useState } from "react";
import { ScrollView, View, Text, FlatList, TextInput, TouchableOpacity, Modal } from "react-native";
import RecipeCard from "./RecipeCard";
import Recipe from "./Recipe";
import styles2 from "./RecipesStyles";
import Icon from "react-native-vector-icons/FontAwesome6";

const recipes = [
    new Recipe(
        "Spaghetti Bolognese",
        "A classic Italian pasta dish.",
        [{ name: "Pasta", amount: "200g" }, { name: "Tomato Sauce", amount: "100ml" }, { name: "Ground Beef", amount: "150g" }],
        "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg",
        ["Italian", "Pasta"],
        4,
        1,
        [
            "Gotuj makaron zgodnie z instrukcją na opakowaniu.",
            "Podsmaż mielone mięso na patelni.",
            "Dodaj sos pomidorowy i gotuj przez 10 minut.",
            "Połącz z makaronem i podawaj ciepłe."
        ]
    ),
    new Recipe(
        "Chicken Salad",
        "A fresh and healthy chicken salad.",
        [{ name: "Chicken", amount: "150g" }, { name: "Lettuce", amount: "1 head" }, { name: "Tomato", amount: "2" }, { name: "Cucumber", amount: "1" }],
        "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg",
        ["Healthy", "Salad"],
        5,
        2,
        [
            "Ugotuj i pokrój kurczaka na kawałki.",
            "Posiekaj sałatę, pomidory i ogórka.",
            "Wymieszaj wszystkie składniki w misce.",
            "Dodaj sos i delikatnie wymieszaj przed podaniem."
        ]
    ),
    new Recipe(
        "Vegetable Stir Fry",
        "A quick and easy vegetable stir fry.",
        [{ name: "Bell peppers", amount: "4" }, { name: "Broccoli", amount: "2" }, { name: "Carrots", amount: "4" }, { name: "Soy Sauce", amount: "100ml" }],
        "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg",
        ["Healthy", "Vegan"],
        4.5,
        3,
        [
            "Pokrój paprykę w kwadraty, marchewkę w słupki, a pora w plasterki. Podziel brokuły na równej wielkości różyczki.",
            "Sos: Zetrzyj czosnek i imbir do miski. Dodaj miód, sok z limonki, Sos sojowy Kikkoman i ketchup. Dokładnie wymieszaj.",
            "Rozgrzej odrobinę oleju na patelni i dodaj marchewkę. Smaż przez około 1 minutę. Dodaj paprykę i brokuły. Smaż przez 3-5 minut. Dodaj sos i dokładnie wymieszaj. Smaż przez kolejne 1-2 minuty."
        ]
    )
];

const categorizeRecipes = (recipes) => {
    const categories = {};
    recipes.forEach((recipe) => {
        recipe.categories.forEach((category) => {
            if (!categories[category]) {
                categories[category] = [];
            }
            categories[category].push(recipe);
        });
    });
    return categories;
};

const RecipesList = ({ navigation }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const categorizedRecipes = categorizeRecipes(recipes);
    
    const filteredRecipes = recipes.filter(recipe => 
        recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
    );


    return (
        <View style={styles2.container}>
            <TextInput
                style={styles2.searchInput}
                placeholder="Search recipes..."
                value={searchQuery}
                onChangeText={setSearchQuery}
            />

            <TouchableOpacity style={styles2.button} onPress={() => setModalVisible(true)}>
                <Icon name="clipboard-list" size={20} color="white" style={styles2.icon} />
                <Text style={styles2.buttonText}>Categories</Text>
            </TouchableOpacity>

            // Add Recipe
            <TouchableOpacity style={styles2.button} onPress={() => navigation.navigate("RecipesAdd")}>
                <Icon name="plus" size={20} color="white" style={styles2.icon} />
                <Text style={styles2.buttonText}>Add Recipe</Text>
            </TouchableOpacity>

            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles2.modalContainer}>
                    <View style={styles2.modalContent}>
                        <Text style={styles2.modalItem}>Choose a category</Text>
                        {Object.keys(categorizedRecipes).map((category) => (
                            <TouchableOpacity key={category} onPress={() => {
                                setSelectedCategory(category);
                                setModalVisible(false);
                            }}>
                                <Text style={styles2.modalButton}>{category}</Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity style={styles2.closeButton} onPress={() => {
                            setModalVisible(false);
                            setSelectedCategory(null); // Dodano resetowanie stanu
                        }}>
                            <Text style={styles2.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <FlatList
                key={(searchQuery || selectedCategory) ? "grid" : "list"}
                data={searchQuery ? filteredRecipes : selectedCategory ? categorizedRecipes[selectedCategory] : Object.keys(categorizedRecipes)}
                renderItem={({ item }) =>
                    searchQuery || selectedCategory ? (
                        // GRID VIEW (2 columns)
                        <View style={styles2.gridWrapper}>
                            <RecipeCard recipe={item} />
                        </View>
                    ) : (
                        // LIST VIEW (horizontal scroll per category)
                        <View style={styles2.categoryContainer}>
                            <Text style={styles2.categoryTitle}>{item}</Text>
                            <FlatList
                                horizontal
                                data={categorizedRecipes[item]}
                                renderItem={({ item }) => (
                                    <View style={styles2.listWrapper}>
                                        <RecipeCard recipe={item} />
                                    </View>
                                )}
                                keyExtractor={(item, idx) => idx.toString()}
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles2.listContainer}
                            />
                        </View>
                    )
                }
                keyExtractor={(item, index) => index.toString()}
                numColumns={searchQuery || selectedCategory ? 2 : 1}
                columnWrapperStyle={searchQuery || selectedCategory ? styles2.gridRow : null}
            />
        </View>
    );
};

export default RecipesList;