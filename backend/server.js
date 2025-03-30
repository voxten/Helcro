const dotenv = require('dotenv');
const express = require('express');
const mysql = require('mysql2');
const axios = require('axios');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

require('dotenv').config();

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
// ===== DODANE NOWE ENDPOINTY ===== //

// Rejestracja użytkownika
app.post('/api/auth/register', async (req, res) => {
    
    const { NazwaUzytkownika, Email, Haslo, Wzrost, Waga, Plec } = req.body;

    try {
        // Sprawdź czy użytkownik już istnieje
        db.query('SELECT * FROM Uzytkownik WHERE Email = ? OR NazwaUzytkownika = ?', 
            [Email, NazwaUzytkownika], 
            async (err, results) => {
                if (err) throw err;
                
                if (results.length > 0) {
                    return res.status(400).json({ error: 'Użytkownik już istnieje' });
                }

                // Hashowanie hasła
                const hashedPassword = await bcrypt.hash(Haslo, 10);

                // Dodanie nowego użytkownika
                db.query('INSERT INTO Uzytkownik SET ?', 
                    { NazwaUzytkownika, Email, Haslo: hashedPassword, Wzrost, Waga, Plec },
                    (err, result) => {
                        if (err) throw err;
                        res.status(201).json({ message: 'Rejestracja zakończona pomyślnie', userId: result.insertId });
                    }
                );
            }
        );
    } catch (error) {
        res.status(500).json({ error: 'Błąd serwera' });
    }
});

// Logowanie użytkownika
app.post('/api/auth/login', async (req, res) => {
    const { Email, Haslo } = req.body;

    try {
        db.query('SELECT * FROM Uzytkownik WHERE Email = ?', [Email], async (err, results) => {
            if (err) throw err;
            
            if (results.length === 0) {
                return res.status(401).json({ error: 'Nieprawidłowe dane logowania' });
            }

            const user = results[0];
            const isMatch = await bcrypt.compare(Haslo, user.Haslo);

            if (!isMatch) {
                return res.status(401).json({ error: 'Nieprawidłowe dane logowania' });
            }

            // Generowanie tokena JWT
            const token = jwt.sign(
                { id: user.id_Uzytkownika },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            res.json({ 
                message: 'Zalogowano pomyślnie',
                token,
                user: {
                    id: user.id_Uzytkownika,
                    NazwaUzytkownika: user.NazwaUzytkownika,
                    Email: user.Email
                }
            });
        });
    } catch (error) {
        res.status(500).json({ error: 'Błąd serwera' });
    }
});

// Middleware do weryfikacji tokena
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) return res.sendStatus(401);
    
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// Przykładowy chroniony endpoint
app.get('/api/user/profile', authenticateToken, (req, res) => {
    db.query('SELECT id_Uzytkownika, NazwaUzytkownika, Email, Wzrost, Waga, Plec FROM Uzytkownik WHERE id_Uzytkownika = ?', 
        [req.user.id], 
        (err, results) => {
            if (err) throw err;
            res.json(results[0]);
        }
    );
});

// ===== KONIEC NOWYCH ENDPOINTÓW ===== //
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
