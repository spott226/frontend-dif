const fs = require('fs')
const sharp = require('sharp')

const { extraerTexto } = require('../services/vision.service')
const { parsearDIF } = require('../services/parser.service')

// =============================
// 🧹 PROCESAR IMAGEN
// =============================
const procesarImagen = async (input, output) => {
  await sharp(input)
    .rotate()
    .resize({ width: 2500 }) // 🔥 clave para coordenadas
    .grayscale()
    .normalize()
    .sharpen()
    .toFile(output)
}

// =============================
// 🚀 OCR FORMULARIOS (FLUJO ANTERIOR)
// =============================
const procesarOCR = async (req, res) => {

  let archivos = []

  try {

    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No se recibieron imágenes'
      })
    }

    const hojasInput = [
      { key: 'hoja1', num: 1 },
      { key: 'hoja2', num: 2 },
      { key: 'hoja3', num: 3 }
    ]

    let resultadoFinal = {
      hoja1: null,
      hoja2: null,
      hoja3: null
    }

    for (const h of hojasInput) {

      if (!req.files[h.key]) continue

      const file = req.files[h.key][0]

      const original = file.path
      const procesado = original + "_p.jpg"

      await procesarImagen(original, procesado)

      const ocrData = await extraerTexto(procesado)

      console.log(`📄 HOJA ${h.num}:`)
      console.log(ocrData.cleanText.substring(0, 200))

      const datos = parsearDIF(ocrData, h.num)

      resultadoFinal[h.key] = datos

      archivos.push(original)
      archivos.push(procesado)
    }

    return res.json({
      success: true,
      data: resultadoFinal
    })

  } catch (err) {

    console.error("❌ ERROR OCR:", err)

    return res.status(500).json({
      success: false,
      error: err.message
    })

  } finally {

    archivos.forEach(f => {
      if (fs.existsSync(f)) fs.unlink(f, () => {})
    })
  }
}

// =============================
// 🪪 OCR DOCUMENTOS (FLUJO NUEVO)
// =============================
const procesarDocumentos = async (req, res) => {

  let archivos = []

  try {

    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No se recibieron documentos'
      })
    }

    const resultado = {
      nombre: "",
      paterno: "",
      materno: "",
      curp: "",
      fecha_nacimiento: "",
      sexo: "",
      direccion: "",
      colonia: "",
      municipio: ""
    }

    // =============================
    // 🪪 INE
    // =============================
    if (req.files.ine) {

      const file = req.files.ine[0]
      const original = file.path
      const procesado = original + "_p.jpg"

      await procesarImagen(original, procesado)

      const ocrData = await extraerTexto(procesado)

      console.log("🪪 INE OCR:")
      console.log(ocrData.cleanText.substring(0, 200))

      const datosINE = parsearDIF(ocrData, 'INE')

      Object.assign(resultado, datosINE)

      archivos.push(original, procesado)
    }

    // =============================
    // 🧾 CURP
    // =============================
    if (req.files.curp) {

      const file = req.files.curp[0]
      const original = file.path
      const procesado = original + "_p.jpg"

      await procesarImagen(original, procesado)

      const ocrData = await extraerTexto(procesado)

      console.log("🧾 CURP OCR:")
      console.log(ocrData.cleanText.substring(0, 200))

      const datosCURP = parsearDIF(ocrData, 'CURP')

      Object.assign(resultado, datosCURP)

      archivos.push(original, procesado)
    }

    // =============================
    // 🏠 COMPROBANTE DOMICILIO
    // =============================
    if (req.files.domicilio) {

      const file = req.files.domicilio[0]
      const original = file.path
      const procesado = original + "_p.jpg"

      await procesarImagen(original, procesado)

      const ocrData = await extraerTexto(procesado)

      console.log("🏠 DOMICILIO OCR:")
      console.log(ocrData.cleanText.substring(0, 200))

      const datosDOM = parsearDIF(ocrData, 'DOM')

      Object.assign(resultado, datosDOM)

      archivos.push(original, procesado)
    }

    return res.json({
      success: true,
      data: resultado
    })

  } catch (err) {

    console.error("❌ ERROR DOCUMENTOS:", err)

    return res.status(500).json({
      success: false,
      error: err.message
    })

  } finally {

    archivos.forEach(f => {
      if (fs.existsSync(f)) fs.unlink(f, () => {})
    })
  }
}

// =============================
// 💾 GUARDAR
// =============================
const guardar = async (req, res) => {
  console.log("💾 DATA:", req.body)
  res.json({ success: true })
}

module.exports = {
  procesarOCR,
  procesarDocumentos,
  guardar
}