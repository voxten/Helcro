const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.register = async (req, res) => {
  try {
    const { NazwaUzytkownika, Email, Haslo, Wzrost, Waga, Plec } = req.body;
    
    // Hashowanie hasła
    const hashedPassword = await bcrypt.hash(Haslo, 10);
    
    const userId = await User.create({
      NazwaUzytkownika,
      Email,
      Haslo: hashedPassword,
      Wzrost,
      Waga,
      Plec
    });

    res.status(201).json({ 
      message: 'Rejestracja zakończona pomyślnie',
      userId 
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Email lub nazwa użytkownika już istnieje' });
    }
    res.status(500).json({ error: 'Błąd serwera' });
  }
};

exports.login = async (req, res) => {
  try {
    const { Email, Haslo } = req.body;
    const user = await User.findByEmail(Email);
    
    if (!user || !(await bcrypt.compare(Haslo, user.Haslo))) {
      return res.status(401).json({ error: 'Nieprawidłowe dane logowania' });
    }

    // Tutaj możesz dodać generowanie tokena JWT
    res.json({ message: 'Zalogowano pomyślnie', user });
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
};