const express = require('express');
const router = express.Router();
const usuarioController = require('../controller/usuarioController');
const { verificarToken } = require('../middlewares/authMiddleware');

router.post('/cadastro', usuarioController.registrarUsuario);
router.post('/login', usuarioController.loginUsuario);
router.delete('/me', verificarToken, usuarioController.excluirMinhaConta);

module.exports = router;