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
        const { nome, raca, sexo, data_nascimento, foto, foto_url } = req.body || {};

        if (!nome || !raca || !sexo || !data_nascimento) {
            return res.status(400).json({ mensagem: 'Nome, raça, sexo e data de nascimento são obrigatórios.' });
        }

        // Aceita URL em formato de texto enviada no corpo da requisição (foto ou foto_url)
        let fotoUrl = (foto && typeof foto === 'string' && foto.trim()) || 
                      (foto_url && typeof foto_url === 'string' && foto_url.trim()) || 
                      null;

        // Se um arquivo foi enviado via upload (Multer em memória)
        if (req.file && req.file.buffer) {
            const mime = req.file.mimetype || 'image/jpeg';
            fotoUrl = `data:${mime};base64,${req.file.buffer.toString('base64')}`;
        }

        const sql = 'INSERT INTO Cachorro (nome, raca, sexo, data_nascimento, usuario_id, foto) VALUES (?, ?, ?, ?, ?, ?)';
        const [resultado] = await pool.execute(sql, [nome, raca, sexo, data_nascimento, usuario_id, fotoUrl]);

        res.status(201).json({
            mensagem: 'Cachorro cadastrado com sucesso!',
            cachorroId: resultado.insertId,
            foto: fotoUrl
        });

    } catch (erro) {
        console.error('Erro ao cadastrar cachorro:', erro);
        res.status(500).json({ mensagem: 'Erro interno ao cadastrar cachorro.' });
    }
};

const atualizarCachorro = async (req, res) => {
    try {
        const { id } = req.params;
        const usuario_id = req.usuario.id;
        const { nome, raca, sexo, data_nascimento, foto, foto_url } = req.body || {};

        let fotoUrl = (foto && typeof foto === 'string' && foto.trim()) || 
                      (foto_url && typeof foto_url === 'string' && foto_url.trim()) || 
                      null;

        if (req.file && req.file.buffer) {
            const mime = req.file.mimetype || 'image/jpeg';
            fotoUrl = `data:${mime};base64,${req.file.buffer.toString('base64')}`;
        }

        let sql, params;

        if (fotoUrl !== null) {
            // Nova foto fornecida (URL texto ou Base64 de upload em memória)
            sql = 'UPDATE Cachorro SET nome = ?, raca = ?, sexo = ?, data_nascimento = ?, foto = ? WHERE id = ? AND usuario_id = ?';
            params = [nome, raca, sexo, data_nascimento, fotoUrl, id, usuario_id];
        } else {
            // Preserva a foto atual no banco
            sql = 'UPDATE Cachorro SET nome = ?, raca = ?, sexo = ?, data_nascimento = ? WHERE id = ? AND usuario_id = ?';
            params = [nome, raca, sexo, data_nascimento, id, usuario_id];
        }

        await pool.execute(sql, params);

        res.status(200).json({ mensagem: 'Cachorro atualizado com sucesso!' });

    } catch (erro) {
        console.error('Erro ao atualizar cachorro:', erro);
        res.status(500).json({ mensagem: 'Erro interno ao atualizar cachorro.' });
    }
};

const excluirCachorro = async (req, res) => {
    try {
        const { id } = req.params;
        const usuario_id = req.usuario.id;

        await pool.execute(
            'DELETE FROM Cachorro WHERE id = ? AND usuario_id = ?',
            [id, usuario_id]
        );

        res.status(200).json({ mensagem: 'Cachorro excluído com sucesso!' });

    } catch (erro) {
        console.error('Erro ao excluir cachorro:', erro);
        res.status(500).json({ mensagem: 'Erro interno ao excluir cachorro.' });
    }
};

module.exports = { listarCachorros, cadastrarCachorro, atualizarCachorro, excluirCachorro };
