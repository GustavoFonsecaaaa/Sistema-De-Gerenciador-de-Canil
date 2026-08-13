const express = require('express');
const router = express.Router();
const cruzamentoController = require('../controller/cruzamentoController');
const { verificarToken } = require('../middlewares/authMiddleware');

router.get('/cio/:cioId', verificarToken, cruzamentoController.listarPorCio);
router.post('/', verificarToken, cruzamentoController.cadastrar);
router.put('/:id', verificarToken, cruzamentoController.atualizar);
router.delete('/:id', verificarToken, cruzamentoController.excluir);

module.exports = router;
