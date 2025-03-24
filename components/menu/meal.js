import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import styles from "../../styles/MainStyles";

export default function Meal({ onClose }) {
  const [isCreatingProduct, setIsCreatingProduct] = useState(false); // Controls whether we are creating a new product
  const [products, setProducts] = useState([]); // Stores added products
  const [newProduct, setNewProduct] = useState({
    name: '',
    kcal: '',
    protein: '',
    fat: '',
    carbs: ''
  });

  const handleCreateProduct = () => {
    setIsCreatingProduct(true);
  };

  const handleCancel = () => {
    setIsCreatingProduct(false);
    setNewProduct({
      name: '',
      kcal: '',
      protein: '',
      fat: '',
      carbs: ''
    });
  };

  const handleAddProduct = () => {
    setProducts([...products, newProduct]);
    setIsCreatingProduct(false);
    setNewProduct({
      name: '',
      kcal: '',
      protein: '',
      fat: '',
      carbs: ''
    });
  };

  return (
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.header}>Choose a product or create your own</Text>

          <ScrollView style={styles.buttonScrollContainer}>
            {!isCreatingProduct ? (
                <>
                  <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>Choose a product</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>Choose a recipe</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.button} onPress={handleCreateProduct}>
                    <Text style={styles.buttonText}>Create your own product</Text>
                  </TouchableOpacity>
                </>
            ) : (
                <>
                  <TextInput
                      style={styles.input}
                      placeholder="Product name"
                      value={newProduct.name}
                      onChangeText={(text) => setNewProduct({ ...newProduct, name: text })}
                  />
                  <TextInput
                      style={styles.input}
                      placeholder="Kcal"
                      value={newProduct.kcal}
                      onChangeText={(text) => setNewProduct({ ...newProduct, kcal: text })}
                      keyboardType="numeric"
                  />
                  <TextInput
                      style={styles.input}
                      placeholder="Protein"
                      value={newProduct.protein}
                      onChangeText={(text) => setNewProduct({ ...newProduct, protein: text })}
                      keyboardType="numeric"
                  />
                  <TextInput
                      style={styles.input}
                      placeholder="Fat"
                      value={newProduct.fat}
                      onChangeText={(text) => setNewProduct({ ...newProduct, fat: text })}
                      keyboardType="numeric"
                  />
                  <TextInput
                      style={styles.input}
                      placeholder="Carbs"
                      value={newProduct.carbs}
                      onChangeText={(text) => setNewProduct({ ...newProduct, carbs: text })}
                      keyboardType="numeric"
                  />
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.closeButton} onPress={handleCancel}>
                      <Text style={styles.closeButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.closeButton} onPress={handleAddProduct}>
                      <Text style={styles.closeButtonText}>Add</Text>
                    </TouchableOpacity>
                  </View>
                </>
            )}

            {products.map((product, index) => (
                <Text key={index} style={styles.productText}>
                  {product.name} - {product.kcal} kcal, {product.protein}g protein, {product.fat}g fat, {product.carbs}g carbs
                </Text>
            ))}
          </ScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
  );
}
