const express = require('express');
const router = express.Router();
const sql = require('mssql');
require('dotenv').config();

// 🔥 IMPORTAR AMBOS
const { guardarCaptura, obtenerCaptura } = require('../controllers/captura.controller');

// ==============================
// 🔥 CONFIG SQL
// ==============================
const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

// ==============================
// 🔌 POOL GLOBAL
// ==============================
let pool;
async function getPool() {
    if (!pool) {
        pool = await sql.connect(config);
        console.log('✅ Pool SQL listo');
    }
    return pool;
}

// ==============================
// 📌 GUARDAR CAPTURA
// ==============================
router.post('/captura', guardarCaptura);

// ==============================
// 🔍 DETALLE COMPLETO (NUEVO)
// ==============================
router.get('/captura/:id', obtenerCaptura);

// ==============================
// 🔍 BUSCAR
// ==============================
router.get('/buscar', async (req, res) => {
    try {
        const pool = await getPool();

        const q = (req.query.q || '').trim();
        const id = parseInt(q);

        let result;

        if (!isNaN(id)) {
            result = await pool.request()
                .input('id', sql.Int, id)
                .query(`
                    SELECT id, nombre, curp, folio, fecha_elaboracion
                    FROM captura_apoyo_v2
                    WHERE id = @id
                `);
        } else {
            result = await pool.request()
                .input('q', sql.NVarChar, `%${q}%`)
                .query(`
                    SELECT id, nombre, curp, folio, fecha_elaboracion
                    FROM captura_apoyo_v2
                    WHERE nombre LIKE @q
                       OR folio LIKE @q
                       OR soluciones_id LIKE @q
                    ORDER BY id DESC
                `);
        }

        res.json(result.recordset);

    } catch (err) {
        console.log('❌ ERROR BUSCAR:', err);
        res.status(500).json({ error: 'error buscar' });
    }
});

// ==============================
// 📄 EXPORTAR XML
// ==============================
router.get('/exportar-xml', async (req, res) => {
    try {
        const pool = await getPool();
        const id = parseInt(req.query.id);

        let capturas;

        if (!isNaN(id)) {
            capturas = await pool.request()
                .input('id', sql.Int, id)
                .query(`SELECT * FROM captura_apoyo_v2 WHERE id = @id`);
        } else {
            capturas = await pool.request()
                .query(`SELECT * FROM captura_apoyo_v2`);
        }

        const esc = (v) => (v ?? '').toString()
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<beneficiarios>`;

        for (const c of capturas.recordset) {

            const discapacidad_v2 = await pool.request()
                .input('id', sql.Int, c.id)
                .query(`SELECT TOP 1 * FROM discapacidad_v2 WHERE captura_id = @id`);

            const condiciones_vivienda_v2 = await pool.request()
                .input('id', sql.Int, c.id)
                .query(`SELECT TOP 1 * FROM condiciones_vivienda_v2 WHERE captura_id = @id`);

            const calidad_vida_v2 = await pool.request()
                .input('id', sql.Int, c.id)
                .query(`SELECT TOP 1 * FROM calidad_vida_v2 WHERE captura_id = @id`);

            const apoyos_v2 = await pool.request()
                .input('id', sql.Int, c.id)
                .query(`SELECT TOP 1 * FROM apoyos_v2 WHERE captura_id = @id`);

            const apoyos_solicitados = await pool.request()
                .input('id', sql.Int, c.id)
                .query(`SELECT TOP 1 * FROM apoyos_solicitados_v2 WHERE captura_id = @id`);

            const adicicones = await pool.request()
                .input('id', sql.Int, c.id)
                .query(`SELECT TOP 1 * FROM adicciones_v2 WHERE captura_id = @id`);

            const vivienda = await pool.request()
                .input('id', sql.Int, c.id)
                .query(`SELECT TOP 1 * FROM vivienda_v2 WHERE captura_id = @id`);

            const servicios = await pool.request()
                .input('id', sql.Int, c.id)
                .query(`SELECT TOP 1 * FROM servicios_vivienda_v2 WHERE captura_id = @id`);

            const detalle = await pool.request()
                .input('id', sql.Int, c.id)
                .query(`SELECT * FROM servicios_detalle_v2 WHERE captura_id = @id`);

            const tics = await pool.request()
                .input('id', sql.Int, c.id)
                .query(`SELECT * FROM tics_v2 WHERE captura_id = @id`);

            const bienes = await pool.request()
                .input('id', sql.Int, c.id)
                .query(`SELECT * FROM bienes_v2 WHERE captura_id = @id`);

            const v = vivienda.recordset[0] || {};
            const s = servicios.recordset[0] || {};

            xml += `
<beneficiario>
    <id>${c.id}</id>
    <nombre>${esc(c.nombre)}</nombre>
    <curp>${esc(c.curp)}</curp>
    <folio>${esc(c.folio)}</folio>

    <vivienda>
        <tipo>${esc(v.tipo_vivienda)}</tipo>
        <cuartos>${esc(v.cuartos)}</cuartos>
    </vivienda>

    <servicios>
        <agua>${esc(s.agua)}</agua>
        <luz>${esc(s.luz)}</luz>
        <drenaje>${esc(s.drenaje)}</drenaje>
    </servicios>

    <detalle_servicios>
        ${detalle.recordset.map(d => `<item>${esc(d.tipo)}</item>`).join('')}
    </detalle_servicios>

    <tics>
        ${tics.recordset.map(t => `<item>${esc(t.tipo)}</item>`).join('')} 
    </tics>

    <bienes>
        ${bienes.recordset.map(b => `<item>${esc(b.tipo)}</item>`).join('')}
    </bienes>

</beneficiario>`;
        }

        xml += `\n</beneficiarios>`;

        res.set('Content-Type', 'application/xml');
        res.send(xml);

    } catch (err) {
        console.log('❌ ERROR XML:', err);
        res.status(500).send('error xml');
    }
});

module.exports = router;