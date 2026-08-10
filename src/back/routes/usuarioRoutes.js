const express = require('express');
const router = express.Router();
const usuarioController = require('../controller/usuarioController');

// POST /api/usuarios/cadastro
router.post('/cadastro', usuarioController.registrarUsuario);

module.exports = router;
