import dotenv from 'dotenv';
import express from 'express';
import mysql from 'mysql2';
import axios from 'axios';
import cors from "cors";


dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Create MySQL connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

db.connect(err => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to MySQL');
});

// Sample endpoint to get data
app.get('/users', (req, res) => {
    db.query('SELECT * FROM uzytkownik', (err, results) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        res.json(results);
    });
});

app.get('/products', (req, res) => {
    db.query('SELECT * FROM products', (err, results) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        res.json(results);
    });
});
app.get('/receptury', (req, res) => {
    db.query('SELECT r.Nazwa AS NazwaReceptury, p.id AS ProduktID, p.product_name AS products, rhp.Ilosc AS Ilosc FROM Receptury_has_Produkty rhp JOIN products p ON rhp.Produkty_idProduktu = p.id JOIN Receptury r ON rhp.Receptury_idReceptury = r.idReceptury  -- Corrected column name here WHERE rhp.Receptury_idReceptury = 1;', (err, results) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        res.json(results);
    });
});
/*
async function fetchAndInsertProducts(page) {
    try {
        const response = await axios.get(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=&page=${page}&json=true`);
        const products = response.data.products;

        if (products && products.length > 0) {
            products.forEach(product => {
                const { product_name, nutriments, image_front_url } = product;
                if (!nutriments) return; // Skip if no nutrition data

                const query = `INSERT INTO products (product_name, proteins, fats, carbohydrates, sugars, fibers, salt, calories, image)
                               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

                db.query(query, [
                    product_name || "Unknown",
                    nutriments.proteins_100g || 0,
                    nutriments.fat_100g || 0,
                    nutriments.carbohydrates_100g || 0,
                    nutriments.sugars_100g || 0,
                    nutriments.fiber_100g || 0,
                    nutriments.salt_100g || 0, // Ensure this is in grams
                    nutriments["energy-kcal_100g"] || 0, // Correct calories field,
                    image_front_url || "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg"

                ], (err, result) => {
                    if (err) {
                        console.error("Error inserting product into database:", err);
                    } else {
                        console.log(`Inserted product: ${product_name}`);
                    }
                });
            });
        }
    } catch (error) {
        console.error("Error fetching data from Open Food Facts:", error);
    }
}


async function fetchAndInsertMultiplePages(startPage , endPage ) {
    for (let page = startPage; page <= endPage; page++) {
        console.log(`Fetching page ${page}...`);
        await fetchAndInsertProducts(page);
    }
    console.log(`END`);
}

fetchAndInsertMultiplePages(10, 20);//Od strony do Strony

fetchAndInsertProducts(1);
*/

app.listen(3000, "0.0.0.0", () => console.log('Server running on port 3000'));
