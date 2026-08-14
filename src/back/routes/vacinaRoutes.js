const express = require('express');
const router = express.Router();
const vacinaController = require('../controller/vacinaController');
const { verificarToken } = require('../middlewares/authMiddleware');

router.get('/', verificarToken, vacinaController.listar);
router.post('/', verificarToken, vacinaController.cadastrar);
router.put('/:id', verificarToken, vacinaController.atualizar);
router.delete('/:id', verificarToken, vacinaController.excluir);

module.exports = router;
