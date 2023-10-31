const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const db = new sqlite3.Database('patinetes.db');

// Crie a tabela de patinetes se ela não existir
db.serialize(function () {
  db.run("CREATE TABLE IF NOT EXISTS patinetes (id INTEGER PRIMARY KEY, serial TEXT, status TEXT, latitude REAL, longitude REAL)");
});

// Rota para cadastrar um novo patinete
app.post('/patinetes', (req, res) => {
  const { serial, status, latitude, longitude } = req.body;
  if (!serial || !status || !latitude || !longitude) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  }

  const stmt = db.prepare("INSERT INTO patinetes (serial, status, latitude, longitude) VALUES (?, ?, ?, ?)");
  stmt.run(serial, status, latitude, longitude);
  stmt.finalize();
  res.status(201).json({ message: 'Patinete cadastrado com sucesso.' });
});

// Rota para listar todos os patinetes
app.get('/patinetes', (req, res) => {
  db.all("SELECT * FROM patinetes", (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar patinetes.' });
    }
    res.status(200).json(rows);
  });
});

const port = process.env.PORT || 3002;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
