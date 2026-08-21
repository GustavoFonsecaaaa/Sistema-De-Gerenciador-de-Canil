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

// Rota de rações (protegida por JWT)
app.use('/api/racoes', require('./routes/racaoRoutes'));

// Rota de consumo de ração (protegida por JWT)
app.use('/api/consumo', require('./routes/consumoRoutes'));

// Rota de vacinas (protegida por JWT)
app.use('/api/vacinas', require('./routes/vacinaRoutes'));

// Rota de ninhadas / maternidade (protegida por JWT)
app.use('/api/ninhadas', require('./routes/ninhadaRoutes'));



const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, async () => {
        console.log(`🐶 CanilManager rodando em http://localhost:${PORT}`);
        await testarConexao();
    });
}


module.exports = app;