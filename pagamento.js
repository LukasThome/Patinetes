const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(bodyParser.json());

// Crie ou abra um banco de dados SQLite
const db = new sqlite3.Database(':memory:');

// Crie uma tabela para cartões de pagamento
db.serialize(() => {
  db.run('CREATE TABLE cartoes_de_pagamento (id INTEGER PRIMARY KEY, userId TEXT, numeroCartao TEXT, nomeTitular TEXT, dataValidade TEXT, codigoSeguranca TEXT)');
});

// Rota para registrar um novo cartão de pagamento
app.post('/pagamento/registrar-cartao', (req, res) => {
  const { userId, numeroCartao, nomeTitular, dataValidade, codigoSeguranca } = req.body;

  // Valide os dados do cartão, por exemplo, verificando o formato do número do cartão e a data de validade.

  // Insira o cartão de pagamento no banco de dados
  const stmt = db.prepare('INSERT INTO cartoes_de_pagamento (userId, numeroCartao, nomeTitular, dataValidade, codigoSeguranca) VALUES (?, ?, ?, ?, ?)');
  stmt.run(userId, numeroCartao, nomeTitular, dataValidade, codigoSeguranca, (err) => {
    if (err) {
      res.status(500).json({ error: 'Erro ao registrar o cartão de pagamento.' });
    } else {
      res.status(201).json({ message: 'Cartão de pagamento registrado com sucesso.' });
    }
  });
  stmt.finalize();
});

// Rota para efetuar uma cobrança
app.post('/pagamento/cobrar/:userId', (req, res) => {
  const userId = req.params.userId;

  // Verifique se o usuário possui um cartão de pagamento registrado
  db.get('SELECT * FROM cartoes_de_pagamento WHERE userId = ?', [userId], (err, row) => {
    if (err) {
      res.status(500).json({ error: 'Erro ao verificar o cartão de pagamento.' });
    } else if (row) {
      // Simule a cobrança (geralmente, você usaria um serviço de pagamento real)
      const valorCobranca = 10; // Valor de exemplo
      const transacaoId = 'TRANS123'; // ID da transação de exemplo

      // Registre a transação no banco de dados
      db.run('INSERT INTO transacoes (userId, valorCobranca, transacaoId) VALUES (?, ?, ?)', userId, valorCobranca, transacaoId, (err) => {
        if (err) {
          res.status(500).json({ error: 'Erro ao registrar a transação de pagamento.' });
        } else {
          res.status(200).json({
            message: 'Cobrança efetuada com sucesso.',
            valorCobranca,
            transacaoId,
          });
        }
      });
    } else {
      res.status(400).json({ error: 'Nenhum cartão de pagamento registrado para o usuário.' });
    }
  });
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Microserviço de pagamento rodando na porta ${port}`);
});
