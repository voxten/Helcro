class User {
    static async create({ NazwaUzytkownika, Email, Haslo, Wzrost, Waga, Plec }) {
      const [result] = await pool.execute(
        'INSERT INTO Uzytkownik (NazwaUzytkownika, Email, Haslo, Wzrost, Waga, Plec) VALUES (?, ?, ?, ?, ?, ?)',
        [NazwaUzytkownika, Email, Haslo, Wzrost, Waga, Plec]
      );
      return result.insertId;
    }
  
    static async findByEmail(Email) {
      const [rows] = await pool.execute('SELECT * FROM Uzytkownik WHERE Email = ?', [Email]);
      return rows[0];
    }
  
    
  }
  
  module.exports = User;