const multer = require('multer');

// Usamos memoryStorage para compatibilidade total com Vercel / Serverless e ambiente local.
// Evita erros de leitura/escrita no sistema de arquivos read-only da Vercel.
const storage = multer.memoryStorage();

const instance = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});

const processarSingle = (fieldName) => {
    return (req, res, next) => {
        instance.single(fieldName)(req, res, (err) => {
            if (err) {
                console.error(`[uploadMiddleware] Erro ao processar upload do campo '${fieldName}':`, err.message);
            }
            next();
        });
    };
};

module.exports = {
    single: processarSingle,
    instance
};
