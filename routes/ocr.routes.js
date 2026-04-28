const express = require('express')
const router = express.Router()
const multer = require('multer')
const ocrController = require('../controllers/ocr.controller')

const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 }
})

// =============================
// 🧠 OCR DOCUMENTOS (INE + CURP + DOMICILIO)
// =============================
router.post('/documentos',
  upload.fields([
    { name: 'ine', maxCount: 1 },
    { name: 'curp', maxCount: 1 },
    { name: 'domicilio', maxCount: 1 }
  ]),
  ocrController.procesarDocumentos
)

// =============================
// 💾 GUARDAR
// =============================
router.post('/guardar', ocrController.guardar)

module.exports = router