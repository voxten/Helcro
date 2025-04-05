import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, TextInput, FlatList, Image, StyleSheet } from 'react-native';
import axios from "axios";
import styles from "../../styles/MainStyles";
import styles2 from "./MealStyles";
import { API_BASE_URL } from '@env';

const apiUrl = `${API_BASE_URL}`;

export default function Meal({ onClose, onSave, existingProducts = [] }) {
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

  useEffect(() => {
    axios.get(apiUrl + "/products")
        .then(response => {
          setDatabaseProducts(response.data);
          setFilteredProducts(response.data); // Initialize filtered list
        })
        .catch(error => console.error("Error fetching data:", error.response.data));
  }, []);

  const handleCreateProduct = () => {
    setIsCreatingProduct(true);
    setIsChoosingProduct(false);
    setIsButtonsDisabled(true);
  };

  const handleChooseProduct = () => {
    setIsChoosingProduct(true);
    setIsCreatingProduct(false);
  };

  const handleCancel = () => {
    setIsCreatingProduct(false);
    setIsChoosingProduct(false);
    setSearchQuery("");
    setFilteredProducts(databaseProducts); // Reset search
    setNewProduct({
      product_name: '',
      calories: '',
      proteins: '',
      fats: '',
      carbohydrates: ''
    });
    setIsButtonsDisabled(false);
  };

  const handleAddProduct = () => {
    setProducts([...products, newProduct]);
    handleCancel();
  };

  const handleSelectProduct = (product) => {
    setProducts([
      ...products,
      {
        ...product,
        grams: 100, // Default to 100g
        originalValues: { ...product } // Store original values
      }
    ]);
    setIsChoosingProduct(false);
  };

  const handleSave = () => {
    if (onSave) {
      onSave(products);
    }
    onClose();
  };

  // Search function to filter products
  const handleSearch = (text) => {
    setSearchQuery(text);
    const filtered = databaseProducts.filter(product =>
        product.product_name.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  return (
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.header}>Choose a product or create your own</Text>

          {!isCreatingProduct && !isChoosingProduct ? (
              <>
                <TouchableOpacity style={styles.button} onPress={handleChooseProduct}>
                  <Text style={styles.buttonText}>Choose a product</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button}>
                  <Text style={styles.buttonText}>Choose a recipe</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={handleCreateProduct}>
                  <Text style={styles.buttonText}>Create your own product</Text>
                </TouchableOpacity>
              </>
          ) : isChoosingProduct ? (
              <View style={localStyles.productListContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Search product..."
                    value={searchQuery}
                    onChangeText={handleSearch}
                />
                <FlatList
                    data={filteredProducts}
                    keyExtractor={(item) => item.ProductId.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => handleSelectProduct(item)}>
                          <View style={localStyles.productCard}>
                            {item.image && (
                                <Image source={{ uri: item.image }} style={localStyles.productImage} />
                            )}
                            <View style={localStyles.productInfo}>
                              <Text style={localStyles.productName}>{item.product_name}</Text>
                              <Text style={localStyles.productDetails}>
                                {item.calories} kcal | {item.proteins}g protein | {item.fats}g fat | {item.carbohydrates}g carbs
                              </Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                    )}
                />
              </View>
          ) : (
              <>
                <TextInput
                    style={styles.input}
                    placeholder="Product name"
                    value={newProduct.product_name}
                    onChangeText={(text) => setNewProduct({ ...newProduct, product_name: text })}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Calories"
                    value={newProduct.calories}
                    onChangeText={(text) => setNewProduct({ ...newProduct, calories: text })}
                    keyboardType="numeric"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Proteins"
                    value={newProduct.proteins}
                    onChangeText={(text) => setNewProduct({ ...newProduct, proteins: text })}
                    keyboardType="numeric"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Fats"
                    value={newProduct.fats}
                    onChangeText={(text) => setNewProduct({ ...newProduct, fats: text })}
                    keyboardType="numeric"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Carbohydrates"
                    value={newProduct.carbohydrates}
                    onChangeText={(text) => setNewProduct({ ...newProduct, carbohydrates: text })}
                    keyboardType="numeric"
                />
              </>
          )}
          {!isCreatingProduct && !isChoosingProduct ? (
          <View style={localStyles.productListContainer}>
            <FlatList
                data={products}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }) => (
                    <View style={localStyles.productCard}>
                      {/* X Button to remove the product */}
                      <TouchableOpacity
                          style={localStyles.removeButton}
                          onPress={() => {
                            const updatedProducts = [...products];
                            updatedProducts.splice(index, 1);
                            setProducts(updatedProducts);
                          }}
                      >
                        <Text style={localStyles.removeButtonText}>X</Text>
                      </TouchableOpacity>

                      {item.image && <Image source={{ uri: item.image }} style={localStyles.productImage} />}

                      <View style={localStyles.productInfo}>
                        <Text style={localStyles.productName}>{item.product_name}</Text>

                        {/* Input for grams */}
                        <View style={localStyles.gramsInputContainer}>
                          <TextInput
                              style={localStyles.gramsInput}
                              placeholder="Grams"
                              keyboardType="numeric"
                              value={item.grams?.toString() || ""}
                              onChangeText={(text) => {
                                const grams = parseFloat(text) || 0;
                                const updatedProducts = [...products];

                                updatedProducts[index] = {
                                  ...item,
                                  grams,
                                  calories: ((item.originalValues.calories / 100) * grams).toFixed(2),
                                  proteins: ((item.originalValues.proteins / 100) * grams).toFixed(2),
                                  fats: ((item.originalValues.fats / 100) * grams).toFixed(2),
                                  carbohydrates: ((item.originalValues.carbohydrates / 100) * grams).toFixed(2),
                                };

                                setProducts(updatedProducts);
                              }}
                          />
                          <Text style={localStyles.gramsLabel}>grams</Text>
                        </View>

                        {/* Nutritional details */}
                        <Text style={localStyles.productDetails}>
                          {item.calories} kcal | {item.proteins}g protein | {item.fats}g fat | {item.carbohydrates}g carbs
                        </Text>
                      </View>
                    </View>
                )}
            />

          </View>
          ) : (
                <>

                </>
          )}
          {(isCreatingProduct || isChoosingProduct) && (
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.closeButton} onPress={handleCancel}>
                  <Text style={styles.closeButtonText}>Cancel</Text>
                </TouchableOpacity>
                {isCreatingProduct && (
                    <TouchableOpacity style={styles.closeButton} onPress={handleAddProduct}>
                      <Text style={styles.closeButtonText}>Add</Text>
                    </TouchableOpacity>
                )}
              </View>
          )}

          {!isCreatingProduct && !isChoosingProduct && (
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.closeButton} onPress={onClose} disabled={isButtonsDisabled}>
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={handleSave}
                    disabled={isButtonsDisabled}
                >
                  <Text style={styles.closeButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
          )}
        </View>
      </View>
  );
}

const localStyles = StyleSheet.create({
  productListContainer: {
    maxHeight: 300, // Prevents overflow issues
    width: "100%",
  },
  productCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginVertical: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3, // For Android shadow
    position: "relative",
  },
  removeButton: {
    position: "absolute",
    top: 5,
    left: 5,
    backgroundColor: "red",
    width: 25,
    height: 25,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  removeButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
    marginRight: 10,
  },
  productInfo: {
    flex: 1,
    marginLeft: 10, // Adjusted to avoid overlap with the "X" button
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  productDetails: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  gramsInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 5,
    width: 80,
    marginRight: 5,
    textAlign: "center",
  },
  gramsLabel: {
    fontSize: 14,
    color: "#666",
  },
  gramsInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
});

