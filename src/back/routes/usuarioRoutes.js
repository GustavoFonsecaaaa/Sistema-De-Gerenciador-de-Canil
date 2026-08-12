const express = require('express');
const router = express.Router();
const usuarioController = require('../controller/usuarioController');

router.post('/cadastro', usuarioController.registrarUsuario);

module.exports = router;