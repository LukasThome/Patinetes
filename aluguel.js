const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(bodyParser.json());

// Crie ou abra um banco de dados SQLite para manter registros de aluguéis
const db = new sqlite3.Database(':memory:');

// Crie uma tabela para aluguéis
db.serialize(() => {
  db.run('CREATE TABLE alugueis (id INTEGER PRIMARY KEY, patineteId TEXT, userId TEXT, startTime DATETIME, endTime DATETIME)');
});

// Rota para iniciar um novo aluguel
app.post('/alugueis/iniciar', (req, res) => {
  const { patineteId, userId, startTime } = req.body;

  // Verifique se o patinete está disponível
  
  // Execute as verificações necessárias, como verificar o status do patinete no banco de dados

  // Registre o início do aluguel no banco de dados
  const stmt = db.prepare('INSERT INTO alugueis (patineteId, userId, startTime, endTime) VALUES (?, ?, ?, ?)');
  stmt.run(patineteId, userId, startTime, null, (err) => {
    if (err) {
      res.status(500).json({ error: 'Erro ao iniciar o aluguel.' });
    } else {
      res.status(201).json({ message: 'Aluguel iniciado com sucesso.' });
    }
  });
  stmt.finalize();

  // Função que modifica o status do patinete para "alugado"
  // Função que ativa os serviços de controle de acesso ao patinete bloqueio/desbloqueio
});

// Rota para encerrar um aluguel
app.post('/alugueis/encerrar', (req, res) => {
  const { patineteId, endTime } = req.body;

  // Encontre o aluguel correspondente no banco de dados
  db.get('SELECT * FROM alugueis WHERE patineteId = ? AND endTime IS NULL', [patineteId], (err, row) => {
    if (err) {
      res.status(500).json({ error: 'Erro ao encontrar o aluguel.' });
    } else if (!row) {
      res.status(404).json({ error: 'Aluguel não encontrado ou já encerrado.' });
    } else {
      // Registre o fim do aluguel no banco de dados
      db.run('UPDATE alugueis SET endTime = ? WHERE id = ?', [endTime, row.id], (err) => {
        if (err) {
          res.status(500).json({ error: 'Erro ao encerrar o aluguel.' });
        } else {
          // Modifique o status do patinete de volta para "disponível"
          // Ative os serviços de controle de acesso ao patinete, como bloqueio/desbloqueio

          res.status(200).json({ message: 'Aluguel encerrado com sucesso.' });
        }
      });
    }
  });
});

const port = process.env.PORT || 3004;
app.listen(port, () => {
  console.log(`Servidor de controle de aluguéis rodando na porta ${port}`);
});
