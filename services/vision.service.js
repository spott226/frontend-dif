const vision = require('@google-cloud/vision')

const client = new vision.ImageAnnotatorClient({
  keyFilename: process.env.GOOGLE_KEY
})

/**
 * Normaliza texto para evitar errores OCR
 */
function limpiarTexto(texto = "") {
  return texto
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

/**
 * Detecta si un símbolo puede ser un "check"
 */
function esCheck(texto = "") {
  const t = texto.trim()
  return ["X", "x", "✔", "✓", "•", ".", "*"].includes(t)
}

/**
 * Extrae palabras con coordenadas
 */
function mapearAnotaciones(textAnnotations = []) {
  // El índice 0 es todo el texto completo → lo ignoramos
  return textAnnotations.slice(1).map(a => {
    const v = a.boundingPoly.vertices

    return {
      text: a.description,
      clean: limpiarTexto(a.description),
      isCheck: esCheck(a.description),

      // Coordenadas base (top-left)
      x: v[0]?.x || 0,
      y: v[0]?.y || 0,

      // Bounding box completo
      box: v
    }
  })
}

/**
 * Servicio principal OCR
 */
exports.extraerTexto = async (filePath) => {
  try {
    const [result] = await client.textDetection(filePath)

    const fullText = result.fullTextAnnotation?.text || ""
    const textAnnotations = result.textAnnotations || []

    const palabras = mapearAnotaciones(textAnnotations)

    return {
      raw: fullText,
      cleanText: limpiarTexto(fullText),

      palabras, // 🔥 CLAVE: aquí vienen coordenadas
      totalPalabras: palabras.length
    }

  } catch (error) {
    console.error("❌ Error OCR:", error)
    throw new Error("Error procesando OCR")
  }
}