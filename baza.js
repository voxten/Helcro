import React, { useEffect, useState } from "react";
import { View, Text, FlatList } from "react-native";
import axios from "axios";
import { API_BASE_URL } from '@env';

const apiUrl = `${API_BASE_URL}`;

export default function Baza() {
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);
    const [products1, setProducts1] = useState([]);
    const [recipeName, setRecipeName] = useState("");

    useEffect(() => {
        axios.get(apiUrl + "/users")//wpisz adres ip komputera jak korzystasz z expo go, albo localhost jesli z emulatora
            .then(response => setUsers(response.data))
            .catch(error => console.error("Error fetching data:", error.response.data));
    }, []);

    useEffect(() => {
        axios.get(apiUrl + "/products")//wpisz adres ip komputera jak korzystasz z expo go, albo localhost jesli z emulatora
            .then(response => setProducts(response.data))
            .catch(error => console.error("Error fetching data:", error.response.data));
    }, []);
    useEffect(() => {
        const recepturaId = 1; // Pass dynamically if needed
        axios.get(apiUrl + `/receptury`)
            .then(response => {
                if (response.data && response.data.length > 0) {
                    setRecipeName(response.data[0].NazwaReceptury); // Set recipe name
                    setProducts1(response.data); // Set products list
                }
            })
            .catch(error => console.error("Error fetching data:", error.response.data));
    }, []);

    return (
        <View>
            <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>
                {recipeName ? `Recipe: ${recipeName}` : "Loading..."}
            </Text>
            <FlatList
                data={products1}
                keyExtractor={(item) => item.ProduktID} // Make sure ProduktID is correct
                renderItem={({ item }) => (
                    <Text>
                        Name: {item.products} - Quantity: {item.Ilosc} {/* Updated for correct property names */}
                    </Text>
                )}
            />
        </View>
    );
}