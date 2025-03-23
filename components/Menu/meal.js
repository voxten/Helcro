import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import styles from "../../styles/MealStyles";

export default function Meal({ onClose }) {
  const [isCreatingProduct, setIsCreatingProduct] = useState(false); // Kontroluje, czy tworzymy nowy produkt
  const [products, setProducts] = useState([]); // Przechowuje dodane produkty
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
        <Text style={styles.header}>Wybierz produkt lub stwórz własny</Text>

        <ScrollView style={styles.buttonScrollContainer}>
          {!isCreatingProduct ? (
            <>
              <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>Wybierz produkt</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>Wybierz przepis</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={handleCreateProduct}>
                <Text style={styles.buttonText}>Stwórz własny produkt</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TextInput
                style={styles.input}
                placeholder="Nazwa produktu"
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
                placeholder="Białko"
                value={newProduct.protein}
                onChangeText={(text) => setNewProduct({ ...newProduct, protein: text })}
                keyboardType="numeric"
              />
              <TextInput
                style={styles.input}
                placeholder="Tłuszcz"
                value={newProduct.fat}
                onChangeText={(text) => setNewProduct({ ...newProduct, fat: text })}
                keyboardType="numeric"
              />
              <TextInput
                style={styles.input}
                placeholder="Węglowodany"
                value={newProduct.carbs}
                onChangeText={(text) => setNewProduct({ ...newProduct, carbs: text })}
                keyboardType="numeric"
              />
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.closeButton} onPress={handleCancel}>
                  <Text style={styles.closeButtonText}>Anuluj</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.closeButton} onPress={handleAddProduct}>
                  <Text style={styles.closeButtonText}>Dodaj</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {products.map((product, index) => (
            <Text key={index} style={styles.productText}>
              {product.name} - {product.kcal} kcal, {product.protein}g białka, {product.fat}g tłuszczu, {product.carbs}g węglowodanów
            </Text>
          ))}
        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Zamknij</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Zapisz</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
