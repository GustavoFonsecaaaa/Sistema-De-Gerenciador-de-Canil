const { pool } = require('../config/db');

const listarConsumo = async (req, res) => {
    try {
        const usuario_id = req.usuario.id;

        const [consumos] = await pool.execute(
            'SELECT * FROM ConsumoRacao WHERE usuario_id = ? ORDER BY data_abertura DESC',
            [usuario_id]
        );

        res.status(200).json(consumos);
    } catch (erro) {
        console.error('Erro ao listar consumo de ração:', erro);
        res.status(500).json({ mensagem: 'Erro interno ao listar consumo de ração.' });
    }
};

const abrirSaco = async (req, res) => {
    try {
        const usuario_id = req.usuario.id;
        const { marca, tipo, peso_kg, data_abertura } = req.body;

        if (!marca || !tipo || !peso_kg || !data_abertura) {
            return res.status(400).json({ mensagem: 'Marca, tipo, peso_kg e data_abertura são obrigatórios.' });
        }

        const [resultado] = await pool.execute(
            'INSERT INTO ConsumoRacao (usuario_id, marca, tipo, peso_kg, data_abertura) VALUES (?, ?, ?, ?, ?)',
            [usuario_id, marca, tipo, peso_kg, data_abertura]
        );

        res.status(201).json({
            mensagem: 'Abertura de saco registrada com sucesso!',
            id: resultado.insertId
        });
    } catch (erro) {
        console.error('Erro ao registrar abertura de saco:', erro);
        res.status(500).json({ mensagem: 'Erro interno ao registrar abertura de saco.' });
    }
};

const fecharSaco = async (req, res) => {
    try {
        const { id } = req.params;
        const usuario_id = req.usuario.id;
        const { data_fim } = req.body;

        if (!data_fim) {
            return res.status(400).json({ mensagem: 'data_fim é obrigatória.' });
        }

        const [resultado] = await pool.execute(
            'UPDATE ConsumoRacao SET data_fim = ? WHERE id = ? AND usuario_id = ?',
            [data_fim, id, usuario_id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ mensagem: 'Registro de consumo não encontrado ou sem permissão.' });
        }

        res.status(200).json({ mensagem: 'Saco finalizado com sucesso!' });
    } catch (erro) {
        console.error('Erro ao finalizar saco de ração:', erro);
        res.status(500).json({ mensagem: 'Erro interno ao finalizar saco de ração.' });
    }
};

module.exports = { listarConsumo, abrirSaco, fecharSaco };
