const pool = require('../config/db');

const registerNotary = async (req, res, next) => {
  const { 
    nombre_input, 
    notaria_numero, 
    cedula_profesional, 
    ubicacion, 
    contacto_email 
  } = req.body;

  // 1. Validación estricta de campos vacíos en el servidor
  if (!nombre_input || !notaria_numero || !cedula_profesional || !ubicacion || !contacto_email) {
    return res.status(400).json({
      message: 'Todos los campos son obligatorios para el registro oficial.',
    });
  }

  // 2. Control físico de números de notaría inválidos o negativos
  if (parseInt(notaria_numero, 10) <= 0) {
    return res.status(400).json({
      message: 'El número de notaría debe ser un número entero positivo.',
    });
  }

  try {
    // 3. CONTROL DE DUPLICADOS: Evitar registros duplicados en base de datos
    const [existing] = await pool.query(
      'SELECT id FROM notarios_oficial WHERE cedula_profesional = ? OR contacto_email = ?',
      [cedula_profesional.trim(), contacto_email.trim()]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        message: 'Esta cédula profesional o correo electrónico ya se encuentran registrados.',
      });
    }

    // =================================================================
    // 🔴 BARRERA DE VALIDACIÓN REAL ANTE LA API DE LA SEP (APIMARKET)
    // =================================================================
    const apiKey = process.env.APIMARKET_API_KEY || process.env.SEP_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        message: 'La clave APIMARKET_API_KEY no está configurada en el servidor.',
      });
    }

    const sepApiUrl = process.env.SEP_API_URL || 'https://apimarket.mx/api/sep/grupo/validar-cedula';
    const timeoutMs = Number(process.env.SEP_TIMEOUT_MS) || 15000;

    const abortController = new AbortController();
    const timeoutHandle = setTimeout(() => abortController.abort(), timeoutMs);

    let response;
    try {
      response = await fetch(sepApiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          cedula: cedula_profesional.trim()
        }),
        signal: abortController.signal,
      });
    } finally {
      clearTimeout(timeoutHandle);
    }

    // Si la respuesta HTTP de APIMarket no es exitosa, bloqueamos el registro
    if (!response.ok) {
      const errPayload = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        message: errPayload?.message || 'No fue posible validar la cédula en la SEP.',
        details: errPayload,
      });
    }

    const payload = await response.json().catch(() => null);

    // FILTRO DE ABOGADO: Validamos título
    const records = Array.isArray(payload?.data) ? payload.data : [];
    const hasLawTitle = records.some((record) => {
      if (typeof record?.titulo !== 'string') return false;
      return record.titulo.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().includes('DERECHO');
    });

    if (!hasLawTitle) {
      return res.status(422).json({
        message: 'La cédula ingresada no corresponde a un título profesional en Derecho.',
        details: payload,
      });
    }

    // =================================================================
    // ✨ INSERCIÓN DIRECTA EN BASE DE DATOS
    // =================================================================
    const query = `
      INSERT INTO notarios_oficial 
      (nombre_oficial, notaria_numero, cedula_profesional, ubicacion, contacto_email) 
      VALUES (?, ?, ?, ?, ?)
    `;
    
    const [result] = await pool.query(query, [
      nombre_input.trim(), 
      parseInt(notaria_numero, 10), 
      cedula_profesional.trim(), 
      ubicacion.trim(), 
      contacto_email.trim()
    ]);

   
    return res.status(200).json({
      message: 'Cédula validada y notario guardado con éxito en el sistema.',
      notaryId: result.insertId,
      nombreOficial: nombre_input
    });

  } catch (error) {
    if (error?.name === 'AbortError') {
      return res.status(504).json({
        message: 'La validación de la cédula ante la SEP excedió el tiempo de espera límite.',
      });
    }
    console.error('Error crítico en el controlador de registros:', error);
    return res.status(500).json({
      message: 'Error interno al procesar el registro del notario.',
      error: error.message,
    });
  }
};

const getRecommendedNotaries = async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
        id,
        nombre_oficial AS nombreOficial,
        notaria_numero AS notariaNumero,
        contacto_email AS contactoEmail,
        ubicacion
      FROM notarios_oficial
      ORDER BY creado_en DESC`
    );

    return res.status(200).json({
      data: rows,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'No fue posible cargar el directorio de notarios.',
      error: error.message,
    });
  }
};

module.exports = {
  getRecommendedNotaries,
  registerNotary
};