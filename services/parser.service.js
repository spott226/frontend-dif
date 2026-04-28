// =============================
// 🔹 NORMALIZAR COORDENADAS
// =============================
function normalizar(p, width, height) {
  return {
    x: p.x / width,
    y: p.y / height,
    text: p.text,
    isCheck: p.isCheck
  }
}

function dentro(p, z) {
  return p.x >= z.x1 && p.x <= z.x2 && p.y >= z.y1 && p.y <= z.y2
}

function textoZona(palabras, zona) {
  return palabras
    .filter(p => dentro(p, zona))
    .map(p => p.text)
    .join(" ")
}

function checkZona(palabras, zona) {
  return palabras.some(p => p.isCheck && dentro(p, zona))
}

// =============================
// 🔹 ZONAS NORMALIZADAS (0–1)
// =============================

// 📄 HOJA 1
const H1 = {
  nombre: { x1: 0.1, y1: 0.25, x2: 0.6, y2: 0.32 },
  curp:   { x1: 0.45, y1: 0.55, x2: 0.9, y2: 0.62 },

  estadoCivil: {
    soltero: { x1: 0.05, y1: 0.55, x2: 0.15, y2: 0.60 },
    casado:  { x1: 0.15, y1: 0.55, x2: 0.25, y2: 0.60 },
    union:   { x1: 0.25, y1: 0.55, x2: 0.40, y2: 0.60 }
  },

  nivel: {
    bachillerato: { x1: 0.45, y1: 0.55, x2: 0.65, y2: 0.65 }
  },

  salud: {
    imss: { x1: 0.05, y1: 0.65, x2: 0.20, y2: 0.75 }
  }
}

// 📄 HOJA 2
const H2 = {
  ingresos: {
    menos5000: { x1: 0.45, y1: 0.65, x2: 0.65, y2: 0.72 }
  },

  proveedor: {
    madre: { x1: 0.45, y1: 0.75, x2: 0.70, y2: 0.82 }
  }
}

// 📄 HOJA 3
const H3 = {
  violencia: { x1: 0.55, y1: 0.15, x2: 0.70, y2: 0.25 },
  adicciones:{ x1: 0.55, y1: 0.25, x2: 0.70, y2: 0.35 },
  desempleo: { x1: 0.55, y1: 0.35, x2: 0.70, y2: 0.45 }
}

// =============================
// 🔹 PARSER HOJA 1
// =============================
function parseHoja1(palabras, cleanText) {

  const data = {}

  const nombre = textoZona(palabras, H1.nombre).split(" ")

  data.nombre = nombre[0] || ""
  data.apellidoPaterno = nombre[1] || ""
  data.apellidoMaterno = nombre[2] || ""

  data.curp = cleanText.match(/[A-Z]{4}\d{6}[A-Z]{6}\d{2}/)?.[0] || ""

  // estado civil
  if (checkZona(palabras, H1.estadoCivil.soltero)) data.estadoCivil = "SOLTERO"
  if (checkZona(palabras, H1.estadoCivil.casado)) data.estadoCivil = "CASADO"
  if (checkZona(palabras, H1.estadoCivil.union)) data.estadoCivil = "UNION"

  // nivel
  if (checkZona(palabras, H1.nivel.bachillerato)) data.nivel = "BACHILLERATO"

  // salud
  data.imss = checkZona(palabras, H1.salud.imss)

  return data
}

// =============================
// 🔹 PARSER HOJA 2
// =============================
function parseHoja2(palabras, cleanText) {

  const data = {}

  if (checkZona(palabras, H2.ingresos.menos5000)) {
    data.ingresos = "MENOS_5000"
  }

  if (checkZona(palabras, H2.proveedor.madre)) {
    data.proveedor = "MADRE"
  }

  return data
}

// =============================
// 🔹 PARSER HOJA 3
// =============================
function parseHoja3(palabras, cleanText) {

  const data = {}

  data.violencia = checkZona(palabras, H3.violencia) ? "SI" : "NO"
  data.adicciones = checkZona(palabras, H3.adicciones) ? "SI" : "NO"
  data.desempleo = checkZona(palabras, H3.desempleo) ? "SI" : "NO"

  const obs = cleanText.match(/OBSERVACIONES\s+([A-Z]+)/)
  data.observaciones = obs?.[1] || ""

  return data
}

// =============================
// 🔹 PARSER PRINCIPAL
// =============================
const parsearDIF = (ocrData, hoja) => {

  const { palabras = [], cleanText = "", width = 2500, height = 3500 } = ocrData

  const normalizadas = palabras.map(p => normalizar(p, width, height))

  if (hoja === 1) return parseHoja1(normalizadas, cleanText)
  if (hoja === 2) return parseHoja2(normalizadas, cleanText)
  if (hoja === 3) return parseHoja3(normalizadas, cleanText)

  return {}
}

module.exports = {
  parsearDIF
}