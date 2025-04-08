import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Image, Alert, Modal, FlatList, ActivityIndicator } from "react-native";
import { Picker } from "@react-native-picker/picker";
import Icon from "react-native-vector-icons/FontAwesome6";
import { launchImageLibraryAsync, MediaTypeOptions, requestMediaLibraryPermissionsAsync } from 'expo-image-picker';
import axios from "axios";
import { API_BASE_URL } from '@env';
import { useAuth } from "../context/AuthContext";

const apiUrl = `${API_BASE_URL}`;

const RecipesAdd = ({ navigation, route }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState([""]);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    productId: "",
    amount: ""
  });
  const [imageUri, setImageUri] = useState(null);
  const [isProductModalVisible, setIsProductModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user?.token) {
          Alert.alert("Authentication required", "Please login to add recipes");
          navigation.navigate('AuthNavigator');
          return;
        }
  
        setLoading(true);
        
        console.log("Fetching data with token:", user.token);
        
        // Fetch categories
        const categoriesResponse = await axios.get(`${apiUrl}/api/categories`, {
          headers: { 
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!categoriesResponse.data) {
          throw new Error("No categories data received");
        }
        console.log("Categories data:", categoriesResponse.data);
        
        // Fetch products
        const productsResponse = await axios.get(`${apiUrl}/api/products`, {
          headers: { 
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!productsResponse.data) {
          throw new Error("No products data received");
        }
        console.log("Products data:", productsResponse.data);
        
        setCategories(categoriesResponse.data);
        setAvailableProducts(productsResponse.data);
        setFilteredProducts(productsResponse.data);
        
      } catch (error) {
        console.error("Data fetching error:", {
          message: error.message,
          response: error.response?.data,
          config: error.config
        });
        
        if (error.response?.status === 401) {
          Alert.alert("Session expired", "Please login again");
          navigation.navigate('AuthNavigator');
        } else {
          Alert.alert("Error", "Failed to load data. Please check console for details.");
        }
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [user?.token, navigation]);

  const pickImage = async () => {
    try {
      const { status } = await requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission required', 
          'We need access to your photos to upload images'
        );
        return;
      }
    
      let result = await launchImageLibraryAsync({
        mediaTypes: MediaTypeOptions.Images, // Use MediaTypeOptions directly
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
  
      console.log('Image picker result:', result);
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const uploadImage = async () => {
    if (!imageUri || !user?.token) return null;
  
    let filename = imageUri.split('/').pop();
    let match = /\.(\w+)$/.exec(filename);
    let type = match ? `image/${match[1]}` : 'image';
  
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type,
      name: filename || 'recipe.jpg',
    });
  
    try {
      const response = await axios.post(`${apiUrl}/api/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user.token}`,
        },
      });
      return response.data.imageUrl;
    } catch (error) {
      console.error("Image upload error:", {
        message: error.message,
        response: error.response?.data,
        config: error.config
      });
      return null;
    }
  };

  const handleSelectProduct = (product) => {
    if (!product || !product.ProductId) {
        console.error("Invalid product selected");
        return;
    }
    setNewProduct({
        productId: product.ProductId,
        amount: ""
    });
    setIsProductModalVisible(false);
    setSearchQuery("");
};

  const handleAddStep = () => {
    setSteps([...steps, ""]);
  };

  const handleRemoveStep = (index) => {
    if (steps.length > 1) {
      const newSteps = [...steps];
      newSteps.splice(index, 1);
      setSteps(newSteps);
    }
  };

  const handleStepChange = (text, index) => {
    const newSteps = [...steps];
    newSteps[index] = text;
    setSteps(newSteps);
  };

  const handleAddProduct = () => {
    if (!newProduct.productId || !newProduct.amount || isNaN(parseFloat(newProduct.amount))) {
        Alert.alert("Error", "Please select a product and enter a valid amount");
        return;
    }
    
    const selectedProduct = availableProducts.find(p => p.ProductId == newProduct.productId);
    if (selectedProduct) {
        setProducts([...products, {
            ProductId: selectedProduct.ProductId,
            product_name: selectedProduct.product_name,
            amount: newProduct.amount
        }]);
        setNewProduct({ productId: "", amount: "" });
    }
};

  const handleRemoveProduct = (index) => {
    const newProducts = [...products];
    newProducts.splice(index, 1);
    setProducts(newProducts);
  };

  const handleSubmit = async () => {
    if (!user?.token) {
        Alert.alert("Session expired", "Please login again");
        navigation.navigate('AuthNavigator'); // Change 'AuthNavigator' to your actual login screen name
        return;
    }
  
    if (!name || !description || steps.some(step => !step) || products.length === 0) {
        Alert.alert("Error", "Please fill in all required fields");
        return;
    }
  
    try {
        setLoading(true);
        
        // Upload image if exists
        const imageUrl = imageUri ? await uploadImage() : null;
        
        // Create the recipe
        const recipeResponse = await axios.post(`${apiUrl}/api/recipes`, {
            UserId: user.UserId,
            Name: name,
            Description: description,
            Steps: steps.filter(step => step.trim() !== "").join('||'), // Join steps with delimiter
            Image: imageUrl
        }, {
            headers: { Authorization: `Bearer ${user.token}` },
        });

        const recipeId = recipeResponse.data.RecipeId;

        // Add categories if any selected
        if (selectedCategories.length > 0) {
            await axios.post(`${apiUrl}/api/recipes/${recipeId}/categories`, {
                categoryIds: selectedCategories
            }, {
                headers: { Authorization: `Bearer ${user.token}` },
            });
        }

        // Add products
        await axios.post(`${apiUrl}/api/recipes/${recipeId}/products`, {
            products: products.map(p => ({
                ProductId: p.ProductId,
                Amount: p.amount
            }))
        }, {
            headers: { Authorization: `Bearer ${user.token}` },
        });

        Alert.alert("Success", "Recipe added successfully!");
        navigation.goBack();
    } catch (error) {
        console.error("Error adding recipe:", error);
        if (error.response?.status === 401) {
            Alert.alert("Session expired", "Please login again");
            navigation.navigate('AuthNavigator');
        } else {
            Alert.alert("Error", error.response?.data?.message || "Failed to add recipe. Please try again.");
        }
    } finally {
        setLoading(false);
    }
};

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!user) {
    return null; // or a loading spinner
  };

  

  return (
    <ScrollView style={styles.container}>
    <Text style={styles.label}>Recipe Image</Text>
    <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
    {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.recipeImage} />
        ) : (
        <View style={styles.imagePlaceholder}>
            <Icon name="camera" size={40} color="#ccc" />
            <Text style={styles.imagePlaceholderText}>Tap to add image</Text>
        </View>
        )}
    </TouchableOpacity>

    <Text style={styles.label}>Recipe Name*</Text>
    <TextInput
      style={styles.input}
      value={name}
      onChangeText={setName}
      placeholder="Enter recipe name"
    />
  
      <Text style={styles.label}>Description*</Text>
      <TextInput
        style={[styles.input, styles.descriptionInput]}
        value={description}
        onChangeText={setDescription}
        placeholder="Enter recipe description"
        multiline
      />
  
      <Text style={styles.label}>Steps*</Text>
      {steps.map((step, index) => (
        <View key={index} style={styles.stepContainer}>
          <Text style={styles.stepNumber}>Step {index + 1}</Text>
          <TextInput
            style={[styles.input, styles.stepInput]}
            value={step}
            onChangeText={(text) => handleStepChange(text, index)}
            placeholder={`Describe step ${index + 1}`}
            multiline
          />
          {steps.length > 1 && (
            <TouchableOpacity 
              style={styles.removeStepButton} 
              onPress={() => handleRemoveStep(index)}
            >
              <Icon name="trash" size={16} color="red" />
            </TouchableOpacity>
          )}
        </View>
      ))}
      <TouchableOpacity style={styles.addButton} onPress={handleAddStep}>
        <Icon name="plus" size={16} color="white" />
        <Text style={styles.addButtonText}>Add Step</Text>
      </TouchableOpacity>
  
      <Text style={styles.label}>Categories</Text>
      <Picker
        selectedValue={""}
        onValueChange={(itemValue) => {
          if (itemValue && !selectedCategories.includes(itemValue)) {
            setSelectedCategories([...selectedCategories, itemValue]);
          }
        }}
        style={styles.picker}
      >
        <Picker.Item label="Select a category" value="" />
        {categories.map(category => (
          <Picker.Item 
            key={category.CategoryId} 
            label={category.Name} 
            value={category.CategoryId} 
          />
        ))}
      </Picker>
      
      {selectedCategories.length > 0 && (
        <View style={styles.selectedCategoriesContainer}>
          {selectedCategories.map(catId => {
            const category = categories.find(c => c.CategoryId == catId);
            return (
              <View key={catId} style={styles.categoryTag}>
                <Text style={styles.categoryTagText}>{category?.Name}</Text>
                <TouchableOpacity 
                  onPress={() => {
                    setSelectedCategories(selectedCategories.filter(id => id !== catId));
                  }}
                >
                  <Icon name="times" size={14} color="white" />
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      )}
  
      <Text style={styles.label}>Ingredients*</Text>
      <View style={styles.ingredientSection}>
        <TouchableOpacity 
          style={styles.productSelector}
          onPress={() => setIsProductModalVisible(true)}
        >
          <Text style={styles.productSelectorText}>
            {newProduct.productId 
              ? availableProducts.find(p => p.ProductId == newProduct.productId)?.product_name 
              : "Select a product"}
          </Text>
          <Icon name="chevron-down" size={16} color="#666" />
        </TouchableOpacity>
        
        <View style={styles.amountRow}>
          <TextInput
            style={styles.amountInput}
            value={newProduct.amount}
            onChangeText={(text) => setNewProduct({...newProduct, amount: text})}
            placeholder="Amount"
            keyboardType="numeric"
          />
          <Text style={styles.gramsText}>grams</Text>
          <TouchableOpacity 
            style={styles.addIngredientButton} 
            onPress={handleAddProduct}
          >
            <Icon name="plus" size={16} color="white" />
            <Text style={styles.addIngredientButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>
  
      {products.length > 0 && (
        <View style={styles.productsList}>
          {products.map((product, index) => (
            <View key={index} style={styles.productItem}>
              <Text style={styles.productText}>
                {product.product_name} - {product.amount}g
              </Text>
              <TouchableOpacity onPress={() => handleRemoveProduct(index)}>
                <Icon name="trash" size={16} color="red" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
  
      {/* Product Selection Modal */}
      <Modal
        visible={isProductModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setIsProductModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search products..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity 
              style={styles.closeModalButton}
              onPress={() => setIsProductModalVisible(false)}
            >
              <Icon name="times" size={20} color="#666" />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={filteredProducts}
            keyExtractor={(item) => item.ProductId.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.productListItem}
                onPress={() => handleSelectProduct(item)}
              >
                <Image 
                  source={{ uri: item.image || "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg" }} 
                  style={styles.productImage}
                />
                <Text style={styles.productName}>{item.product_name}</Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.productListContainer}
          />
        </View>
      </Modal>
  
      <TouchableOpacity 
        style={styles.submitButton} 
        onPress={handleSubmit}
        disabled={loading || uploadingImage}
        >
        {loading || uploadingImage ? (
            <ActivityIndicator color="white" />
        ) : (
            <Text style={styles.submitButtonText}>Save Recipe</Text>
        )}
    </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
      },
      imagePicker: {
        marginBottom: 15,
        alignItems: 'center',
      },
      recipeImage: {
        width: '100%',
        height: 200,
        borderRadius: 10,
      },
      imagePlaceholder: {
        width: '100%',
        height: 200,
        borderRadius: 10,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
      },
      imagePlaceholderText: {
        marginTop: 10,
        color: '#666',
      },
    label: {
      fontSize: 16,
      fontWeight: '600',
      marginTop: 15,
      marginBottom: 5,
    },
    input: {
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 5,
      padding: 10,
      fontSize: 16,
      marginBottom: 10,
    },
    descriptionInput: {
      height: 80,
    },
    stepContainer: {
      marginBottom: 10,
      position: 'relative',
    },
    stepNumber: {
      fontSize: 14,
      color: '#666',
      marginBottom: 5,
    },
    stepInput: {
      paddingRight: 40,
    },
    removeStepButton: {
      position: 'absolute',
      right: 10,
      top: 30,
    },
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#4CAF50',
      padding: 10,
      borderRadius: 5,
      marginTop: 10,
    },
    addButtonText: {
      color: 'white',
      marginLeft: 5,
      fontWeight: '600',
    },
    picker: {
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 5,
      marginBottom: 10,
    },
    selectedCategoriesContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 10,
    },
    categoryTag: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#4CAF50',
      padding: 5,
      borderRadius: 15,
      marginRight: 5,
      marginBottom: 5,
      paddingHorizontal: 10,
    },
    categoryTagText: {
      color: 'white',
      marginRight: 5,
    },
    ingredientSection: {
      marginBottom: 10,
    },
    productSelector: {
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 5,
      padding: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    productSelectorText: {
      fontSize: 16,
      color: '#333',
    },
    amountRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    amountInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 5,
      padding: 10,
      fontSize: 16,
    },
    gramsText: {
      fontSize: 14,
      color: '#666',
      width: 60,
    },
    addIngredientButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#4CAF50',
      padding: 10,
      borderRadius: 5,
      justifyContent: 'center',
      width: 80,
    },
    addIngredientButtonText: {
      color: 'white',
      marginLeft: 5,
      fontWeight: '600',
    },
    productsList: {
      marginTop: 10,
    },
    productItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
    },
    productText: {
      fontSize: 16,
    },
    submitButton: {
      backgroundColor: '#2196F3',
      padding: 15,
      borderRadius: 5,
      alignItems: 'center',
      marginTop: 20,
      marginBottom: 30,
    },
    submitButtonText: {
      color: 'white',
      fontSize: 18,
      fontWeight: 'bold',
    },
    modalContainer: {
      flex: 1,
      backgroundColor: '#fff',
      padding: 20,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 15,
    },
    searchInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 5,
      padding: 10,
      fontSize: 16,
    },
    closeModalButton: {
      marginLeft: 10,
      padding: 10,
    },
    productListContainer: {
      paddingBottom: 20,
    },
    productListItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
    },
    productImage: {
      width: 50,
      height: 50,
      borderRadius: 25,
      marginRight: 15,
      backgroundColor: '#f5f5f5',
    },
    productName: {
      fontSize: 16,
      color: '#333',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      },
  });

export default RecipesAdd;