const express = require('express');
const router = express.Router();
const cachorroController = require('../controller/cachorroController');
const { verificarToken } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.get('/', verificarToken, cachorroController.listarCachorros);
router.post('/', verificarToken, upload.single('foto'), cachorroController.cadastrarCachorro);
router.put('/:id', verificarToken, upload.single('foto'), cachorroController.atualizarCachorro);
router.delete('/:id', verificarToken, cachorroController.excluirCachorro);

module.exports = router;
