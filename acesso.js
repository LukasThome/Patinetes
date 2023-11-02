const express = require("express");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");

const app = express();
app.use(bodyParser.json());

// Mantenha um registro do status de cada patinete em memória.
const patinetesStatus = {};

// Função para enviar uma requisição HTTP para atualizar o status do patinete
async function atualizarStatusDoPatinete(patineteId, status) {
  const url = "http://localhost:3002/patinetes";
  const response = await fetch(url, {
    method: "POST",
    body: JSON.stringify({ id: patineteId, status }),
    headers: { "Content-Type": "application/json" },
  });

  return response;
}

// Rota para bloquear um patinete
app.post("/patinetes/bloquear/:patineteId", async (req, res) => {
  const patineteId = req.params.patineteId;

  try {
    const patineteStatus = await obterStatusDoPatinete(patineteId);

    if (patineteStatus === "disponivel") {
      patinetesStatus[patineteId] = "bloqueado";
      await atualizarStatusDoPatinete(patineteId, "bloqueado"); // Envia a requisição HTTP para atualizar o status
      res.status(200).json({ message: "Patinete bloqueado com sucesso." });
    } else if (patineteStatus === "bloqueado") {
      res.status(400).json({ error: "O patinete já está bloqueado." });
    } else {
      res
        .status(400)
        .json({ error: "O patinete não está disponível para bloqueio." });
    }
  } catch (error) {
    res.status(500).json({ error: "Erro ao obter o status do patinete." });
  }
});

// Rota para desbloquear um patinete
app.post("/patinetes/desbloquear/:patineteId", (req, res) => {
  const patineteId = req.params.patineteId;

  if (!patinetesStatus[patineteId]) {
    return res
      .status(400)
      .json({ error: "Informações do patinete não encontradas." });
  }

  // Verifique se o patinete está bloqueado para desbloqueio
  if (patinetesStatus[patineteId] === "bloqueado") {
    patinetesStatus[patineteId] = "disponivel";
    res.status(200).json({ message: "Patinete desbloqueado com sucesso." });
  } else {
    res.status(400).json({ error: "O patinete não está bloqueado." });
  }
});

const port = process.env.PORT || 3003;
app.listen(port, () => {
  console.log(
    `Microserviço de controle de acesso ao patinete rodando na porta ${port}`
  );
});
