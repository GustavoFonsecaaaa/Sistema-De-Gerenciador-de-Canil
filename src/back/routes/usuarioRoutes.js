const express = require('express');
const router = express.Router();
const usuarioController = require('../controller/usuarioController');

router.post('/cadastro', usuarioController.registrarUsuario);
router.post('/login', usuarioController.loginUsuario);

module.exports = router;