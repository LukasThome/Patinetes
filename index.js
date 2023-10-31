const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const db = new sqlite3.Database('users.db');

// Crie a tabela de usuários se ela não existir
db.serialize(function () {
  db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT, cpf TEXT, email TEXT, phone TEXT)");
});

// Rota para criar um novo usuário
app.post('/users', (req, res) => {
  const { name, cpf, email, phone } = req.body;
  if (!name || !cpf || !email || !phone) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  }

  const stmt = db.prepare("INSERT INTO users (name, cpf, email, phone) VALUES (?, ?, ?, ?)");
  stmt.run(name, cpf, email, phone);
  stmt.finalize();
  res.status(201).json({ message: 'Usuário cadastrado com sucesso.' });
});

// Rota para listar todos os usuários
app.get('/users', (req, res) => {
  db.all("SELECT * FROM users", (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar usuários.' });
    }
    res.status(200).json(rows);
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
