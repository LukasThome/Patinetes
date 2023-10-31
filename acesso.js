const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Mantenha um registro do status de cada patinete em memória.
const patinetesStatus = {};

// Rota para bloquear um patinete
app.post('/patinetes/bloquear/:patineteId', (req, res) => {
  const patineteId = req.params.patineteId;

  // Verifique se o patinete está disponível para bloqueio
  if (patinetesStatus[patineteId] === 'disponível') {
    patinetesStatus[patineteId] = 'bloqueado';
    res.status(200).json({ message: 'Patinete bloqueado com sucesso.' });
  } else {
    res.status(400).json({ error: 'O patinete não está disponível para bloqueio.' });
  }
});

// Rota para desbloquear um patinete
app.post('/patinetes/desbloquear/:patineteId', (req, res) => {
  const patineteId = req.params.patineteId;

  // Verifique se o patinete está bloqueado para desbloqueio
  if (patinetesStatus[patineteId] === 'bloqueado') {
    patinetesStatus[patineteId] = 'disponível';
    res.status(200).json({ message: 'Patinete desbloqueado com sucesso.' });
  } else {
    res.status(400).json({ error: 'O patinete não está bloqueado.' });
  }
});

const port = process.env.PORT || 3003;
app.listen(port, () => {
  console.log(`Microserviço de controle de acesso ao patinete rodando na porta ${port}`);
});
