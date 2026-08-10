const { pool } = require('../config/db');

/**
 * Registra um novo usuário no banco de dados.
 * POST /api/usuarios/cadastro
 */
async function registrarUsuario(req, res) {
  const { nome, email, senha } = req.body;

  // Validação dos campos obrigatórios
  if (!nome || !email || !senha) {
    return res.status(400).json({ mensagem: 'Os campos nome, email e senha são obrigatórios.' });
  }

  try {
    const [resultado] = await pool.execute(
      'INSERT INTO Usuario (nome, email, senha) VALUES (?, ?, ?)',
      [nome, email, senha]
    );

    return res.status(201).json({
      mensagem: 'Usuário cadastrado com sucesso.',
      id: resultado.insertId,
    });
  } catch (erro) {
    if (erro.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ mensagem: 'Email já cadastrado.' });
    }

    console.error('Erro ao registrar usuário:', erro);
    return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
  }
}

module.exports = { registrarUsuario };
