const express = require("express");
const router = express.Router();
const usuarioController = require("../controller/usuarioController");
const { verificarToken } = require("../middlewares/authMiddleware");

router.post("/cadastro", usuarioController.registrarUsuario);
router.post("/login", usuarioController.loginUsuario);
router.get("/me", verificarToken, usuarioController.obterPerfil);
router.put("/me", verificarToken, usuarioController.atualizarPerfil);
router.delete("/me", verificarToken, usuarioController.excluirMinhaConta);

// Aliases para conveniência
router.get("/perfil", verificarToken, usuarioController.obterPerfil);
router.put("/perfil", verificarToken, usuarioController.atualizarPerfil);
router.put("/:id", verificarToken, usuarioController.atualizarPerfil);

module.exports = router;
