const { pool } = require('../config/db');

const listarCachorros = async (req, res) => {
    try {
        const usuario_id = req.usuario.id;

        const [cachorros] = await pool.execute(
            'SELECT * FROM Cachorro WHERE usuario_id = ? ORDER BY nome ASC',
            [usuario_id]
        );

        res.status(200).json(cachorros);

    } catch (erro) {
        console.error('Erro ao listar cachorros:', erro);
        res.status(500).json({ mensagem: 'Erro interno ao listar cachorros.' });
    }
};

const cadastrarCachorro = async (req, res) => {
    try {
        const usuario_id = req.usuario.id;
        const { nome, raca, sexo, data_nascimento } = req.body;

        if (!nome || !raca || !sexo || !data_nascimento) {
            return res.status(400).json({ mensagem: 'Nome, raça, sexo e data de nascimento são obrigatórios.' });
        }

        const sql = 'INSERT INTO Cachorro (nome, raca, sexo, data_nascimento, usuario_id) VALUES (?, ?, ?, ?, ?)';
        const [resultado] = await pool.execute(sql, [nome, raca, sexo, data_nascimento, usuario_id]);

        res.status(201).json({
            mensagem: 'Cachorro cadastrado com sucesso!',
            cachorroId: resultado.insertId
        });

    } catch (erro) {
        console.error('Erro ao cadastrar cachorro:', erro);
        res.status(500).json({ mensagem: 'Erro interno ao cadastrar cachorro.' });
    }
};

module.exports = { listarCachorros, cadastrarCachorro };
