const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Garante que a pasta uploads/ exista na raiz do projeto
const pastaUploads = path.join(__dirname, '../../../uploads');
if (!fs.existsSync(pastaUploads)) {
    fs.mkdirSync(pastaUploads, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, pastaUploads);
    },
    filename: (req, file, cb) => {
        const nomeUnico = Date.now() + path.extname(file.originalname);
        cb(null, nomeUnico);
    }
});

module.exports = multer({ storage });
