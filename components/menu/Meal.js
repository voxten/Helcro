import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, TextInput, FlatList, Image, StyleSheet } from 'react-native';
import axios from "axios";
import { API_BASE_URL } from '@env';
const apiUrl = `${API_BASE_URL}`;

import { useAuth } from "../context/AuthContext";
import Icon from "react-native-vector-icons/Ionicons";
import Icon2 from "react-native-vector-icons/FontAwesome6";
import { useAccessibility } from "../AccessibleView/AccessibleView";
export default function Meal({ onClose, onSave, existingProducts = [], selectedDate, mealType, mealName }) {
  const { highContrast } = useAccessibility();
  const { user } = useAuth();
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [products, setProducts] = useState([]);
  const [databaseProducts, setDatabaseProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newProduct, setNewProduct] = useState({
    product_name: '',
    calories: '',
    proteins: '',
    fats: '',
    carbohydrates: ''
  });
  const [isButtonsDisabled, setIsButtonsDisabled] = useState(false);
  const [isChoosingProduct, setIsChoosingProduct] = useState(false);

  const [isChoosingRecipe, setIsChoosingRecipe] = useState(false);
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [recipeSearchQuery, setRecipeSearchQuery] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [recipeProducts, setRecipeProducts] = useState([]);

  useEffect(() => {
    axios.get(apiUrl + "/products")
        .then(response => {
          setDatabaseProducts(response.data);
          setFilteredProducts(response.data);
        })
        .catch(error => console.error("Error fetching data:", error.response.data));

        axios.get(`${API_BASE_URL}/api/recipes`)
      .then(response => {
        setRecipes(response.data);
        setFilteredRecipes(response.data);
      })
      .catch(error => console.error("Error fetching recipes:", error));
  }, []);

  useEffect(() => {
    const loadData = async () => {
      const intakeProducts = await fetchIntakeLog();
      if (intakeProducts.length > 0) {
        setProducts(intakeProducts);
      } else if (existingProducts.length > 0) {
        setProducts(existingProducts);
      }
    };

    loadData();
  }, [selectedDate, existingProducts]);

  
  
  const fetchIntakeLog = async () => {
    try {
      if (user && user.UserId) {
        const formattedDate = selectedDate.toISOString().split('T')[0];
        const response = await axios.get(`${apiUrl}/intakeLog`, {
          params: {
            userId: user.UserId,
            date: formattedDate
          }
        });

        if (response.data) {
          return response.data.products || [];
        }
      }
      return [];
    } catch (error) {
      console.log("error w meal");
      console.error("Error fetching intake log:", error);
      return [];
    }
  };

  const handleCreateProduct = () => {
    setIsCreatingProduct(true);
    setIsChoosingProduct(false);
    setIsChoosingRecipe(false);
    setIsButtonsDisabled(true);
  };

  const handleChooseProduct = () => {
    setIsChoosingProduct(true);
    setIsCreatingProduct(false);
    setIsChoosingRecipe(false);
  };
  const handleChooseRecipe = () => {
    setIsChoosingRecipe(true);
    setIsCreatingProduct(false);
    setIsChoosingProduct(false);
  };

  const handleCancel = () => {
    setIsCreatingProduct(false);
    setIsChoosingProduct(false);
    setIsChoosingRecipe(false);
    setSearchQuery("");
    setRecipeSearchQuery("");
    setFilteredProducts(databaseProducts);
    setFilteredRecipes(recipes);
    setNewProduct({
      product_name: '',
      calories: '',
      proteins: '',
      fats: '',
      carbohydrates: ''
    });
    setSelectedRecipe(null);
    setRecipeProducts([]);
    setIsButtonsDisabled(false);
  };

  const handleAddProduct = () => {
    setProducts([...products, newProduct]);
    handleCancel();
  };

  const handleSelectProduct = (product) => {
    const productExists = products.some(p =>
        (p.ProductId || p.productId) === product.ProductId
    );

    if (!productExists) {
      setProducts(prev => [
        ...prev,
        {
          ...product,
          productId: product.ProductId,
          grams: 100,
          originalValues: {
            calories: product.calories,
            proteins: product.proteins,
            fats: product.fats,
            carbohydrates: product.carbohydrates
          },
          calories: product.calories,
          proteins: product.proteins,
          fats: product.fats,
          carbohydrates: product.carbohydrates
        }
      ]);
    }
    setIsChoosingProduct(false);
  };
  const handleSelectRecipe = async (recipe) => {
    try {
      // Fetch recipe details to get the products
      const response = await axios.get(`${API_BASE_URL}/api/recipes/detail/${recipe.RecipeId}`);
      const recipeDetails = response.data;
      
      // Format the recipe products for display
      const formattedProducts = recipeDetails.products.map(product => ({
        ...product,
        productId: product.ProductId || product.productId,
        product_name: product.name,
        grams: product.amount || 100,
        originalValues: {
          calories: (product.calories / (product.amount || 100)) * 100,
          proteins: (product.proteins / (product.amount || 100)) * 100,
          fats: (product.fats / (product.amount || 100)) * 100,
          carbohydrates: (product.carbohydrates / (product.amount || 100)) * 100
        },
        calories: product.calories,
        proteins: product.proteins,
        fats: product.fats,
        carbohydrates: product.carbohydrates,
        isFromRecipe: true,
        recipeName: recipe.Name || recipe.name,
        recipeImage: recipe.Image || recipe.photo
      }));
      
      setSelectedRecipe(recipe);
      setRecipeProducts(formattedProducts);
    } catch (error) {
      console.error("Error fetching recipe details:", error);
      Alert.alert("Error", "Failed to load recipe details");
    }
  };
  const handleAddRecipe = () => {
    setProducts(prev => [...prev, ...recipeProducts]);
    setSelectedRecipe(null);
    setRecipeProducts([]);
    setIsChoosingRecipe(false);
  };
  const handleRecipeGramsChange = (text, index) => {
    const grams = parseFloat(text) || 0;
    setRecipeProducts(prev => {
      const updated = [...prev];
      const product = updated[index];

      const original = product.originalValues || {
        calories: product.calories,
        proteins: product.proteins,
        fats: product.fats,
        carbohydrates: product.carbohydrates
      };

      updated[index] = {
        ...product,
        grams,
        calories: (parseFloat(original.calories || 0) / 100 * grams).toFixed(2),
        proteins: (parseFloat(original.proteins || 0) / 100 * grams).toFixed(2),
        fats: (parseFloat(original.fats || 0) / 100 * grams).toFixed(2),
        carbohydrates: (parseFloat(original.carbohydrates || 0) / 100 * grams).toFixed(2),
        originalValues: original
      };
      return updated;
    });
  };

  const handleGramsChange = (text, index) => {
    const grams = parseFloat(text) || 0;
    setProducts(prev => {
      const updated = [...prev];
      const product = updated[index];

      const original = product.originalValues || {
        calories: product.calories,
        proteins: product.proteins,
        fats: product.fats,
        carbohydrates: product.carbohydrates
      };

      updated[index] = {
        ...product,
        grams,
        calories: (parseFloat(original.calories || 0) / 100 * grams).toFixed(2),
        proteins: (parseFloat(original.proteins || 0) / 100 * grams).toFixed(2),
        fats: (parseFloat(original.fats || 0) / 100 * grams).toFixed(2),
        carbohydrates: (parseFloat(original.carbohydrates || 0) / 100 * grams).toFixed(2),
        originalValues: original
      };
      return updated;
    });
  };

  const handleSave = async () => {
    try {
      let mealId;
      let mealTypeName;

      if (typeof mealType === 'number') {
        const response = await axios.get(`${API_BASE_URL}/meals`);
        const meal = response.data.find(m => m.MealId === mealType);
        if (!meal) throw new Error(`Meal ID ${mealType} not found`);
        mealTypeName = meal.MealType;
        mealId = meal.MealId;
      } else if (typeof mealType === 'string') {
        mealTypeName = mealType;
        const response = await axios.get(`${API_BASE_URL}/meals`);
        const meal = response.data.find(m => m.MealType === mealType);
        if (!meal) throw new Error(`Meal type '${mealType}' not found`);
        mealId = meal.MealId;
      }

      const payload = {
        userId: user.UserId,
        date: selectedDate.toISOString().split('T')[0],
        mealType: mealTypeName,
        mealName: mealName || mealTypeName,
        products: products.map(p => ({
          productId: p.ProductId || p.productId,
          grams: p.grams || 100
        })),
        mealId
      };

      const response = await axios.post(`${API_BASE_URL}/intakeLog`, payload);

      if (response.data.success) {
        if (onSave) {
          onSave(response.data.products, true);
        }
        onClose();
      }
    } catch (error) {
      console.error("Save failed:", error);
      alert(`Save failed: ${error.message}`);
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    const filtered = databaseProducts.filter(product =>
        product.product_name.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredProducts(filtered);
  };
  const handleRecipeSearch = (text) => {
    setRecipeSearchQuery(text);
    const filtered = recipes.filter(recipe =>
      (recipe.Name || recipe.name).toLowerCase().includes(text.toLowerCase())
    );
    setFilteredRecipes(filtered);
  };

  const renderProductItem = ({ item, index }) => (
  <View style={[localStyles.productCard, highContrast && localStyles.highContrastCard]}>
    <TouchableOpacity
        style={localStyles.removeButton}
        onPress={() => {
          const updatedProducts = [...products];
          updatedProducts.splice(index, 1);
          setProducts(updatedProducts);
        }}
    >
      <Icon2 name="trash" size={16} color={highContrast ? "#FF0000" : "red"} />
    </TouchableOpacity>

    <View style={localStyles.productContent}>
      {item.image && <Image source={{ uri: item.image }} style={localStyles.productImage} />}

      <View style={localStyles.productMainInfo}>
        <View style={localStyles.productNameRow}>
          <Text style={[localStyles.productName, highContrast && localStyles.highContrastText]} numberOfLines={1}>{item.product_name}</Text>
          <View style={[localStyles.gramsInputContainer, highContrast && localStyles.highContrastInputContainer]}>
            <TextInput
                style={[localStyles.gramsInput, highContrast && localStyles.highContrastInput]}
                value={item.grams?.toString()}
                onChangeText={(text) => handleGramsChange(text, index)}
                keyboardType="numeric"
                placeholderTextColor={highContrast ? "#AAAAAA" : undefined}
            />
            <Text style={[localStyles.gramsLabel, highContrast && localStyles.highContrastText]}>g</Text>
          </View>
        </View>
        <Text style={[localStyles.productDetails, highContrast && localStyles.highContrastSecondaryText]}>
          {(item.calories?.toString() || 0)} kcal |
          {(item.proteins?.toString() || 0)}g protein |
          {(item.fats?.toString() || 0)}g fat |
          {(item.carbohydrates?.toString() || 0)}g carbs
        </Text>
      </View>
    </View>
  </View>
);

const renderRecipeItem = ({ item }) => (
  <TouchableOpacity
    style={[localStyles.productListItem, highContrast && localStyles.highContrastListItem]}
    onPress={() => handleSelectRecipe(item)}
  >
    <Image
      source={{ uri: item.Image || item.photo || "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg" }}
      style={localStyles.productImage}
    />
    <View style={localStyles.productTextContainer}>
      <Text style={[localStyles.productName, highContrast && localStyles.highContrastText]}>{item.Name || item.name}</Text>
      <Text style={[localStyles.productDetails, highContrast && localStyles.highContrastSecondaryText]}>
        {item.categories?.join(', ')}
      </Text>
      <Text style={[localStyles.productDetails, highContrast && localStyles.highContrastSecondaryText]}>
        Rating: {item.AverageRating || item.averageRating || 0} ({item.RatingCount || item.ratingCount || 0} ratings)
      </Text>
    </View>
  </TouchableOpacity>
);

const renderRecipeProducts = () => (
  <View style={[localStyles.recipeContainer, highContrast && localStyles.highContrastRecipeContainer]}>
    <View style={localStyles.recipeHeader}>
      <Image
        source={{ uri: selectedRecipe.Image || selectedRecipe.photo || "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg" }}
        style={localStyles.recipeImage}
      />
      <Text style={[localStyles.recipeName, highContrast && localStyles.highContrastText]}>{selectedRecipe.Name || selectedRecipe.name}</Text>
    </View>
    
    <Text style={[localStyles.recipeSubtitle, highContrast && localStyles.highContrastText]}>Ingredients:</Text>
    
    {recipeProducts.map((product, index) => (
      <View key={index} style={[localStyles.recipeProductCard, highContrast && localStyles.highContrastCard]}>
        <View style={localStyles.productContent}>
          {product.image && <Image source={{ uri: product.image }} style={localStyles.productImage} />}

          <View style={localStyles.productMainInfo}>
            <View style={localStyles.productNameRow}>
              <Text style={[localStyles.productName, highContrast && localStyles.highContrastText]} numberOfLines={1}>{product.product_name}</Text>
              <View style={[localStyles.gramsInputContainer, highContrast && localStyles.highContrastInputContainer]}>
                <TextInput
                  style={[localStyles.gramsInput, highContrast && localStyles.highContrastInput]}
                  value={product.grams?.toString()}
                  onChangeText={(text) => handleRecipeGramsChange(text, index)}
                  keyboardType="numeric"
                  placeholderTextColor={highContrast ? "#AAAAAA" : undefined}
                />
                <Text style={[localStyles.gramsLabel, highContrast && localStyles.highContrastText]}>g</Text>
              </View>
            </View>
            <Text style={[localStyles.productDetails, highContrast && localStyles.highContrastSecondaryText]}>
              {(product.calories?.toString() || 0)} kcal |
              {(product.proteins?.toString() || 0)}g protein |
              {(product.fats?.toString() || 0)}g fat |
              {(product.carbohydrates?.toString() || 0)}g carbs
            </Text>
          </View>
        </View>
      </View>
    ))}
    
    <View style={localStyles.buttonContainer}>
      <TouchableOpacity style={[localStyles.closeButton, highContrast && localStyles.highContrastButton]} onPress={() => setSelectedRecipe(null)}>
        <Icon name="return-up-back" size={20} color={highContrast ? "white" : "white"} style={localStyles.icon} />
        <Text style={[localStyles.closeButtonText, highContrast && localStyles.highContrastButtonText]}>Back</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[localStyles.closeButton, highContrast && localStyles.highContrastButton]} onPress={handleAddRecipe}>
        <Text style={[localStyles.closeButtonText, highContrast && localStyles.highContrastButtonText]}>Add Recipe</Text>
      </TouchableOpacity>
    </View>
  </View>
);

return (
  <View style={[localStyles.overlay, highContrast && localStyles.highContrastOverlay]}>
    <View style={[localStyles.mainModalContainer, highContrast && localStyles.highContrastModalContainer]}>
      <Text style={[localStyles.header, highContrast && localStyles.highContrastText]}>Choose a product or create your own</Text>

      {!isCreatingProduct && !isChoosingProduct && !isChoosingRecipe ? (
          <>
            <TouchableOpacity style={[localStyles.button, highContrast && localStyles.highContrastButton]} onPress={handleChooseProduct}>
              <Text style={[localStyles.buttonText, highContrast && localStyles.highContrastButtonText]}>Choose a product</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[localStyles.button, highContrast && localStyles.highContrastButton]} onPress={handleChooseRecipe}> 
              <Text style={[localStyles.buttonText, highContrast && localStyles.highContrastButtonText]}>Choose a recipe</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[localStyles.button, highContrast && localStyles.highContrastButton]} onPress={handleCreateProduct}>
              <Text style={[localStyles.buttonText, highContrast && localStyles.highContrastButtonText]}>Create your own product</Text>
            </TouchableOpacity>
          </>
      ) : isChoosingProduct ? (
          <View style={[localStyles.modalContainer, highContrast && localStyles.highContrastModalContent]}>
            <View style={[localStyles.searchContainer, highContrast && localStyles.highContrastSearchContainer]}>
              <TextInput
                  style={[localStyles.searchInput, highContrast && localStyles.highContrastSearchInput]}
                  placeholder="Search products..."
                  placeholderTextColor={highContrast ? "#AAAAAA" : undefined}
                  value={searchQuery}
                  onChangeText={handleSearch}
              />
            </View>

            <FlatList
                data={filteredProducts}
                keyExtractor={(item) => item.ProductId.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[localStyles.productListItem, highContrast && localStyles.highContrastListItem]}
                        onPress={() => handleSelectProduct(item)}
                    >
                      <Image
                          source={{ uri: item.image || "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg" }}
                          style={localStyles.productImage}
                      />
                      <View style={localStyles.productTextContainer}>
                        <Text style={[localStyles.productName, highContrast && localStyles.highContrastText]}>{item.product_name}</Text>
                        <Text style={[localStyles.productDetails, highContrast && localStyles.highContrastSecondaryText]}>
                          {item.calories} kcal | {item.proteins}g protein | {item.fats}g fat | {item.carbohydrates}g carbs
                        </Text>
                      </View>
                    </TouchableOpacity>
                )}
                contentContainerStyle={[localStyles.productListContainer, highContrast && localStyles.highContrastListContainer]}
            />
          </View>
      ) : isChoosingRecipe ? (
        selectedRecipe ? (
          renderRecipeProducts()
        ): (
          <View style={[localStyles.modalContainer, highContrast && localStyles.highContrastModalContent]}>
          <View style={[localStyles.searchContainer, highContrast && localStyles.highContrastSearchContainer]}>
            <TextInput
              style={[localStyles.searchInput, highContrast && localStyles.highContrastSearchInput]}
              placeholder="Search recipes..."
              placeholderTextColor={highContrast ? "#AAAAAA" : undefined}
              value={recipeSearchQuery}
              onChangeText={handleRecipeSearch}
            />
          </View>

          <FlatList
            data={filteredRecipes}
            keyExtractor={(item) => item.RecipeId.toString()}
            renderItem={renderRecipeItem}
            contentContainerStyle={[localStyles.productListContainer, highContrast && localStyles.highContrastListContainer]}
          />
        </View>
      )
    ) : (
          <>
            <TextInput
                style={[localStyles.input, highContrast && localStyles.highContrastInput]}
                placeholder="Product name"
                placeholderTextColor={highContrast ? "#AAAAAA" : undefined}
                value={newProduct.product_name}
                onChangeText={(text) => setNewProduct({ ...newProduct, product_name: text })}
            />
            <TextInput
                style={[localStyles.input, highContrast && localStyles.highContrastInput]}
                placeholder="Calories"
                placeholderTextColor={highContrast ? "#AAAAAA" : undefined}
                value={newProduct.calories}
                onChangeText={(text) => setNewProduct({ ...newProduct, calories: text })}
                keyboardType="numeric"
            />
            <TextInput
                style={[localStyles.input, highContrast && localStyles.highContrastInput]}
                placeholder="Proteins"
                placeholderTextColor={highContrast ? "#AAAAAA" : undefined}
                value={newProduct.proteins}
                onChangeText={(text) => setNewProduct({ ...newProduct, proteins: text })}
                keyboardType="numeric"
            />
            <TextInput
                style={[localStyles.input, highContrast && localStyles.highContrastInput]}
                placeholder="Fats"
                placeholderTextColor={highContrast ? "#AAAAAA" : undefined}
                value={newProduct.fats}
                onChangeText={(text) => setNewProduct({ ...newProduct, fats: text })}
                keyboardType="numeric"
            />
            <TextInput
                style={[localStyles.input, highContrast && localStyles.highContrastInput]}
                placeholder="Carbohydrates"
                placeholderTextColor={highContrast ? "#AAAAAA" : undefined}
                value={newProduct.carbohydrates}
                onChangeText={(text) => setNewProduct({ ...newProduct, carbohydrates: text })}
                keyboardType="numeric"
            />
          </>
      )}
      

      {!isCreatingProduct && !isChoosingProduct && !isChoosingRecipe && (
          <View style={localStyles.scrollContainer}>
            <FlatList
                data={products}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderProductItem}
                contentContainerStyle={[localStyles.productListContent, highContrast && localStyles.highContrastListContainer]}
                style={[localStyles.productList, highContrast && localStyles.highContrastList]}
            />
          </View>
      )}

      {(isCreatingProduct || isChoosingProduct || isChoosingRecipe) && (
          <View style={localStyles.buttonContainer}>
            <TouchableOpacity style={[localStyles.closeButton, highContrast && localStyles.highContrastButton]} onPress={handleCancel}>
              <Icon name="return-up-back"
               size={20} 
               color="white"
                style={localStyles.icon} />
              <Text style={[localStyles.closeButtonText, highContrast && localStyles.highContrastButtonText]}>Cancel</Text>
            </TouchableOpacity>

            {isCreatingProduct && (
                <TouchableOpacity style={[localStyles.closeButton, highContrast && localStyles.highContrastButton]} onPress={handleAddProduct}>
                  <Text style={[localStyles.closeButtonText, highContrast && localStyles.highContrastButtonText]}>Add</Text>
                </TouchableOpacity>
            )}
          </View>
      )}

      {!isCreatingProduct && !isChoosingProduct && !isChoosingRecipe && (
          <View style={localStyles.buttonContainer}>
            <TouchableOpacity style={[localStyles.closeButton, highContrast && localStyles.highContrastButton]} onPress={onClose} disabled={isButtonsDisabled}>
              <Icon name="return-up-back" size={20} color= "white" style={localStyles.icon} />
              <Text style={[localStyles.closeButtonText, highContrast && localStyles.highContrastButtonText]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[localStyles.closeButton, highContrast && localStyles.highContrastButton]}
                onPress={handleSave}
                disabled={isButtonsDisabled}
            >
              <Icon name="save" size={20} color= "white" style={localStyles.icon} />
              <Text style={[localStyles.closeButtonText, highContrast && localStyles.highContrastButtonText]}>Save</Text>
            </TouchableOpacity>
          </View>
      )}
    </View>
  </View>

  );
}

const localStyles = StyleSheet.create({
  highContrastBackground: {
        backgroundColor: '#2e2c2c', 
        color:'white',
    },
    secondContrast: {
        backgroundColor: "#454343",
        color:'white',
    },
  highContrastOverlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
    },
    highContrastModalContainer: {
        backgroundColor: '#121212',
        borderColor: '#FFFFFF',
        borderWidth: 1,
    },
    highContrastText: {
        color: '#FFFFFF',
    },
    highContrastSecondaryText: {
        color: '#CCCCCC',
    },
    highContrastButton: {
        backgroundColor: '#242424',
        borderColor: '#FFFFFF',
        borderWidth: 1,
    },
    highContrastButtonText: {
        color: '#FFFFFF',
    },
    highContrastCard: {
        backgroundColor: '#242424',
        borderColor: '#FFFFFF',
        borderWidth: 1,
    },
    highContrastInputContainer: {
        borderColor: '#FFFFFF',
    },
    highContrastInput: {
        color: '#FFFFFF',
        backgroundColor: '#121212',
        borderColor: '#FFFFFF',
    },
    highContrastRecipeContainer: {
        backgroundColor: '#121212',
        borderColor: '#FFFFFF',
    },
    highContrastModalContent: {
        backgroundColor: '#121212',
        borderColor: '#FFFFFF',
    },
    highContrastSearchContainer: {
        backgroundColor: '#242424',
        borderColor: '#FFFFFF',
    },
    highContrastSearchInput: {
        color: '#FFFFFF',
        backgroundColor: '#121212',
    },
    highContrastListItem: {
        backgroundColor: '#242424',
        borderColor: '#FFFFFF',
    },
    highContrastListContainer: {
        backgroundColor: '#121212',
    },
    highContrastList: {
        backgroundColor: '#121212',
    },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  icon: {
    marginRight: 10,
  },
  mainModalContainer: {
    width: "100%",
    height: "100%",
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  scrollContainer: {
    flex: 1,
    width: '100%',
    marginTop: 10,
  },
  productList: {
    width: '100%',
  },
  productListContent: {
    paddingBottom: 20,
  },
  button: {
    padding: 15,
    marginVertical: 10,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#fff',
    elevation: 3,
  },
  buttonText: {
    fontSize: 14,
    color: 'black',
  },
  closeButton: {
    padding: 10,
    backgroundColor: 'brown',
    borderRadius: 5,
    alignItems: 'center',
    flexDirection: "row",
    justifyContent: "center",
    flex: 1,
    marginHorizontal: 5,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  input: {
    width: '100%',
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 3,
    marginBottom: 10,
  },
  header: {
    fontSize: 20,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
    width: '100%',
    borderRadius: 10,
    padding: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  productListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  closeModalButton: {
    marginLeft: 10,
    padding: 10,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  productCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginVertical: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    position: "relative",
  },
  removeButton: {
    position: "absolute",
    top: 5,
    left: 5,
    width: 25,
    height: 25,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
    backgroundColor: '#f5f5f5',
  },
  productContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productMainInfo: {
    flex: 1,
    marginLeft: 10,
  },
  productNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  productName: {
    fontSize: 15,
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  productDetails: {
    fontSize: 12,
    color: "#666",
  },
  gramsInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 5,
    width: 60,
    textAlign: "center",
  },
  gramsLabel: {
    fontSize: 14,
    color: "#666",
    marginLeft: 5,
  },
  gramsInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  recipeListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  recipeImage: {
    width: 60,
    height: 60,
    borderRadius: 5,
    marginRight: 15,
    backgroundColor: '#f5f5f5',
  },
  recipeTextContainer: {
    flex: 1,
  },
  recipeName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
  },
  recipeCategories: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  recipeRating: {
    fontSize: 12,
    color: '#FFC107',
  },
});