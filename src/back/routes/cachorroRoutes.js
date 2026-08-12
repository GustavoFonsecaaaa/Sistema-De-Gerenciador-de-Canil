const express = require('express');
const router = express.Router();
const cachorroController = require('../controller/cachorroController');
const { verificarToken } = require('../middlewares/authMiddleware');

router.get('/', verificarToken, cachorroController.listarCachorros);
router.post('/', verificarToken, cachorroController.cadastrarCachorro);

module.exports = router;
