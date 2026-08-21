const multer = require('multer');

// Usamos memoryStorage para compatibilidade total com a Vercel e ambientes Serverless.
// Evita qualquer tentativa de gravação física no sistema de arquivos read-only da Vercel.
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // Limite de 5MB por arquivo
    }
});

module.exports = upload;
