const express = require('express');
const router = express.Router();
const consumoController = require('../controller/consumoController');
const { verificarToken } = require('../middlewares/authMiddleware');

router.get('/', verificarToken, consumoController.listarConsumo);
router.post('/abrir', verificarToken, consumoController.abrirSaco);
router.put('/:id/fechar', verificarToken, consumoController.fecharSaco);

module.exports = router;
