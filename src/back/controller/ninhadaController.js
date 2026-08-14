const { pool } = require('../config/db');

const listar = async (req, res) => {
    try {
        const usuario_id = req.usuario.id;

        const [ninhadas] = await pool.execute(
            `SELECT n.*, c.nome AS mae_nome, c.foto AS mae_foto, c.raca AS mae_raca
             FROM Ninhada n
             JOIN Cachorro c ON n.mae_id = c.id
             WHERE c.usuario_id = ?
             ORDER BY n.data_nascimento DESC`,
            [usuario_id]
        );

        res.status(200).json(ninhadas);
    } catch (erro) {
        console.error('Erro ao listar ninhadas:', erro);
        res.status(500).json({ mensagem: 'Erro interno ao listar ninhadas.' });
    }
};

const cadastrar = async (req, res) => {
    try {
        const usuario_id = req.usuario.id;
        const { mae_id, data_nascimento, quantidade_filhotes, observacoes } = req.body;

        if (!mae_id || !data_nascimento) {
            return res.status(400).json({ mensagem: 'mae_id e data_nascimento são obrigatórios.' });
        }

        // Garante pertencimento do cachorro ao usuário logado
        const [rows] = await pool.execute(
            'SELECT id FROM Cachorro WHERE id = ? AND usuario_id = ?',
            [mae_id, usuario_id]
        );

        if (rows.length === 0) {
            return res.status(403).json({ mensagem: 'Mãe não encontrada ou sem permissão.' });
        }

        const qtdFilhotes = quantidade_filhotes || 0;
        const obsStr = typeof observacoes === 'object' ? JSON.stringify(observacoes) : (observacoes || null);

        const [resultado] = await pool.execute(
            'INSERT INTO Ninhada (mae_id, data_nascimento, quantidade_filhotes, observacoes) VALUES (?, ?, ?, ?)',
            [mae_id, data_nascimento, qtdFilhotes, obsStr]
        );

        res.status(201).json({
            mensagem: 'Ninhada cadastrada com sucesso!',
            id: resultado.insertId
        });
    } catch (erro) {
        console.error('Erro ao cadastrar ninhada:', erro);
        res.status(500).json({ mensagem: 'Erro interno ao cadastrar ninhada.' });
    }
};

const atualizar = async (req, res) => {
    try {
        const { id } = req.params;
        const usuario_id = req.usuario.id;
        const { mae_id, data_nascimento, quantidade_filhotes, observacoes } = req.body;

        const qtdFilhotes = quantidade_filhotes || 0;
        const obsStr = typeof observacoes === 'object' ? JSON.stringify(observacoes) : (observacoes || null);

        const [resultado] = await pool.execute(
            `UPDATE Ninhada 
             SET mae_id = COALESCE(?, mae_id), data_nascimento = ?, quantidade_filhotes = ?, observacoes = ?
             WHERE id = ? 
             AND mae_id IN (SELECT id FROM Cachorro WHERE usuario_id = ?)`,
            [mae_id || null, data_nascimento, qtdFilhotes, obsStr, id, usuario_id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ mensagem: 'Ninhada não encontrada ou sem permissão.' });
        }

        res.status(200).json({ mensagem: 'Ninhada atualizada com sucesso!' });
    } catch (erro) {
        console.error('Erro ao atualizar ninhada:', erro);
        res.status(500).json({ mensagem: 'Erro interno ao atualizar ninhada.' });
    }
};

const excluir = async (req, res) => {
    try {
        const { id } = req.params;
        const usuario_id = req.usuario.id;

        const [resultado] = await pool.execute(
            `DELETE FROM Ninhada 
             WHERE id = ? 
             AND mae_id IN (SELECT id FROM Cachorro WHERE usuario_id = ?)`,
            [id, usuario_id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ mensagem: 'Ninhada não encontrada ou sem permissão.' });
        }

        res.status(200).json({ mensagem: 'Ninhada excluída com sucesso!' });
    } catch (erro) {
        console.error('Erro ao excluir ninhada:', erro);
        res.status(500).json({ mensagem: 'Erro interno ao excluir ninhada.' });
    }
};

module.exports = { listar, cadastrar, atualizar, excluir };
