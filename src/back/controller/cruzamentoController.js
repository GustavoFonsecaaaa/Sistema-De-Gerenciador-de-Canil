const { pool } = require('../config/db');

const listarPorCio = async (req, res) => {
    try {
        const { cioId } = req.params;

        const [cruzamentos] = await pool.execute(
            'SELECT * FROM Cruzamento WHERE cio_id = ? ORDER BY data_cruzamento ASC',
            [cioId]
        );

        res.status(200).json(cruzamentos);
    } catch (erro) {
        console.error('Erro ao listar cruzamentos por cio:', erro);
        res.status(500).json({ mensagem: 'Erro interno ao listar cruzamentos.' });
    }
};

const cadastrar = async (req, res) => {
    try {
        const { cio_id, data_cruzamento, macho_parceiro, observacoes } = req.body;

        if (!cio_id || !data_cruzamento || !macho_parceiro) {
            return res.status(400).json({ mensagem: 'cio_id, data_cruzamento e macho_parceiro são obrigatórios.' });
        }

        const [resultado] = await pool.execute(
            'INSERT INTO Cruzamento (cio_id, data_cruzamento, macho_parceiro, observacoes) VALUES (?, ?, ?, ?)',
            [cio_id, data_cruzamento, macho_parceiro, observacoes || null]
        );

        res.status(201).json({
            mensagem: 'Cruzamento cadastrado com sucesso!',
            id: resultado.insertId
        });
    } catch (erro) {
        console.error('Erro ao cadastrar cruzamento:', erro);
        res.status(500).json({ mensagem: 'Erro interno ao cadastrar cruzamento.' });
    }
};

const atualizar = async (req, res) => {
    try {
        const { id } = req.params;
        const { data_cruzamento, macho_parceiro, observacoes } = req.body;

        if (!data_cruzamento || !macho_parceiro) {
            return res.status(400).json({ mensagem: 'data_cruzamento e macho_parceiro são obrigatórios.' });
        }

        const [resultado] = await pool.execute(
            'UPDATE Cruzamento SET data_cruzamento = ?, macho_parceiro = ?, observacoes = ? WHERE id = ?',
            [data_cruzamento, macho_parceiro, observacoes || null, id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ mensagem: 'Cruzamento não encontrado.' });
        }

        res.status(200).json({ mensagem: 'Cruzamento atualizado com sucesso!' });
    } catch (erro) {
        console.error('Erro ao atualizar cruzamento:', erro);
        res.status(500).json({ mensagem: 'Erro interno ao atualizar cruzamento.' });
    }
};

const excluir = async (req, res) => {
    try {
        const { id } = req.params;

        await pool.execute(
            'DELETE FROM Cruzamento WHERE id = ?',
            [id]
        );

        res.status(200).json({ mensagem: 'Cruzamento excluído com sucesso!' });
    } catch (erro) {
        console.error('Erro ao excluir cruzamento:', erro);
        res.status(500).json({ mensagem: 'Erro interno ao excluir cruzamento.' });
    }
};

module.exports = { listarPorCio, cadastrar, atualizar, excluir };

