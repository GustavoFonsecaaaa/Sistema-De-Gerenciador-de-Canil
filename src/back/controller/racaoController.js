const { pool } = require('../config/db');

const listar = async (req, res) => {
    try {
        const usuario_id = req.usuario.id;

        const [racoes] = await pool.execute(
            'SELECT * FROM Racao WHERE usuario_id = ? ORDER BY data_compra DESC',
            [usuario_id]
        );

        res.status(200).json(racoes);
    } catch (erro) {
        console.error('Erro ao listar rações:', erro);
        res.status(500).json({ mensagem: 'Erro interno ao listar rações.' });
    }
};

const cadastrar = async (req, res) => {
    try {
        const usuario_id = req.usuario.id;
        const { marca, tipo, peso_saco_kg, unidades, data_compra } = req.body;

        if (!marca || !tipo || !peso_saco_kg || unidades === undefined || unidades === null) {
            return res.status(400).json({ mensagem: 'Marca, tipo, peso_saco_kg e unidades são obrigatórios.' });
        }

        const [resultado] = await pool.execute(
            'INSERT INTO Racao (usuario_id, marca, tipo, peso_saco_kg, unidades, data_compra) VALUES (?, ?, ?, ?, ?, ?)',
            [usuario_id, marca, tipo, peso_saco_kg, unidades, data_compra || null]
        );

        res.status(201).json({
            mensagem: 'Ração cadastrada com sucesso!',
            id: resultado.insertId
        });
    } catch (erro) {
        console.error('Erro ao cadastrar ração:', erro);
        res.status(500).json({ mensagem: 'Erro interno ao cadastrar ração.' });
    }
};

const atualizar = async (req, res) => {
    try {
        const { id } = req.params;
        const usuario_id = req.usuario.id;
        const { marca, tipo, peso_saco_kg, unidades, data_compra } = req.body;

        const [resultado] = await pool.execute(
            'UPDATE Racao SET marca = ?, tipo = ?, peso_saco_kg = ?, unidades = ?, data_compra = ? WHERE id = ? AND usuario_id = ?',
            [marca, tipo, peso_saco_kg, unidades, data_compra || null, id, usuario_id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ mensagem: 'Ração não encontrada ou sem permissão.' });
        }

        res.status(200).json({ mensagem: 'Ração atualizada com sucesso!' });
    } catch (erro) {
        console.error('Erro ao atualizar ração:', erro);
        res.status(500).json({ mensagem: 'Erro interno ao atualizar ração.' });
    }
};

const excluir = async (req, res) => {
    try {
        const { id } = req.params;
        const usuario_id = req.usuario.id;

        await pool.execute(
            'DELETE FROM Racao WHERE id = ? AND usuario_id = ?',
            [id, usuario_id]
        );

        res.status(200).json({ mensagem: 'Ração excluída com sucesso!' });
    } catch (erro) {
        console.error('Erro ao excluir ração:', erro);
        res.status(500).json({ mensagem: 'Erro interno ao excluir ração.' });
    }
};

module.exports = { listar, cadastrar, atualizar, excluir };
