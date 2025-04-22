import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, TextInput, FlatList, Image, StyleSheet } from 'react-native';
import axios from "axios";
import { API_BASE_URL } from '@env';
const apiUrl = `${API_BASE_URL}`;

import { useAuth } from "../context/AuthContext";
import Icon from "react-native-vector-icons/AntDesign";
import Icon2 from "react-native-vector-icons/FontAwesome6";

export default function Meal({ onClose, onSave, existingProducts = [], selectedDate, mealType, mealName }) {
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

  useEffect(() => {
    axios.get(apiUrl + "/products")
        .then(response => {
          setDatabaseProducts(response.data);
          setFilteredProducts(response.data);
        })
        .catch(error => console.error("Error fetching data:", error.response.data));
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
    setFilteredProducts(databaseProducts);
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

  const renderProductItem = ({ item, index }) => (
      <View style={localStyles.productCard}>
        <TouchableOpacity
            style={localStyles.removeButton}
            onPress={() => {
              const updatedProducts = [...products];
              updatedProducts.splice(index, 1);
              setProducts(updatedProducts);
            }}
        >
          <Icon2 name="trash" size={16} color="red" />
        </TouchableOpacity>

        <View style={localStyles.productContent}>
          {item.image && <Image source={{ uri: item.image }} style={localStyles.productImage} />}

          <View style={localStyles.productMainInfo}>
            <View style={localStyles.productNameRow}>
              <Text style={localStyles.productName} numberOfLines={1}>{item.product_name}</Text>
              <View style={localStyles.gramsInputContainer}>
                <TextInput
                    style={localStyles.gramsInput}
                    value={item.grams?.toString()}
                    onChangeText={(text) => handleGramsChange(text, index)}
                    keyboardType="numeric"
                />
                <Text style={localStyles.gramsLabel}>g</Text>
              </View>
            </View>
            <Text style={localStyles.productDetails}>
              {(item.calories?.toString() || 0)} kcal |
              {(item.proteins?.toString() || 0)}g protein |
              {(item.fats?.toString() || 0)}g fat |
              {(item.carbohydrates?.toString() || 0)}g carbs
            </Text>
          </View>
        </View>
      </View>
  );

  return (
      <View style={localStyles.overlay}>
        <View style={localStyles.mainModalContainer}>
          <Text style={localStyles.header}>Choose a product or create your own</Text>

          {!isCreatingProduct && !isChoosingProduct ? (
              <>
                <TouchableOpacity style={localStyles.button} onPress={handleChooseProduct}>
                  <Text style={localStyles.buttonText}>Choose a product</Text>
                </TouchableOpacity>
                <TouchableOpacity style={localStyles.button}>
                  <Text style={localStyles.buttonText}>Choose a recipe</Text>
                </TouchableOpacity>
                <TouchableOpacity style={localStyles.button} onPress={handleCreateProduct}>
                  <Text style={localStyles.buttonText}>Create your own product</Text>
                </TouchableOpacity>
              </>
          ) : isChoosingProduct ? (
              <View style={localStyles.modalContainer}>
                <View style={localStyles.searchContainer}>
                  <TextInput
                      style={localStyles.searchInput}
                      placeholder="Search products..."
                      value={searchQuery}
                      onChangeText={handleSearch}
                  />
                </View>

                <FlatList
                    data={filteredProducts}
                    keyExtractor={(item) => item.ProductId.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={localStyles.productListItem}
                            onPress={() => handleSelectProduct(item)}
                        >
                          <Image
                              source={{ uri: item.image || "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg" }}
                              style={localStyles.productImage}
                          />
                          <View style={localStyles.productTextContainer}>
                            <Text style={localStyles.productName}>{item.product_name}</Text>
                            <Text style={localStyles.productDetails}>
                              {item.calories} kcal | {item.proteins}g protein | {item.fats}g fat | {item.carbohydrates}g carbs
                            </Text>
                          </View>
                        </TouchableOpacity>
                    )}
                    contentContainerStyle={localStyles.productListContainer}
                />
              </View>
          ) : (
              <>
                <TextInput
                    style={localStyles.input}
                    placeholder="Product name"
                    value={newProduct.product_name}
                    onChangeText={(text) => setNewProduct({ ...newProduct, product_name: text })}
                />
                <TextInput
                    style={localStyles.input}
                    placeholder="Calories"
                    value={newProduct.calories}
                    onChangeText={(text) => setNewProduct({ ...newProduct, calories: text })}
                    keyboardType="numeric"
                />
                <TextInput
                    style={localStyles.input}
                    placeholder="Proteins"
                    value={newProduct.proteins}
                    onChangeText={(text) => setNewProduct({ ...newProduct, proteins: text })}
                    keyboardType="numeric"
                />
                <TextInput
                    style={localStyles.input}
                    placeholder="Fats"
                    value={newProduct.fats}
                    onChangeText={(text) => setNewProduct({ ...newProduct, fats: text })}
                    keyboardType="numeric"
                />
                <TextInput
                    style={localStyles.input}
                    placeholder="Carbohydrates"
                    value={newProduct.carbohydrates}
                    onChangeText={(text) => setNewProduct({ ...newProduct, carbohydrates: text })}
                    keyboardType="numeric"
                />
              </>
          )}

          {!isCreatingProduct && !isChoosingProduct && (
              <View style={localStyles.scrollContainer}>
                <FlatList
                    data={products}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={renderProductItem}
                    contentContainerStyle={localStyles.productListContent}
                    style={localStyles.productList}
                />
              </View>
          )}

          {(isCreatingProduct || isChoosingProduct) && (
              <View style={localStyles.buttonContainer}>
                <TouchableOpacity style={localStyles.closeButton} onPress={handleCancel}>
                  <Icon name="back" size={20} color="white" style={localStyles.icon} />
                  <Text style={localStyles.closeButtonText}>Cancel</Text>
                </TouchableOpacity>

                {isCreatingProduct && (
                    <TouchableOpacity style={localStyles.closeButton} onPress={handleAddProduct}>
                      <Text style={localStyles.closeButtonText}>Add</Text>
                    </TouchableOpacity>
                )}
              </View>
          )}

          {!isCreatingProduct && !isChoosingProduct && (
              <View style={localStyles.buttonContainer}>
                <TouchableOpacity style={localStyles.closeButton} onPress={onClose} disabled={isButtonsDisabled}>
                  <Icon name="back" size={20} color="white" style={localStyles.icon} />
                  <Text style={localStyles.closeButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={localStyles.closeButton}
                    onPress={handleSave}
                    disabled={isButtonsDisabled}
                >
                  <Icon name="save" size={20} color="white" style={localStyles.icon} />
                  <Text style={localStyles.closeButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
          )}
        </View>
      </View>
  );
}

const localStyles = StyleSheet.create({
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
});