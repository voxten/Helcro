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
const pool = require("./config/db");

require('dotenv').config();
const path = require('path');

const IntakeLog = require('./models/IntakeLog');

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
    },
    tls: {
        rejectUnauthorized: false // <-- THIS is the key
    }
  });
  dotenv.config({
    path: path.resolve(__dirname, '../.env') // dostosuj ścieżkę
  });
  
  
  const API_BASE_URL = process.env.API_BASE_URL;
  console.log('API_BASE_URL:', process.env.API_BASE_URL);
db.connect(err => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to MySQL');
});

app.post('/api/auth/verify-password', async (req, res) => {
    const { userId, password } = req.body;

    if (!userId || !password) {
        return res.status(400).json({ success: false, message: "Missing credentials" });
    }

    db.query('SELECT Password FROM user WHERE UserId = ?', [userId], async (err, results) => {
        if (err) {
            console.error("Verify password error:", err);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, results[0].Password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Incorrect password" });
        }

        return res.json({ success: true });
    });
});
app.post('/api/auth/change-password', async (req, res) => {
    const { userId, newPassword } = req.body;

    if (!userId || !newPassword) {
        return res.status(400).json({ 
            success: false, 
            message: 'UserId and new password are required' 
        });
    }

    if (newPassword.length < 8) {
        return res.status(400).json({ 
            success: false, 
            message: 'Password must be at least 8 characters' 
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // wrap callback-based db.query into Promise
        const runQuery = (sql, params) => {
            return new Promise((resolve, reject) => {
                db.query(sql, params, (err, results) => {
                    if (err) return reject(err);
                    resolve(results);
                });
            });
        };

        await runQuery('UPDATE user SET Password = ? WHERE UserId = ?', [hashedPassword, userId]);
        

        res.json({ 
            success: true,
            message: 'Password changed successfully' 
        });

    } catch (error) {
        console.error('Password change error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to change password' 
        });
    }
});
app.get('/delete-account', (req, res) => {
    const token = req.query.token;
    res.sendFile(path.join(__dirname, 'public/delete-account.html'));
});
// Request account deletion endpoint
app.post('/api/auth/request-account-deletion', (req, res) => {
    const { email } = req.body;

    // 1. Check if user exists
    db.query('SELECT * FROM user WHERE Email = ?', [email], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ success: false, message: 'Server error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const user = results[0];

        // 2. Generate deletion token (valid for 24 hours)
        const token = jwt.sign(
            { userId: user.UserId, action: 'delete-account' },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // 3. Create deletion link
        const deletionUrl = `${API_BASE_URL}/delete-account?token=${token}`;

        // 4. Send email with deletion link
        const mailOptions = {
            from: `"Support" <${process.env.SMTP_USER}>`,
            to: email,
            subject: 'Confirm Account Deletion',
            html: `
                <h2>Account Deletion Request</h2>
                <p>We received a request to delete your account.</p>
                <p>Click the button below to permanently delete your account:</p>
                <a href="${deletionUrl}" style="
                    display: inline-block;
                    padding: 10px 20px;
                    background-color: #dc3545;
                    color: white;
                    text-decoration: none;
                    border-radius: 5px;
                    margin: 15px 0;
                ">Delete My Account</a>
                <p>This link will expire in 24 hours.</p>
                <p>If you didn't request this, please secure your account immediately.</p>
            `
        };

        transporter.sendMail(mailOptions, (mailError) => {
            if (mailError) {
                console.error('Email sending error:', mailError);
                return res.status(500).json({ success: false, message: 'Failed to send email' });
            }

            // 5. Store deletion token in database (optional)
            db.query(
                'UPDATE user SET deletion_token = ?, deletion_token_expires = DATE_ADD(NOW(), INTERVAL 1 DAY) WHERE UserId = ?',
                [token, user.UserId],
                (updateError) => {
                    if (updateError) {
                        console.error('Token update error:', updateError);
                        // Continue anyway - the JWT token is sufficient
                    }
                    res.json({ success: true, message: 'Deletion email sent' });
                }
            );
        });
    });
});

// Actual account deletion endpoint (using callback style)
app.post('/api/auth/delete-account', (req, res) => {
    const { token } = req.body;

    // Verify token
    jwt.verify(token, process.env.JWT_SECRET, (jwtError, decoded) => {
        if (jwtError) {
            console.error('JWT verification error:', jwtError);
            
            if (jwtError.name === 'TokenExpiredError') {
                return res.status(400).json({ success: false, message: 'Token has expired' });
            }
            
            return res.status(400).json({ success: false, message: 'Invalid token' });
        }
        
        if (decoded.action !== 'delete-account') {
            return res.status(400).json({ success: false, message: 'Invalid token' });
        }

        // Optional: Verify token against database
        db.query(
            'SELECT * FROM user WHERE UserId = ? AND deletion_token = ? AND deletion_token_expires > NOW()',
            [decoded.userId, token],
            (selectError, tokens) => {
                if (selectError) {
                    console.error('Database error:', selectError);
                    return res.status(500).json({ success: false, message: 'Server error' });
                }

                if (tokens.length === 0) {
                    return res.status(400).json({ success: false, message: 'Invalid or expired token' });
                }

                // Delete user from database
                db.query('DELETE FROM user WHERE UserId = ?', [decoded.userId], (deleteError) => {
                    if (deleteError) {
                        console.error('Deletion error:', deleteError);
                        return res.status(500).json({ success: false, message: 'Failed to delete account' });
                    }

                    res.json({ success: true, message: 'Account deleted successfully' });
                });
            }
        );
    });
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
                    return res.status(400).json({ error: 'User arleady exists' });
                }

                // Hashowanie hasła
                const hashedPassword = await bcrypt.hash(Password, 10);

                // Dodanie nowego użytkownika
                db.query('INSERT INTO user SET ?', 
                    { UserName, Email, Password: hashedPassword, Height, Weight, Gender },
                    (err, result) => {
                        if (err) throw err;
                        res.status(201).json({ message: 'Registration completed successfully!', UserId: result.insertId });
                    }
                );
            }
        );
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Logowanie użytkownika
app.post('/api/auth/login', async (req, res) => {
    const { Email, Password } = req.body;

    try {
        db.query('SELECT * FROM user WHERE Email = ?', [Email], async (err, results) => {
            if (err) throw err;
            
            if (results.length === 0) {
                return res.status(401).json({ error: 'Invalid login credentials.' });
            }

            const user = results[0];
            const isMatch = await bcrypt.compare(Password, user.Password);

            if (!isMatch) {
                return res.status(401).json({ error: 'Invalid login credentials.' });
            }

            // Generowanie tokena JWT
            const token = jwt.sign(
                { id: user.UserId },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            // Zwróć pełne dane użytkownika
            res.json({ 
                message: 'Logged in successfully',
                token,
                user: {
                    UserId: user.UserId,
                    UserName: user.UserName,
                    Email: user.Email,
                    Height: user.Height,
                    Weight: user.Weight,
                    Gender: user.Gender
                }
            });
            
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
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
// server.js - zaktualizowany endpoint
app.get('/api/user/profile', authenticateToken, (req, res) => {
    db.query('SELECT UserId, UserName, Email, Height, Weight, Gender FROM user WHERE UserId = ?', 
        [req.user.id], // Zmienione z req.user.UserId na req.user.id
        (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            
            if (results.length === 0) {
                return res.status(404).json({ error: 'User not found' });
            }
            
            res.json(results[0]);
        }
    );
});
// Serwowanie statycznej strony resetowania hasła
app.get('/reset-password', (req, res) => {
    const token = req.query.token;
    res.sendFile(path.join(__dirname, 'public/reset-password.html'));
});

// Endpoint do obsługi formularza
app.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;

    // 1. Walidacja hasła
    if (!newPassword || newPassword.length < 8) {
        return res.status(400).json({ message: 'The password must be at least 8 characters long.' });
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
                    console.error('Database error', err);
                    return res.status(500).json({ message: 'Server error' });
                }

                if (results.length === 0) {
                    return res.status(400).json({ message: 'Invalid or expired token.' });
                }

                // 4. Hashowanie nowego hasła
                const hashedPassword = await bcrypt.hash(newPassword, 10);
                
                // 5. Aktualizacja hasła w bazie
                db.query(
                    'UPDATE user SET Password = ?, reset_token = NULL, reset_token_expires = NULL WHERE UserId = ?',
                    [hashedPassword, decoded.UserId],
                    (err) => {
                        if (err) {
                            console.error('Password update error:', err);
                            return res.status(500).json({ message: 'Error during password reset' });
                        }
                        
                        res.json({ message: 'The password has been successfully reset.' });
                    }
                );
            }
        );
    } catch (error) {
        console.error('Błąd:', error);
        res.status(400).json({ message: 'Invalid or expired token.' });
    }
});
  
  // Endpoint do wysłania linku resetującego
  app.post('/api/auth/forgot-password', async (req, res) => {
    const { email } = req.body;

    // 1. Walidacja emaila
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ message: 'Please provide a valid email address.' });
    }

    try {
        // 2. Sprawdzenie czy użytkownik istnieje w bazie
        db.query('SELECT UserId, Email FROM user WHERE Email = ?', [email], async (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ message: 'Server error' });
            }

            if (results.length === 0) {
                // Zwracamy informację, że email nie istnieje
                return res.status(404).json({ message: 'Invalid email' });
            }

            const user = results[0];
            
            // 3. Generowanie tokena resetującego
            const token = jwt.sign(
                { UserId: user.UserId }, 
                process.env.JWT_SECRET, 
                { expiresIn: '1h' }
            );

            // 4. Tworzenie linku resetującego
            const resetUrl = API_BASE_URL+`/reset-password?token=${token}`;

            // 5. Konfiguracja i wysyłka emaila
            const mailOptions = {
                from: `"Helcro-Support" <${process.env.SMTP_USER}>`,
                to: email,
                subject: 'Password reset - Helcro',
                html: `
                    <h2>Password Reset</h2>
                    <p>We received a request to reset the password for this email address.</p>
                    <p>Click the link below to reset your password:</p>
                    <a href="${resetUrl}" style="
                        display: inline-block;
                        padding: 10px 20px;
                        background-color: brown;
                        color: white;
                        text-decoration: none;
                        border-radius: 5px;
                        margin: 15px 0;
                    ">Reset Password</a>
                    <p>The link will be valid for 1 hour.</p>
                    <p>If you didn't request this, please ignore this message.</p>
                `
            };

            // 6. Wysłanie emaila
            transporter.sendMail(mailOptions, (error) => {
                if (error) {
                    console.error('Error sending email', error);
                    return res.status(500).json({ message: 'Error sending email' });
                }
                
                // 7. Zapis tokena w bazie (opcjonalne)
                db.query(
                    'UPDATE user SET reset_token = ?, reset_token_expires = DATE_ADD(NOW(), INTERVAL 1 HOUR) WHERE UserId = ?',
                    [token, user.UserId],
                    (err) => {
                        if (err) {
                            console.error('Error saving token:', err);
                            // Kontynuuj pomimo błędu - token JWT jest już wystarczający
                        }
                        res.json({ message: 'A password reset link has been sent to the provided email address.' });
                    }
                );
            });
        });
    } catch (error) {
        console.error('Błąd:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
  
  // Endpoint do resetowania hasła
 app.post('/api/auth/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;

    // 1. Walidacja hasła
    if (!newPassword || newPassword.length < 8) {
        return res.status(400).json({ message: 'The password must be at least 8 characters long.' });
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
                    return res.status(500).json({ message: 'Server error' });
                }

                if (results.length === 0) {
                    return res.status(400).json({ message: 'Invalid or expired token' });
                }

                // 4. Hashowanie nowego hasła
                const hashedPassword = await bcrypt.hash(newPassword, 10);
                
                // 5. Aktualizacja hasła w bazie
                db.query(
                    'UPDATE user SET Password = ?, reset_token = NULL, reset_token_expires = NULL WHERE UserId = ?',
                    [hashedPassword, decoded.UserId],
                    (err) => {
                        if (err) {
                            console.error('Password update error:', err);
                            return res.status(500).json({ message: 'Error during password reset' });
                        }
                        
                        res.json({ message: 'The password has been successfully reset.' });
                    }
                );
            }
        );
    } catch (error) {
        console.error('Błąd:', error);
        res.status(400).json({ message: 'Invalid or expired token' });
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
// GET /intakeLog - Fetch IntakeLog for a user and date
app.get('/intakeLog', async (req, res) => {
    try {
        const { userId, date } = req.query;

        if (!userId || !date) {
            console.log('Missing userId or date');
            return res.status(400).json({
                success: false,
                message: 'User ID and date are required'
            });
        }

        const intakeLog = await IntakeLog.findWithProducts(userId, date);

        if (!intakeLog) {
            console.log('No intake log found');
            return res.status(200).json({
                success: true,
                meals: []
            });
        }

        // Group products by meal
        const mealsMap = new Map();
        intakeLog.products.forEach(product => {
            if (!mealsMap.has(product.MealId)) {
                mealsMap.set(product.MealId, {
                    MealId: product.MealId,
                    MealType: product.MealType,
                    MealName: product.MealName || product.MealType,
                    products: []
                });
            }
            mealsMap.get(product.MealId).products.push(product);
        });

        const meals = Array.from(mealsMap.values()).map(meal => ({
            id: meal.MealId,
            type: meal.MealType,
            name: meal.MealName,
            products: meal.products.map(product => ({
                ...product,
                calories: (product.calories / 100) * (product.grams || 100),
                proteins: (product.proteins / 100) * (product.grams || 100),
                fats: (product.fats / 100) * (product.grams || 100),
                carbohydrates: (product.carbohydrates / 100) * (product.grams || 100)
            }))
        }));

        res.json({
            success: true,
            meals
        });
    } catch (error) {
        console.error('Error in /intakeLog:', {
            message: error.message,
            stack: error.stack
        });
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

app.post('/intakeLog', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { userId, date, mealType, mealName, products, mealId } = req.body;

        // Validate required fields
        if (!userId || !date || !mealType) {
            await connection.rollback();
            connection.release();
            return res.status(400).json({
                success: false,
                message: 'userId, date, and mealType are required'
            });
        }

        await connection.beginTransaction();

        try {
            // 1. Find or create IntakeLog
            let IntakeLogId;
            const [existingLog] = await connection.execute(
                'SELECT IntakeLogId FROM IntakeLog WHERE UserId = ? AND LogDate = ? FOR UPDATE',
                [userId, date]
            );

            if (existingLog.length > 0) {
                IntakeLogId = existingLog[0].IntakeLogId;
            } else {
                const [intakeLogResult] = await connection.execute(
                    'INSERT INTO IntakeLog (UserId, LogDate) VALUES (?, ?)',
                    [userId, date]
                );
                IntakeLogId = intakeLogResult.insertId;
            }

            // 2. Get or create Meal
            let MealId = mealId;
            const mealNameToUse = mealName || mealType;

            if (!MealId) {
                const [mealRows] = await connection.execute(
                    'SELECT MealId FROM Meal WHERE MealType = ?',
                    [mealType]
                );

                if (mealRows.length > 0) {
                    MealId = mealRows[0].MealId;
                } else {
                    const [mealResult] = await connection.execute(
                        'INSERT INTO Meal (MealType) VALUES (?)',
                        [mealType]
                    );
                    MealId = mealResult.insertId;
                }
            }

            // 3. Add/update products in IntakeLog_has_Product with grams
            for (const product of products) {
                const grams = product.grams || 100; // Default to 100g if not specified

                // Check if product already exists
                const [existingProduct] = await connection.execute(
                    'SELECT 1 FROM IntakeLog_has_Product WHERE IntakeLogId = ? AND ProductId = ? AND MealId = ?',
                    [IntakeLogId, product.productId, MealId]
                );

                if (existingProduct.length === 0) {
                    await connection.execute(
                        'INSERT INTO IntakeLog_has_Product (IntakeLogId, ProductId, MealId, MealName, grams) VALUES (?, ?, ?, ?, ?)',
                        [IntakeLogId, product.productId, MealId, mealNameToUse, grams]
                    );
                } else {
                    await connection.execute(
                        'UPDATE IntakeLog_has_Product SET MealName = ?, grams = ? WHERE IntakeLogId = ? AND ProductId = ? AND MealId = ?',
                        [mealNameToUse, grams, IntakeLogId, product.productId, MealId]
                    );
                }
            }

            await connection.commit();
            connection.release();

            res.status(201).json({
                success: true,
                IntakeLogId,
                MealId,
                mealType,
                mealName: mealNameToUse
            });
        } catch (error) {
            await connection.rollback();
            connection.release();
            console.error('Transaction error:', error);
            res.status(500).json({
                success: false,
                message: 'Transaction failed',
                error: error.message
            });
        }
    } catch (error) {
        connection.release();
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});
// PUT /intakeLog/:id - Update existing IntakeLog
app.put('/intakeLog/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { products } = req.body;

        const success = await IntakeLog.updateProductsForIntakeLog(id, products);

        if (!success) {
            return res.status(404).json({ message: 'Intake log not found' });
        }

        res.json({ message: 'Intake log updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

const Weight = require('./models/Weight');

// GET /weight - Get all weight entries for user
app.get('/weight', async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ success: false, message: 'User ID is required' });
        }

        const weights = await Weight.findByUser(userId);
        res.json({ success: true, weights });
    } catch (error) {
        console.error('Error fetching weight history:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// POST /weight - Add new weight entry
// In server.js
app.post('/weight', async (req, res) => {
    try {
        const { userId, date, weight } = req.body;

        if (!userId || !date || !weight) {
            return res.status(400).json({
                success: false,
                message: 'User ID, date, and weight are required'
            });
        }

        const weightId = await Weight.create({
            UserId: userId,
            WeightDate: date,
            Weight: parseFloat(weight)
        });

        res.status(201).json({
            success: true,
            weight: {
                WeightId: weightId,
                WeightDate: date,
                Weight: weight
            }
        });
    } catch (error) {
        console.error('Error adding weight:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// DELETE /weight/:id - Delete weight entry
app.delete('/weight/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const success = await Weight.delete(id);

        if (!success) {
            return res.status(404).json({ success: false, message: 'Weight entry not found' });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting weight:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
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
