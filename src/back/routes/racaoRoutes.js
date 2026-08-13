const express = require('express');
const router = express.Router();
const racaoController = require('../controller/racaoController');
const { verificarToken } = require('../middlewares/authMiddleware');

router.get('/', verificarToken, racaoController.listar);
router.post('/', verificarToken, racaoController.cadastrar);
router.put('/:id', verificarToken, racaoController.atualizar);
router.delete('/:id', verificarToken, racaoController.excluir);

module.exports = router;
