const pool = require('../config/db');

// Crea o recupera una sesión de chat existente
const solicitarSesion = async (req, res) => {
  const { cliente_anonimo_id, cliente_nombre, notario_id } = req.body;
  try {
    const [existente] = await pool.query(
      'SELECT * FROM chat_sesiones WHERE cliente_anonimo_id = ? AND notario_id = ? AND estado != "cerrado"',
      [cliente_anonimo_id, notario_id]
    );

    if (existente.length > 0) {
      return res.json(existente[0]);
    }

    const [resultado] = await pool.query(
      'INSERT INTO chat_sesiones (cliente_anonimo_id, cliente_nombre, notario_id, estado) VALUES (?, ?, ?, "solicitud")',
      [cliente_anonimo_id, cliente_nombre, notario_id]
    );

    res.status(201).json({ id: resultado.insertId, cliente_anonimo_id, cliente_nombre, notario_id, estado: 'solicitud' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtiene los chats activos del cliente para su Sidebar
const getSesionesCliente = async (req, res) => {
  const { clienteId } = req.query;
  try {
    const [rows] = await pool.query(
      `SELECT cs.*, no.nombre_oficial, no.notaria_numero 
       FROM chat_sesiones cs 
       JOIN notarios_oficial no ON cs.notario_id = no.id 
       WHERE cs.cliente_anonimo_id = ? AND cs.estado != 'cerrado'`,
      [clienteId]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtiene solicitudes y chats activos del notario para su Sidebar
const getSesionesNotario = async (req, res) => {
  const { notarioId } = req.params;
  try {
    const [rows] = await pool.query(
      'SELECT * FROM chat_sesiones WHERE notario_id = ? AND estado != "cerrado"',
      [notarioId]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualiza el estado ('activo') o elimina en cascada si es 'cerrado'
const actualizarEstadoSesion = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;
  try {
    if (estado === 'cerrado') {
      await pool.query('DELETE FROM chat_sesiones WHERE id = ?', [id]);
      return res.json({ message: 'Sesión purgada de la BD con éxito.' });
    }

    await pool.query('UPDATE chat_sesiones SET estado = ? WHERE id = ?', [estado, id]);
    res.json({ message: 'Estado actualizado correctamente.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Carga el reflejo de la conversación actual (Polling)
const getConversacion = async (req, res) => {
  const { notarioId, clienteId } = req.query;
  try {
    const [sesion] = await pool.query(
      'SELECT * FROM chat_sesiones WHERE notario_id = ? AND cliente_anonimo_id = ?',
      [notarioId, clienteId]
    );

    if (sesion.length === 0) {
      return res.status(404).json({ error: 'Conversación finalizada o inexistente.' });
    }

    const [mensajes] = await pool.query(
      'SELECT * FROM chat_mensajes WHERE sesion_id = ? ORDER BY enviado_en ASC',
      [sesion[0].id]
    );

    res.json({ sesion: sesion[0], mensajes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Inserta un nuevo mensaje
const enviarMensaje = async (req, res) => {
  const { sesion_id, remitente, mensaje, ruta_archivo_pdf } = req.body;
  try {
    await pool.query(
      'INSERT INTO chat_mensajes (sesion_id, remitente, mensaje, ruta_archivo_pdf) VALUES (?, ?, ?, ?)',
      [sesion_id, remitente, mensaje || null, ruta_archivo_pdf || null]
    );
    res.status(201).json({ message: 'Mensaje enviado.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  solicitarSesion,
  getSesionesCliente,
  getSesionesNotario,
  actualizarEstadoSesion,
  getConversacion,
  enviarMensaje
};