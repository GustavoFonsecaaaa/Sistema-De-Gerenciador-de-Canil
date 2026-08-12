const express = require('express');
const cors = require('cors');
require('dotenv').config();

const usuarioRoutes = require('./routes/usuarioRoutes');
const { testarConexao } = require('./config/db');

const app = express();

app.use(cors());
app.use(express.json());

// Rota principal de usuários
app.use('/api/usuarios', usuarioRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    console.log(`🐶 CanilManager rodando em http://localhost:${PORT}`);
    await testarConexao();
});