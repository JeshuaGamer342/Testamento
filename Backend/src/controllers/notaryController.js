const pool = require('../config/db');

const getRecommendedNotaries = async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
        no.id,
        no.nombre_oficial AS nombreOficial,
        no.notaria_numero AS notariaNumero,
        no.contacto_email AS contactoEmail,
        no.ubicacion,
        CASE
          WHEN na.pago_expira_el IS NOT NULL AND DATE(na.pago_expira_el) >= CURDATE() THEN 1
          ELSE 0
        END AS membresiaActiva
      FROM notarios_oficial no
      LEFT JOIN notarios_acceso na ON na.notario_id = no.id
      ORDER BY membresiaActiva DESC, no.creado_en DESC`
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
};
