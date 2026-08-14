const express = require('express');
const router = express.Router();
const ninhadaController = require('../controller/ninhadaController');
const { verificarToken } = require('../middlewares/authMiddleware');

router.get('/', verificarToken, ninhadaController.listar);
router.post('/', verificarToken, ninhadaController.cadastrar);
router.put('/:id', verificarToken, ninhadaController.atualizar);
router.delete('/:id', verificarToken, ninhadaController.excluir);

module.exports = router;
