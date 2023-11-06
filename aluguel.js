const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const fetch = require("node-fetch"); // Importe a biblioteca node-fetch

const patineteServiceURL = "http://localhost:3002"; // URL Pro acesso.js

const app = express();
app.use(bodyParser.json());

// Cria um banco de dados SQLite para manter registros de aluguéis
const db = new sqlite3.Database("alugueis.db");

// Crie uma tabela para aluguéis
db.serialize(() => {
  db.run(
    "CREATE TABLE alugueis (id INTEGER PRIMARY KEY, patineteId TEXT, userId TEXT, startTime DATETIME, endTime DATETIME)"
  );
});

// Rota para iniciar um novo aluguel
app.post("/alugueis/iniciar", async (req, res) => {
  const { patineteId, userId } = req.body;

  const startTime = new Date();

  // Encontra o próximo ID disponível para o novo aluguel
  db.get("SELECT max(id) AS maxId FROM alugueis", (err, row) => {
    if (err) {
      res.status(500).json({ error: "Erro ao criar o aluguel." });
    } else {
      const nextId = row.maxId ? row.maxId + 1 : 1;

      // Defina a variável aluguel com os valores apropriados
      const aluguel = {
        id: nextId,
        patineteId,
        userId,
        startTime,
      };

      /* Verifique se o patinete está disponível
  const bloqueioResponse = await fetch(
    `${patineteServiceURL}/patinetes/bloquear/${patineteId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cartao: "1234 5678 9012 3456", //mudar
        amount: Math.ceil(Math.random() * 100),
        aluguelId: aluguel.id, // Usando a variável aluguel
      }),
    }
  );

  

  if (bloqueioResponse.status === 200) {
    console.log(`bloqueaduu`);
  }
  // Executa as verificações necessárias, como verificar o status do patinete no banco de dados
*/
      // Registra o início do aluguel no banco de dados
      const stmt = db.prepare(
        "INSERT INTO alugueis (patineteId, userId, startTime, endTime) VALUES (?, ?, ?, ?)"
      );
      stmt.run(patineteId, userId, startTime, null, (err) => {
        if (err) {
          res.status(500).json({ error: "Erro ao iniciar o aluguel." });
        } else {
          res.status(201).json({ message: "Aluguel iniciado com sucesso." });
        }
      });
      stmt.finalize();

      // Função que modifica o status do patinete para "alugado"

      // Função que ativa os serviços de controle de acesso ao patinete bloqueio/desbloqueio
    }
  });
});

// Rota para encerrar um aluguel
app.post("/alugueis/encerrar", (req, res) => {
  const { patineteId } = req.body;

  // Obter a hora atual como endTime
  const endTime = new Date();

  // Encontre o aluguel correspondente no banco de dados
  db.get(
    "SELECT * FROM alugueis WHERE patineteId = ? AND endTime IS NULL",
    [patineteId],
    (err, row) => {
      if (err) {
        res.status(500).json({ error: "Erro ao encontrar o aluguel." });
      } else if (!row) {
        res
          .status(404)
          .json({ error: "Aluguel não encontrado ou já encerrado." });
      } else {
        // Registre o fim do aluguel no banco de dados
        db.run(
          "UPDATE alugueis SET endTime = ? WHERE id = ?",
          [endTime, row.id],
          (err) => {
            if (err) {
              res.status(500).json({ error: "Erro ao encerrar o aluguel." });
            } else {
              // Modificar o status do patinete de volta para "disponível"

              // Ativaa os serviços de acesso ao patinete, como bloqueio/desbloqueio

              res
                .status(200)
                .json({ message: "Aluguel encerrado com sucesso." });
            }
          }
        );
      }
    }
  );
});

// Rota para visualizar todos os aluguéis
app.get("/alugueis", (req, res) => {
  db.all("SELECT * FROM alugueis", (err, rows) => {
    if (err) {
      res.status(500).json({ error: "Erro ao buscar os aluguéis." });
    } else {
      // Formatea as datas de início e fim em um formato legível
      const alugueisFormatados = rows.map((aluguel) => {
        return {
          id: aluguel.id,
          patineteId: aluguel.patineteId,
          userId: aluguel.userId,
          startTime: new Date(aluguel.startTime).toLocaleString(),
          endTime: aluguel.endTime
            ? new Date(aluguel.endTime).toLocaleString()
            : null,
        };
      });

      res.status(200).json({ alugueis: alugueisFormatados });
    }
  });
});
const port = process.env.PORT || 3004;
app.listen(port, () => {
  console.log(`Servidor de controle de aluguéis rodando na porta ${port}`);
});
