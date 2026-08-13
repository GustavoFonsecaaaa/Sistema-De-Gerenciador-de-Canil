const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const usuarioRoutes = require('./routes/usuarioRoutes');
const cachorroRoutes = require('./routes/cachorroRoutes');
const { testarConexao } = require('./config/db');

const app = express();

app.use(cors());
app.use(express.json());

// Serve os arquivos de upload (fotos de cachorros)
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// Rota principal de usuários
app.use('/api/usuarios', usuarioRoutes);

// Rota de cachorros (protegida por JWT)
app.use('/api/cachorros', cachorroRoutes);

// Rota de cios (protegida por JWT)
app.use('/api/cios', require('./routes/cioRoutes'));

// Rota de cruzamentos (protegida por JWT)
app.use('/api/cruzamentos', require('./routes/cruzamentoRoutes'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    console.log(`🐶 CanilManager rodando em http://localhost:${PORT}`);
    await testarConexao();
});