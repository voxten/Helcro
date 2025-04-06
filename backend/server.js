const dotenv = require('dotenv');
const express = require('express');
const mysql = require('mysql2');
const axios = require('axios');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const nodemailer = require('nodemailer');
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
// Konfiguracja mailera
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
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
    
    const { UserName, Email, Password, Height, Weight, Gender } = req.body;

    try {
        // Sprawdź czy użytkownik już istnieje
        db.query('SELECT * FROM user WHERE Email = ? OR UserName = ?', 
            [Email, UserName], 
            async (err, results) => {
                if (err) throw err;
                
                if (results.length > 0) {
                    return res.status(400).json({ error: 'Użytkownik już istnieje' });
                }

                // Hashowanie hasła
                const hashedPassword = await bcrypt.hash(Password, 10);

                // Dodanie nowego użytkownika
                db.query('INSERT INTO user SET ?', 
                    { UserName, Email, Password: hashedPassword, Height, Weight, Gender },
                    (err, result) => {
                        if (err) throw err;
                        res.status(201).json({ message: 'Rejestracja zakończona pomyślnie', UserId: result.insertId });
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
    const { Email, Password } = req.body;

    try {
        db.query('SELECT * FROM user WHERE Email = ?', [Email], async (err, results) => {
            if (err) throw err;
            
            if (results.length === 0) {
                return res.status(401).json({ error: 'Nieprawidłowe dane logowania' });
            }

            const user = results[0];
            const isMatch = await bcrypt.compare(Password, user.Password);

            if (!isMatch) {
                return res.status(401).json({ error: 'Nieprawidłowe dane logowania' });
            }

            // Generowanie tokena JWT
            const token = jwt.sign(
                { id: user.UserId },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            res.json({ 
                message: 'Zalogowano pomyślnie',
                token,
                user: {
                    id: user.UserId,
                    UserName: user.UserName,
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
    db.query('SELECT UserId, UserName, Email, Height, Weight, Gender FROM user WHERE UserId = ?', 
        [req.user.UserId], 
        (err, results) => {
            if (err) throw err;
            res.json(results[0]);
        }
    );
});

  
  // Endpoint do wysłania linku resetującego
  app.post('/api/auth/forgot-password', async (req, res) => {
    const { email } = req.body;

    // 1. Walidacja emaila
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ message: 'Proszę podać poprawny adres email' });
    }

    try {
        // 2. Sprawdzenie czy użytkownik istnieje w bazie
        db.query('SELECT UserId, Email FROM user WHERE Email = ?', [email], async (err, results) => {
            if (err) {
                console.error('Błąd bazy danych:', err);
                return res.status(500).json({ message: 'Błąd serwera' });
            }

            if (results.length === 0) {
                // Celowo zwracamy sukces, aby nie ujawniać czy email istnieje
                return res.json({ message: 'Jeśli email istnieje w naszej bazie, wysłaliśmy link resetujący' });
            }

            const user = results[0];
            
            // 3. Generowanie tokena resetującego
            const token = jwt.sign(
                { UserId: user.UserId }, 
                process.env.JWT_SECRET, 
                { expiresIn: '1h' }
            );

            // 4. Tworzenie linku resetującego
            const resetUrl = `${process.env.API_BASE_URL}/reset-password?token=${token}`;

            // 5. Konfiguracja i wysyłka emaila
            const mailOptions = {
                from: `"Support" <${process.env.SMTP_USER}>`,
                to: email,
                subject: 'Reset hasła - Twoja Aplikacja',
                html: `
                    <h2>Resetowanie hasła</h2>
                    <p>Otrzymaliśmy prośbę o reset hasła dla tego emaila.</p>
                    <p>Kliknij poniższy link aby zresetować hasło:</p>
                    <a href="${resetUrl}" style="
                        display: inline-block;
                        padding: 10px 20px;
                        background-color: #4CAF50;
                        color: white;
                        text-decoration: none;
                        border-radius: 5px;
                        margin: 15px 0;
                    ">Resetuj hasło</a>
                    <p>Link będzie aktywny przez 1 godzinę.</p>
                    <p>Jeśli to nie Ty wysłałeś tę prośbę, zignoruj tę wiadomość.</p>
                `
            };

            // 6. Wysłanie emaila
            transporter.sendMail(mailOptions, (error) => {
                if (error) {
                    console.error('Błąd wysyłania emaila:', error);
                    return res.status(500).json({ message: 'Błąd podczas wysyłania emaila' });
                }
                
                // 7. Zapis tokena w bazie (opcjonalne)
                db.query(
                    'UPDATE user SET reset_token = ?, reset_token_expires = DATE_ADD(NOW(), INTERVAL 1 HOUR) WHERE UserId = ?',
                    [token, user.UserId],
                    (err) => {
                        if (err) {
                            console.error('Błąd zapisu tokena:', err);
                            // Kontynuuj pomimo błędu - token JWT jest już wystarczający
                        }
                        res.json({ message: 'Jeśli email istnieje w naszej bazie, wysłaliśmy link resetujący' });
                    }
                );
            });
        });
    } catch (error) {
        console.error('Błąd:', error);
        res.status(500).json({ message: 'Wystąpił błąd serwera' });
    }
});
  
  // Endpoint do resetowania hasła
 app.post('/api/auth/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;

    // 1. Walidacja hasła
    if (!newPassword || newPassword.length < 8) {
        return res.status(400).json({ message: 'Hasło musi mieć co najmniej 8 znaków' });
    }

    try {
        // 2. Weryfikacja tokena JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 3. Sprawdzenie w bazie (opcjonalne - dodatkowe zabezpieczenie)
        db.query(
            'SELECT UserId FROM user WHERE UserId = ? AND reset_token = ? AND reset_token_expires > NOW()',
            [decoded.UserId, token],
            async (err, results) => {
                if (err) {
                    console.error('Błąd bazy danych:', err);
                    return res.status(500).json({ message: 'Błąd serwera' });
                }

                if (results.length === 0) {
                    return res.status(400).json({ message: 'Nieprawidłowy lub przedawniony token' });
                }

                // 4. Hashowanie nowego hasła
                const hashedPassword = await bcrypt.hash(newPassword, 10);
                
                // 5. Aktualizacja hasła w bazie
                db.query(
                    'UPDATE user SET Password = ?, reset_token = NULL, reset_token_expires = NULL WHERE UserId = ?',
                    [hashedPassword, decoded.UserId],
                    (err) => {
                        if (err) {
                            console.error('Błąd aktualizacji hasła:', err);
                            return res.status(500).json({ message: 'Błąd podczas resetowania hasła' });
                        }
                        
                        res.json({ message: 'Hasło zostało pomyślnie zresetowane' });
                    }
                );
            }
        );
    } catch (error) {
        console.error('Błąd:', error);
        res.status(400).json({ message: 'Nieprawidłowy lub przedawniony token' });
    }
});

// ===== KONIEC NOWYCH ENDPOINTÓW ===== //
// Sample endpoint to get data
app.get('/users', (req, res) => {
    db.query('SELECT * FROM user', (err, results) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        res.json(results);
    });
});

app.get('/products', (req, res) => {
    db.query('SELECT * FROM product', (err, results) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        res.json(results);
    });
});
/*
app.get('/receptury', (req, res) => {
    db.query('SELECT r.Nazwa AS NazwaReceptury, p.id AS ProduktID, p.product_name AS products, rhp.Ilosc AS Ilosc FROM Receptury_has_Produkty rhp JOIN products p ON rhp.Produkty_idProduktu = p.id JOIN Receptury r ON rhp.Receptury_idReceptury = r.idReceptury  -- Corrected column name here WHERE rhp.Receptury_idReceptury = 1;', (err, results) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        res.json(results);
    });
});
*/
/*
async function fetchAndInsertProducts(page) {
    try {
        const response = await axios.get(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=&page=${page}&json=true`);
        const products = response.data.products;

        if (products && products.length > 0) {
            products.forEach(product => {
                const { product_name, nutriments, image_front_url } = product;
                if (!nutriments) return; // Skip if no nutrition data

                const query = `INSERT INTO product (product_name, proteins, fats, carbohydrates, sugars, fibers, salt, calories, image)
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
