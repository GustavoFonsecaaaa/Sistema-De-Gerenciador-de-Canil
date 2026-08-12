const { pool } = require('../config/db');

const listarCios = async (req, res) => {
    try {
        const usuario_id = req.usuario.id;

        const [cios] = await pool.execute(
            `SELECT c.*, ca.nome AS cachorro_nome
             FROM Cio c
             JOIN Cachorro ca ON c.cachorro_id = ca.id
             WHERE ca.usuario_id = ?
             ORDER BY c.data_inicio DESC`,
            [usuario_id]
        );

        res.status(200).json(cios);

    } catch (erro) {
        console.error('Erro ao listar cios:', erro);
        res.status(500).json({ mensagem: 'Erro interno ao listar cios.' });
    }
};

const cadastrarCio = async (req, res) => {
    try {
        const usuario_id = req.usuario.id;
        const { cachorro_id, data_inicio, data_fim, cruzou, observacoes } = req.body;

        if (!cachorro_id || !data_inicio || !data_fim) {
            return res.status(400).json({ mensagem: 'cachorro_id, data_inicio e data_fim são obrigatórios.' });
        }

        // Garante que o cachorro pertence ao usuário logado
        const [rows] = await pool.execute(
            'SELECT id FROM Cachorro WHERE id = ? AND usuario_id = ?',
            [cachorro_id, usuario_id]
        );
        if (rows.length === 0) {
            return res.status(403).json({ mensagem: 'Cachorro não encontrado ou sem permissão.' });
        }

        const cruzouBool = cruzou === true || cruzou === 'true' || cruzou === 1 ? 1 : 0;

        const [resultado] = await pool.execute(
            'INSERT INTO Cio (cachorro_id, data_inicio, data_fim, cruzou, observacoes) VALUES (?, ?, ?, ?, ?)',
            [cachorro_id, data_inicio, data_fim, cruzouBool, observacoes || null]
        );

        res.status(201).json({
            mensagem: 'Cio registrado com sucesso!',
            cioId: resultado.insertId
        });

    } catch (erro) {
        console.error('Erro ao cadastrar cio:', erro);
        res.status(500).json({ mensagem: 'Erro interno ao cadastrar cio.' });
    }
};

const excluirCio = async (req, res) => {
    try {
        const { id } = req.params;
        const usuario_id = req.usuario.id;

        // Garante via subquery que o cio pertence a um cachorro do usuário logado
        await pool.execute(
            `DELETE FROM Cio WHERE id = ?
             AND cachorro_id IN (SELECT id FROM Cachorro WHERE usuario_id = ?)`,
            [id, usuario_id]
        );

        res.status(200).json({ mensagem: 'Cio excluído com sucesso!' });

    } catch (erro) {
        console.error('Erro ao excluir cio:', erro);
        res.status(500).json({ mensagem: 'Erro interno ao excluir cio.' });
    }
};

module.exports = { listarCios, cadastrarCio, excluirCio };
