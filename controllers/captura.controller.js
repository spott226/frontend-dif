require('dotenv').config();
const sql = require('mssql');

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT),
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

const poolPromise = sql.connect(config)
    .then(pool => {
        console.log('✅ SQL conectado');
        return pool;
    })
    .catch(err => {
        console.log('❌ Error SQL:', err);
    });

function parseFecha(fecha) {
    if (!fecha || fecha === "") return null;
    const f = new Date(fecha);
    return isNaN(f.getTime()) ? null : f;
}

exports.guardarCaptura = async (req, res) => {
    try {

        const pool = await poolPromise;
        const d = req.body;

        console.log("📦 DATA:", d);

        if (!d.nombre) {
            return res.status(400).json({ ok: false, error: "Nombre requerido" });
        }

        const servicios_salud = [...new Set(d.servicios_salud || [])];
        const tipo_discapacidad = [...new Set(d.tipo_discapacidad || [])];
        const enfermedades = [...new Set(d.enfermedades || [])];

        // 🔥 PRINCIPAL
        const result = await pool.request()
            .input('soluciones_id', sql.NVarChar, d.soluciones_id)
            .input('tipo', sql.NVarChar, d.tipo)
            .input('folio', sql.NVarChar, d.folio)
            .input('fecha_elaboracion', sql.Date, parseFecha(d.fecha_elaboracion))
            .input('nombre', sql.NVarChar, d.nombre)
            .input('apellido_paterno', sql.NVarChar, d.apellido_paterno)
            .input('apellido_materno', sql.NVarChar, d.apellido_materno)
            .input('fecha_nacimiento', sql.Date, parseFecha(d.fecha_nacimiento))
            .input('genero', sql.NVarChar, d.field_9)
            .input('edad', sql.Int, d.Edad ? parseInt(d.Edad) : null)
            .input('curp', sql.NVarChar, d.curp)
            .input('calle', sql.NVarChar, d.calle)
            .input('no_ext', sql.NVarChar, d.no_ext)
            .input('no_int', sql.NVarChar, d.no_int)
            .input('colonia', sql.NVarChar, d.colonia)
            .input('municipio', sql.NVarChar, d.municipio)
            .input('cp', sql.NVarChar, d.cp)
            .input('localidad', sql.NVarChar, d.localidad)
            .input('telefono_movil', sql.NVarChar, d.telefono_movil)
            .input('telefono_fijo', sql.NVarChar, d.telefono_fijo)
            .input('ocupacion', sql.NVarChar, d.ocupacion)
            .input('estado_civil', sql.NVarChar, d.ec)
            .input('estado_civil_otro', sql.NVarChar, d.ecOtroTxt)
            .input('tiene_servicio_salud', sql.NVarChar, d.salud)
            .input('servicio_salud_otro', sql.NVarChar, d.salud_otro)
            .input('tiene_discapacidad', sql.NVarChar, d.disc)
            .input('discapacidad_otro', sql.NVarChar, d.disc_otro)
            .input('motivo_discapacidad', sql.NVarChar, d.motivo)
            .input('tiene_credencial', sql.NVarChar, d.cred_disc)
            .input('nivel_estudios', sql.NVarChar, d.nivel_estudios)
            .input('enfermedad_otro', sql.NVarChar, d.enf_otro)
            .input('en_tratamiento', sql.NVarChar, d.tratamiento)
            .input('familiares_enfermos', sql.NVarChar, d.fam)
            .input('origen_formulario', sql.NVarChar, d.origen_formulario)
            .input('tipo_apoyo_solicitado', sql.NVarChar, d.tipo_apoyo_solicitado)
            .input('clave_elector', sql.NVarChar, d.clave_elector)
            .input('seccion', sql.NVarChar, d.seccion)
            .input('vigencia_ine', sql.NVarChar, d.Vigencia_de_INE)
            .input('doc_identificacion', sql.NVarChar, JSON.stringify(d.doc_identificacion))
            .input('doc_domicilio', sql.NVarChar, JSON.stringify(d.doc_domicilio))
            .input('doc_curp_padre', sql.NVarChar, JSON.stringify(d.doc_curp_padre))
            .input('doc_curp_menor', sql.NVarChar, JSON.stringify(d.doc_curp_menor))
            .input('doc_formato', sql.NVarChar, JSON.stringify(d.doc_formato))
            .input('doc_privacidad', sql.NVarChar, JSON.stringify(d.doc_privacidad))
            .query(`
                INSERT INTO captura_apoyo_v2 (
                    soluciones_id, tipo, folio, fecha_elaboracion,
                    nombre, apellido_paterno, apellido_materno, fecha_nacimiento,
                    genero, edad, curp,
                    calle, no_ext, no_int, colonia, municipio, cp, localidad,
                    telefono_movil, telefono_fijo, ocupacion,
                    estado_civil, estado_civil_otro,
                    tiene_servicio_salud, servicio_salud_otro,
                    tiene_discapacidad, discapacidad_otro, motivo_discapacidad,
                    tiene_credencial,
                    nivel_estudios,
                    enfermedad_otro, en_tratamiento,
                    familiares_enfermos,
                    origen_formulario,
                    tipo_apoyo_solicitado,
                    clave_elector,
                    seccion,
                    vigencia_ine,
                    doc_identificacion,
                    doc_domicilio,
                    doc_curp_padre,
                    doc_curp_menor,
                    doc_formato,
                    doc_privacidad
                )
                OUTPUT INSERTED.id
                VALUES (
                    @soluciones_id, @tipo, @folio, @fecha_elaboracion,
                    @nombre, @apellido_paterno, @apellido_materno, @fecha_nacimiento,
                    @genero, @edad, @curp,
                    @calle, @no_ext, @no_int, @colonia, @municipio, @cp, @localidad,
                    @telefono_movil, @telefono_fijo, @ocupacion,
                    @estado_civil, @estado_civil_otro,
                    @tiene_servicio_salud, @servicio_salud_otro,
                    @tiene_discapacidad, @discapacidad_otro, @motivo_discapacidad,
                    @tiene_credencial,
                    @nivel_estudios,
                    @enfermedad_otro, @en_tratamiento,
                    @familiares_enfermos,
                    @origen_formulario,
                    @tipo_apoyo_solicitado,
                    @clave_elector,
                    @seccion,
                    @vigencia_ine,
                    @doc_identificacion,
                    @doc_domicilio,
                    @doc_curp_padre,
                    @doc_curp_menor,
                    @doc_formato,
                    @doc_privacidad
                )
            `);

        const captura_id = result.recordset[0].id;

        // 🔥 VIVIENDA (CORREGIDO A TU BD)
await pool.request()
    .input('captura_id', sql.Int, captura_id)
    .input('tipo_vivienda', sql.NVarChar, d.tipo_vivienda)
    .input('tipo_construccion', sql.NVarChar, d.vivienda) // 👈 aquí mapeas lo que antes era "vivienda"
    .input('no_pisos', sql.Int, d.no_pisos ? parseInt(d.no_pisos) : null)
    .input('cuartos', sql.Int, d.cuartos ? parseInt(d.cuartos) : null)
    .input('recamaras', sql.Int, d.recamaras ? parseInt(d.recamaras) : null)
    .input('banos', sql.Int, d.banos ? parseInt(d.banos) : null)
    .input('tiempo_viviendo', sql.NVarChar, d.tiempo_viviendo)
    .query(`
        INSERT INTO vivienda_v2 (
            captura_id,
            tipo_vivienda,
            tipo_construccion,
            no_pisos,
            cuartos,
            recamaras,
            banos,
            tiempo_viviendo
        )
        VALUES (
            @captura_id,
            @tipo_vivienda,
            @tipo_construccion,
            @no_pisos,
            @cuartos,
            @recamaras,
            @banos,
            @tiempo_viviendo
        )
    `);

        // 🔥 EGRESOS
        await pool.request()
            .input('captura_id', sql.Int, captura_id)
            .input('alimentos', sql.Decimal(10,2), d.egreso_alimentos)
            .input('vestido', sql.Decimal(10,2), d.egreso_vestido)
            .input('medicina', sql.Decimal(10,2), d.egreso_medicina)
            .input('educacion', sql.Decimal(10,2), d.egreso_educacion)
            .input('renta', sql.Decimal(10,2), d.egreso_renta)
            .input('servicios', sql.Decimal(10,2), d.egreso_servicios)
            .input('transporte', sql.Decimal(10,2), d.egreso_transporte)
            .input('esparcimiento', sql.Decimal(10,2), d.egreso_esparcimiento)
            .query(`
                INSERT INTO egresos_v2 (
                    captura_id, alimentos, vestido, medicina, educacion,
                    renta, servicios, transporte, esparcimiento
                )
                VALUES (
                    @captura_id, @alimentos, @vestido, @medicina, @educacion,
                    @renta, @servicios, @transporte, @esparcimiento
                )
            `);

        // 🔥 ALIMENTACIÓN
        await pool.request()
            .input('captura_id', sql.Int, captura_id)
            .input('c1', sql.NVarChar, d.c1)
            .input('c2', sql.NVarChar, d.c2)
            .input('c3', sql.NVarChar, d.c3)
            .input('c4', sql.NVarChar, d.c4)
            .input('c5', sql.NVarChar, d.c5)
            .input('c6', sql.NVarChar, d.c6)
            .input('c7', sql.NVarChar, d.c7)
            .input('c8', sql.NVarChar, d.c8)
            .query(`
                INSERT INTO alimentacion_v2 (
                    captura_id, carne, pollo, huevo, leche,
                    fruta, frijol, tortilla, sopa
                )
                VALUES (
                    @captura_id, @c1, @c2, @c3, @c4,
                    @c5, @c6, @c7, @c8
                )
            `);

        // 🔥 APOYOS (CORREGIDO A TU BD)
await pool.request()
    .input('captura_id', sql.Int, captura_id)
    .input('recibe', sql.NVarChar, d.apoyo) // 👈 antes recibe_apoyo
    .input('tipo', sql.NVarChar, d.tipo_apoyo) // 👈 antes tipo_apoyo
    .query(`
        INSERT INTO apoyos_v2 (
            captura_id,
            recibe,
            tipo
        )
        VALUES (
            @captura_id,
            @recibe,
            @tipo
        )
    `);

        await pool.request()
    .input('captura_id', sql.Int, captura_id)

    .input('desempleo', sql.NVarChar, d.des)
    .input('desempleo_quien', sql.NVarChar, d.des_quien)
    .input('desempleo_edad', sql.Int, d.des_edad ? parseInt(d.des_edad) : null)

    .input('escolar', sql.NVarChar, d.est)
    .input('escolar_quien', sql.NVarChar, d.est_quien)
    .input('escolar_edad', sql.Int, d.est_edad ? parseInt(d.est_edad) : null)
    .input('escolar_nivel', sql.NVarChar, d.est_nivel)

    .input('seguridad', sql.NVarChar, d.seguridad)
    .input('satisfaccion', sql.NVarChar, d.satisfaccion)

    .input('grupo', sql.NVarChar, d.grupo)
    .input('grupo_cual', sql.NVarChar, d.grupo_cual)

    .input('observaciones', sql.NVarChar, d.observaciones)

    .query(`
        INSERT INTO calidad_vida_v2 (
            captura_id,
            desempleo,
            desempleo_quien,
            desempleo_edad,
            escolar,
            escolar_quien,
            escolar_edad,
            escolar_nivel,
            seguridad,
            satisfaccion,
            grupo,
            grupo_cual,
            observaciones
        )
        VALUES (
            @captura_id,
            @desempleo,
            @desempleo_quien,
            @desempleo_edad,
            @escolar,
            @escolar_quien,
            @escolar_edad,
            @escolar_nivel,
            @seguridad,
            @satisfaccion,
            @grupo,
            @grupo_cual,
            @observaciones
        )
    `);

    if (servicios_salud.length > 0) {
    for (const servicio of servicios_salud) {
        await pool.request()
            .input('captura_id', sql.Int, captura_id)
            .input('servicio', sql.NVarChar, servicio)
            .query(`
                INSERT INTO servicios_salud_v2 (captura_id, servicio)
                VALUES (@captura_id, @servicio)
            `);
    }
}

if (enfermedades.length > 0) {
    for (const enf of enfermedades) {
        await pool.request()
            .input('captura_id', sql.Int, captura_id)
            .input('enfermedad', sql.NVarChar, enf)
            .query(`
                INSERT INTO enfermedades_v2 (captura_id, enfermedad)
                VALUES (@captura_id, @enfermedad)
            `);
    }
}

if (tipo_discapacidad.length > 0) {
    for (const disc of tipo_discapacidad) {
        await pool.request()
            .input('captura_id', sql.Int, captura_id)
            .input('tipo', sql.NVarChar, disc)
            .query(`
                INSERT INTO discapacidad_v2 (captura_id, tipo)
                VALUES (@captura_id, @tipo)
            `);
    }
}

for (let i = 1; i <= 5; i++) {

    if (d[`fam_nombre_${i}`]) {

        await pool.request()
            .input('captura_id', sql.Int, captura_id)
            .input('nombre', sql.NVarChar, d[`fam_nombre_${i}`])
            .input('edad', sql.Int, d[`fam_edad_${i}`] ? parseInt(d[`fam_edad_${i}`]) : null)
            .input('parentesco', sql.NVarChar, d[`fam_parentesco_${i}`])
            .input('codigo', sql.NVarChar, d[`fam_codigo_${i}`])
            .query(`
                INSERT INTO familiares_v2 (
                    captura_id, nombre, edad, parentesco, codigo
                )
                VALUES (
                    @captura_id, @nombre, @edad, @parentesco, @codigo
                )
            `);
    }
}

if (d.tipo_violencia && d.tipo_violencia.length > 0) {
    for (const v of d.tipo_violencia) {
        await pool.request()
            .input('captura_id', sql.Int, captura_id)
            .input('tipo', sql.NVarChar, v)
            .query(`
                INSERT INTO violencia_v2 (captura_id, tipo)
                VALUES (@captura_id, @tipo)
            `);
    }
}

if (d.tipo_adiccion && d.tipo_adiccion.length > 0) {
    for (const a of d.tipo_adiccion) {
        await pool.request()
            .input('captura_id', sql.Int, captura_id)
            .input('tipo', sql.NVarChar, a)
            .input('quien', sql.NVarChar, d.adic_quien)
            .input('edad', sql.Int, d.adic_edad ? parseInt(d.adic_edad) : null)
            .query(`
                INSERT INTO adicciones_v2 (captura_id, tipo, quien, edad)
                VALUES (@captura_id, @tipo, @quien, @edad)
            `);
    }
}

for (let i = 1; i <= 5; i++) {

    if (d[`apoyo_solicitado_${i}`]) {

        await pool.request()
            .input('captura_id', sql.Int, captura_id)
            .input('apoyo', sql.NVarChar, d[`apoyo_solicitado_${i}`])
            .input('dependencia', sql.NVarChar, d[`dependencia_${i}`])
            .query(`
                INSERT INTO apoyos_solicitados_v2 (
                    captura_id, apoyo, dependencia
                )
                VALUES (
                    @captura_id, @apoyo, @dependencia
                )
            `);
    }
}

// ==============================
// 🔥 SERVICIOS VIVIENDA
// ==============================
await pool.request()
    .input('captura_id', sql.Int, captura_id)
    .input('agua', sql.NVarChar, d.agua)
    .input('drenaje', sql.NVarChar, d.drenaje)
    .input('luz', sql.NVarChar, d.luz)
    .input('basura', sql.NVarChar, d.basura)
    .query(`
        INSERT INTO servicios_vivienda_v2 (
            captura_id, agua, drenaje, luz, basura
        )
        VALUES (
            @captura_id, @agua, @drenaje, @luz, @basura
        )
    `);

// ==============================
// SERVICIOS DETALLE
// ==============================
if (d.agua_detalle && d.agua_detalle.length > 0) {
    for (const a of d.agua_detalle) {
        await pool.request()
            .input('captura_id', sql.Int, captura_id)
            .input('tipo', sql.NVarChar, `agua_${a}`)
            .query(`
                INSERT INTO servicios_detalle_v2 (captura_id, tipo)
                VALUES (@captura_id, @tipo)
            `);
    }
}

if (d.drenaje_detalle && d.drenaje_detalle.length > 0) {
    for (const dr of d.drenaje_detalle) {
        await pool.request()
            .input('captura_id', sql.Int, captura_id)
            .input('tipo', sql.NVarChar, `drenaje_${dr}`)
            .query(`
                INSERT INTO servicios_detalle_v2 (captura_id, tipo)
                VALUES (@captura_id, @tipo)
            `);
    }
}

if (d.basura_detalle && d.basura_detalle.length > 0) {
    for (const b of d.basura_detalle) {
        await pool.request()
            .input('captura_id', sql.Int, captura_id)
            .input('tipo', sql.NVarChar, `basura_${b}`)
            .query(`
                INSERT INTO servicios_detalle_v2 (captura_id, tipo)
                VALUES (@captura_id, @tipo)
            `);
    }
}

// ==============================
// 🔥 CONDICIONES VIVIENDA (BD usa "suelo")
// ==============================
await pool.request()
    .input('captura_id', sql.Int, captura_id)
    .input('suelo', sql.NVarChar, d.piso) // 👈 mapeo correcto
    .input('techo', sql.NVarChar, d.techo)
    .query(`
        INSERT INTO condiciones_vivienda_v2 (
            captura_id, suelo, techo
        )
        VALUES (
            @captura_id, @suelo, @techo
        )
    `);

// ==============================
// TICS (CORRECTO)
// ==============================

if (d.tics && d.tics.length > 0) {

    for (const t of d.tics) {

        await pool.request()
            .input('captura_id', sql.Int, captura_id)
            .input('tipo', sql.NVarChar, t)
            .query(`
                INSERT INTO tics_v2 (captura_id, tipo)
                VALUES (@captura_id, @tipo)
            `);
    }
}

// ==============================
// BIENES
// ==============================
if (d.bienes && d.bienes.length > 0) {
    for (const b of d.bienes) {
        await pool.request()
            .input('captura_id', sql.Int, captura_id)
            .input('tipo', sql.NVarChar, b)
            .query(`
                INSERT INTO bienes_v2 (captura_id, tipo)
                VALUES (@captura_id, @tipo)
            `);
    }
}
        res.json({ ok: true });

    } catch (err) {
        console.log("🔥 ERROR:", err);
        res.status(500).json({ ok: false, error: err.message });
    }
};

exports.obtenerCaptura = async (req, res) => {
    try {

        const pool = await poolPromise;
        const id = parseInt(req.params.id);

        if (!id) {
            return res.status(400).json({ error: "ID inválido" });
        }

        const get = async (query) => {
            const r = await pool.request()
                .input('id', sql.Int, id)
                .query(query);
            return r.recordset;
        };

        res.json({
            general: (await get(`SELECT * FROM captura_apoyo_v2 WHERE id = @id`))[0] || {},
            vivienda: (await get(`SELECT * FROM vivienda_v2 WHERE captura_id = @id`))[0] || {},
            servicios: (await get(`SELECT * FROM servicios_vivienda_v2 WHERE captura_id = @id`))[0] || {},
            detalle: await get(`SELECT * FROM servicios_detalle_v2 WHERE captura_id = @id`),
            tics: await get(`SELECT * FROM tics_v2 WHERE captura_id = @id`),
            bienes: await get(`SELECT * FROM bienes_v2 WHERE captura_id = @id`),

            egresos: (await get(`SELECT * FROM egresos_v2 WHERE captura_id = @id`))[0] || {},
            alimentacion: (await get(`SELECT * FROM alimentacion_v2 WHERE captura_id = @id`))[0] || {},
            apoyos: (await get(`SELECT * FROM apoyos_v2 WHERE captura_id = @id`))[0] || {},
            calidad: (await get(`SELECT * FROM calidad_vida_v2 WHERE captura_id = @id`))[0] || {},

            salud: await get(`SELECT * FROM servicios_salud_v2 WHERE captura_id = @id`),
            enfermedades: await get(`SELECT * FROM enfermedades_v2 WHERE captura_id = @id`),
            discapacidad: await get(`SELECT * FROM discapacidad_v2 WHERE captura_id = @id`),

            familiares: await get(`SELECT * FROM familiares_v2 WHERE captura_id = @id`),
            violencia: await get(`SELECT * FROM violencia_v2 WHERE captura_id = @id`),
            adicciones: await get(`SELECT * FROM adicciones_v2 WHERE captura_id = @id`),
            apoyos_solicitados: await get(`SELECT * FROM apoyos_solicitados_v2 WHERE captura_id = @id`),

            condiciones: (await get(`SELECT * FROM condiciones_vivienda_v2 WHERE captura_id = @id`))[0] || {}
        });

    } catch (err) {
        console.log("🔥 ERROR DETALLE:", err);
        res.status(500).json({ error: err.message });
    }
};