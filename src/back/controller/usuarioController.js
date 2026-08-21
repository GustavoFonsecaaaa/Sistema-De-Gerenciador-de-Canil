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

const excluirMinhaConta = async (req, res) => {
    const usuario_id = req.usuario.id;
    console.log(`🔴 Iniciando exclusão em cascata do usuário ID: ${usuario_id}`);

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Apagar Cruzamentos cujos Cios pertencem a Cachorros do usuário
        await connection.execute(
            `DELETE FROM Cruzamento 
             WHERE cio_id IN (
                 SELECT c.id FROM Cio c 
                 JOIN Cachorro ca ON c.cachorro_id = ca.id 
                 WHERE ca.usuario_id = ?
             )`,
            [usuario_id]
        );

        // 2. Apagar Vacinas dos Cachorros do usuário
        await connection.execute(
            `DELETE FROM Vacina 
             WHERE cachorro_id IN (
                 SELECT id FROM Cachorro WHERE usuario_id = ?
             )`,
            [usuario_id]
        );

        // 3. Apagar Ninhadas das Mães do usuário
        await connection.execute(
            `DELETE FROM Ninhada 
             WHERE mae_id IN (
                 SELECT id FROM Cachorro WHERE usuario_id = ?
             )`,
            [usuario_id]
        );

        // 4. Apagar Cios dos Cachorros do usuário
        await connection.execute(
            `DELETE FROM Cio 
             WHERE cachorro_id IN (
                 SELECT id FROM Cachorro WHERE usuario_id = ?
             )`,
            [usuario_id]
        );

        // 5. Apagar Consumo de Ração do usuário
        await connection.execute(
            `DELETE FROM ConsumoRacao WHERE usuario_id = ?`,
            [usuario_id]
        );

        // 6. Apagar Rações do usuário
        await connection.execute(
            `DELETE FROM Racao WHERE usuario_id = ?`,
            [usuario_id]
        );

        // 7. Apagar Cachorros do usuário
        await connection.execute(
            `DELETE FROM Cachorro WHERE usuario_id = ?`,
            [usuario_id]
        );

        // 8. Apagar o próprio Usuário
        const [resultado] = await connection.execute(
            `DELETE FROM Usuario WHERE id = ?`,
            [usuario_id]
        );

        if (resultado.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
        }

        await connection.commit();
        console.log(`✅ Usuário ID: ${usuario_id} e todos os registros dependentes foram excluídos com sucesso!`);

        res.status(200).json({ mensagem: 'Conta e dados associados foram excluídos com sucesso.' });

    } catch (erro) {
        await connection.rollback();
        console.error('❌ Erro ao excluir conta de usuário:', erro);
        res.status(500).json({ mensagem: 'Erro interno no servidor ao tentar excluir a conta.' });
    } finally {
        connection.release();
    }
};

module.exports = {
    registrarUsuario,
    loginUsuario,
    excluirMinhaConta
};