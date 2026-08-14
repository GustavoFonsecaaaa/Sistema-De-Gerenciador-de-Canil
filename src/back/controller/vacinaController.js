const { pool } = require('../config/db');

const listar = async (req, res) => {
    try {
        const usuario_id = req.usuario.id;

        const [vacinas] = await pool.execute(
            `SELECT v.*, c.nome AS cachorro_nome, c.raca AS cachorro_raca, c.foto AS cachorro_foto 
             FROM Vacina v 
             JOIN Cachorro c ON v.cachorro_id = c.id 
             WHERE c.usuario_id = ? 
             ORDER BY v.proxima_dose ASC`,
            [usuario_id]
        );

        res.status(200).json(vacinas);
    } catch (erro) {
        console.error('Erro ao listar vacinas:', erro);
        res.status(500).json({ mensagem: 'Erro interno ao listar vacinas.' });
    }
};

const cadastrar = async (req, res) => {
    try {
        const usuario_id = req.usuario.id;
        const { cachorro_id, nome_vacina, data_aplicacao, proxima_dose } = req.body;

        if (!cachorro_id || !nome_vacina || !data_aplicacao || !proxima_dose) {
            return res.status(400).json({ mensagem: 'cachorro_id, nome_vacina, data_aplicacao e proxima_dose são obrigatórios.' });
        }

        // Garante que o cachorro pertence ao usuário logado
        const [rows] = await pool.execute(
            'SELECT id FROM Cachorro WHERE id = ? AND usuario_id = ?',
            [cachorro_id, usuario_id]
        );

        if (rows.length === 0) {
            return res.status(403).json({ mensagem: 'Cachorro não encontrado ou sem permissão.' });
        }

        const [resultado] = await pool.execute(
            'INSERT INTO Vacina (cachorro_id, nome_vacina, data_aplicacao, proxima_dose) VALUES (?, ?, ?, ?)',
            [cachorro_id, nome_vacina, data_aplicacao, proxima_dose]
        );

        res.status(201).json({
            mensagem: 'Vacina registrada com sucesso!',
            vacinaId: resultado.insertId
        });
    } catch (erro) {
        console.error('Erro ao cadastrar vacina:', erro);
        res.status(500).json({ mensagem: 'Erro interno ao cadastrar vacina.' });
    }
};

const atualizar = async (req, res) => {
    try {
        const { id } = req.params;
        const usuario_id = req.usuario.id;
        const { cachorro_id, nome_vacina, data_aplicacao, proxima_dose } = req.body;

        if (!nome_vacina || !data_aplicacao || !proxima_dose) {
            return res.status(400).json({ mensagem: 'nome_vacina, data_aplicacao e proxima_dose são obrigatórios.' });
        }

        const targetCachorroId = cachorro_id || null;

        const [resultado] = await pool.execute(
            `UPDATE Vacina 
             SET cachorro_id = COALESCE(?, cachorro_id), nome_vacina = ?, data_aplicacao = ?, proxima_dose = ?
             WHERE id = ? 
             AND cachorro_id IN (SELECT id FROM Cachorro WHERE usuario_id = ?)`,
            [targetCachorroId, nome_vacina, data_aplicacao, proxima_dose, id, usuario_id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ mensagem: 'Vacina não encontrada ou sem permissão.' });
        }

        res.status(200).json({ mensagem: 'Vacina atualizada com sucesso!' });
    } catch (erro) {
        console.error('Erro ao atualizar vacina:', erro);
        res.status(500).json({ mensagem: 'Erro interno ao atualizar vacina.' });
    }
};

const excluir = async (req, res) => {
    try {
        const { id } = req.params;
        const usuario_id = req.usuario.id;

        const [resultado] = await pool.execute(
            `DELETE FROM Vacina 
             WHERE id = ? 
             AND cachorro_id IN (SELECT id FROM Cachorro WHERE usuario_id = ?)`,
            [id, usuario_id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ mensagem: 'Vacina não encontrada ou sem permissão.' });
        }

        res.status(200).json({ mensagem: 'Vacina excluída com sucesso!' });
    } catch (erro) {
        console.error('Erro ao excluir vacina:', erro);
        res.status(500).json({ mensagem: 'Erro interno ao excluir vacina.' });
    }
};

module.exports = { listar, cadastrar, atualizar, excluir };
