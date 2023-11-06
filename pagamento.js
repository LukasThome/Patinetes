const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();

const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(bodyParser.json());

// Crie ou abra um banco de dados SQLite
const db = new sqlite3.Database("pagamentos.db"); // Substitua "pagamentos.db" pelo nome que você deseja.

// Crie uma tabela para transações
db.serialize(() => {
  db.run(
    "CREATE TABLE IF NOT EXISTS transacoes (id INTEGER PRIMARY KEY, userId TEXT, valorCobranca REAL, transacaoId TEXT)"
  );
});

// Crie uma tabela para cartões de pagamento
db.serialize(() => {
  db.run(
    "CREATE TABLE IF NOT EXISTS cartoes_de_pagamento (id INTEGER PRIMARY KEY, userId TEXT, numeroCartao TEXT, nomeTitular TEXT, dataValidade TEXT, codigoSeguranca TEXT)"
  );
});

// Rota para registrar um novo cartão de pagamento
app.post("/pagamento/registrar-cartao", (req, res) => {
  const { userId, numeroCartao, nomeTitular, dataValidade, codigoSeguranca } =
    req.body;

  // Valide os dados do cartão, por exemplo, verificando o formato do número do cartão e a data de validade.

  // Insira o cartão de pagamento no banco de dados
  const stmt = db.prepare(
    "INSERT INTO cartoes_de_pagamento (userId, numeroCartao, nomeTitular, dataValidade, codigoSeguranca) VALUES (?, ?, ?, ?, ?)"
  );
  stmt.run(
    userId,
    numeroCartao,
    nomeTitular,
    dataValidade,
    codigoSeguranca,
    (err) => {
      if (err) {
        res
          .status(500)
          .json({ error: "Erro ao registrar o cartão de pagamento." });
      } else {
        res
          .status(201)
          .json({ message: "Cartão de pagamento registrado com sucesso." });
      }
    }
  );
  stmt.finalize();
});

// Rota para efetuar uma cobrança
app.post("/pagamento/cobrar/:userId", (req, res) => {
  const userId = req.params.userId;
  const transacaoId = uuidv4(); // Gera um ID UUID exclusivo

  // Verifique se o usuário possui um cartão de pagamento registrado
  db.get(
    "SELECT * FROM cartoes_de_pagamento WHERE userId = ?",
    [userId],
    (err, row) => {
      if (err) {
        res
          .status(500)
          .json({ error: "Erro ao verificar o cartão de pagamento." });
      } else if (row) {
        // cobrança
        const valorCobranca = 10; // Valor de exemplo
        //const transacaoId = "TRANS123"; // ID da transação de exemplo

        // Registre a transação no banco de dados
        db.run(
          "INSERT INTO transacoes (userId, valorCobranca, transacaoId) VALUES (?, ?, ?)",
          userId,
          valorCobranca,
          transacaoId,
          (err) => {
            if (err) {
              res
                .status(500)
                .json({ error: "Erro ao registrar a transação de pagamento." });
            } else {
              res.status(200).json({
                message: "Cobrança efetuada com sucesso.",
                valorCobranca,
                transacaoId,
              });
            }
          }
        );
      } else {
        res.status(400).json({
          error: "Nenhum cartão de pagamento registrado para o usuário.",
        });
      }
    }
  );
});

// Rota para visualizar todos os cartões de pagamento e transações
app.get("/pagamento/cartoes-e-pagamentos", (req, res) => {
  // Consulte o banco de dados para obter todos os cartões de pagamento e transações
  db.all(
    "SELECT cartoes_de_pagamento.*, transacoes.valorCobranca, transacoes.transacaoId FROM cartoes_de_pagamento LEFT JOIN transacoes ON cartoes_de_pagamento.userId = transacoes.userId",
    (err, rows) => {
      if (err) {
        res
          .status(500)
          .json({ error: "Erro ao buscar os cartões e pagamentos." });
      } else {
        const cartoesEPagamentos = rows.map((row) => {
          return {
            userId: row.userId,
            numeroCartao: row.numeroCartao,
            nomeTitular: row.nomeTitular,
            dataValidade: row.dataValidade,
            codigoSeguranca: row.codigoSeguranca,
            valorCobranca: row.valorCobranca,
            transacaoId: row.transacaoId,
          };
        });
        res.status(200).json({ cartoesEPagamentos });
      }
    }
  );
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Microserviço de pagamento rodando na porta ${port}`);
});
