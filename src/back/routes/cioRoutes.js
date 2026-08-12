const express = require('express');
const router = express.Router();
const cioController = require('../controller/cioController');
const { verificarToken } = require('../middlewares/authMiddleware');

router.get('/', verificarToken, cioController.listarCios);
router.post('/', verificarToken, cioController.cadastrarCio);
router.delete('/:id', verificarToken, cioController.excluirCio);

module.exports = router;
