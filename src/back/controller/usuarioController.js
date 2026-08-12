const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const registrarUsuario = async (req, res) => {
    console.log('🔵 Requisição chegou no controller!', req.body);
    try {
        // ... resto do código
        const { nome, email, senha } = req.body;

        if (!nome || !email || !senha) {
            return res.status(400).json({ mensagem: 'Nome, email e senha são obrigatórios!' });
        }

        // 🔒 CRIPTOGRAFANDO A SENHA AQUI ANTES DE SALVAR
        const hashSenha = await bcrypt.hash(senha, 10);

        const sql = 'INSERT INTO Usuario (nome, email, senha) VALUES (?, ?, ?)';

        // Passando o 'hashSenha' para o banco no lugar da 'senha' limpa
        const [resultado] = await pool.execute(sql, [nome, email, hashSenha]);

        res.status(201).json({
            mensagem: 'Usuário cadastrado com sucesso!',
            usuarioId: resultado.insertId
        });

    } catch (erro) {
        console.error('Erro ao cadastrar usuário:', erro);

        if (erro.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ mensagem: 'Este email já está cadastrado no sistema.' });
        }

        res.status(500).json({ mensagem: 'Erro interno no servidor ao tentar cadastrar o usuário.' });
    }
};

const loginUsuario = async (req, res) => {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({ mensagem: 'Email e senha são obrigatórios!' });
        }

        const [rows] = await pool.execute('SELECT * FROM Usuario WHERE email = ?', [email]);

        if (rows.length === 0) {
            return res.status(401).json({ mensagem: 'Email ou senha incorretos.' });
        }

        const usuario = rows[0];

        const senhaValida = await bcrypt.compare(senha, usuario.senha);

        if (!senhaValida) {
            return res.status(401).json({ mensagem: 'Email ou senha incorretos.' });
        }

        const token = jwt.sign({ id: usuario.id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.status(200).json({
            mensagem: 'Login realizado com sucesso!',
            usuarioId: usuario.id,
            nome: usuario.nome,
            token
        });

    } catch (erro) {
        console.error('Erro ao fazer login:', erro);
        res.status(500).json({ mensagem: 'Erro interno no servidor ao tentar fazer login.' });
    }
};

module.exports = {
    registrarUsuario,
    loginUsuario
};