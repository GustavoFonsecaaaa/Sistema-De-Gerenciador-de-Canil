const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { testarConexao } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve os arquivos estaticos (css, js, img e os proprios .html)
app.use(express.static(path.join(__dirname, '../front')));

// Rota raiz -> abre o dashboard (dentro de front/html/)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../front/html/dashboard.html'));
});

app.listen(PORT, async () => {
  console.log(`🐶 CanilManager rodando em http://localhost:${PORT}`);
  await testarConexao();
});