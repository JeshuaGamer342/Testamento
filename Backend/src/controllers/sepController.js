const DEFAULT_SEP_API_URL = 'https://apimarket.mx/api/sep/grupo/validar-cedula';
const DEFAULT_SEP_TIMEOUT_MS = 15000;

function normalizeText(value) {
  if (typeof value !== 'string') {
    return '';
  }

  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();
}

function hasLawTitle(payload) {
  const records = Array.isArray(payload?.data) ? payload.data : [];

  return records.some((record) => {
    const title = normalizeText(record?.titulo);
    return title.includes('DERECHO');
  });
}

function getCedulaFromRequest(req) {
  const queryCedula = req.query?.cedula;

  if (typeof queryCedula === 'string' && queryCedula.trim()) {
    return queryCedula.trim();
  }

  const bodyCedula = req.body?.cedula;

  if (typeof bodyCedula === 'number' && Number.isFinite(bodyCedula)) {
    return String(Math.trunc(bodyCedula));
  }

  if (typeof bodyCedula === 'string' && bodyCedula.trim()) {
    return bodyCedula.trim();
  }

  return '';
}

function isCedulaValid(cedula) {
  return /^\d+$/.test(cedula) && cedula.length <= 20;
}

async function validateCedula(req, res, next) {
  try {
    const apiKey = process.env.APIMARKET_API_KEY || process.env.SEP_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        message: 'La clave APIMARKET_API_KEY no esta configurada en el servidor.',
      });
    }

    const cedula = getCedulaFromRequest(req);

    if (!cedula) {
      return res.status(400).json({
        message: 'El parametro cedula es obligatorio.',
      });
    }

    if (!isCedulaValid(cedula)) {
      return res.status(400).json({
        message: 'El parametro cedula debe contener solo digitos.',
      });
    }

    const sepApiUrl = process.env.SEP_API_URL || DEFAULT_SEP_API_URL;
    const timeoutMs = Number(process.env.SEP_TIMEOUT_MS) || DEFAULT_SEP_TIMEOUT_MS;

    const requestUrl = new URL(sepApiUrl);
    requestUrl.searchParams.set('cedula', cedula);

    const abortController = new AbortController();
    const timeoutHandle = setTimeout(() => abortController.abort(), timeoutMs);

    let response;

    try {
      response = await fetch(requestUrl.toString(), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: 'application/json',
        },
        signal: abortController.signal,
      });
    } finally {
      clearTimeout(timeoutHandle);
    }

    const contentType = response.headers.get('content-type') || '';
    let payload = null;

    if (contentType.includes('application/json')) {
      payload = await response.json();
    } else {
      const rawBody = await response.text();
      payload = rawBody ? { message: rawBody } : {};
    }

    if (!response.ok) {
      return res.status(response.status).json({
        message: payload?.message || 'No fue posible validar la cedula en SEP.',
        details: payload,
      });
    }

    if (!hasLawTitle(payload)) {
      return res.status(422).json({
        message: 'La cedula no corresponde a un titulo profesional de Derecho.',
        details: payload,
      });
    }

    return res.status(200).json(payload);
  } catch (error) {
    if (error?.name === 'AbortError') {
      return res.status(504).json({
        message: 'La validacion de cedula excedio el tiempo de espera.',
      });
    }

    return next(error);
  }
}

module.exports = {
  validateCedula,
};
