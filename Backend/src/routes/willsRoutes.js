const express = require('express');
const { validateWillData, validateWillStep } = require('../validators/willValidator');
const { createWillPdfBuffer } = require('../services/willPdfService');

const router = express.Router();
const WILL_COOKIE_NAME = 'willFormData';

function parseCookiePayload(cookieValue) {
  if (typeof cookieValue !== 'string' || !cookieValue.trim()) {
    return null;
  }

  try {
    return JSON.parse(cookieValue);
  } catch (error) {
    try {
      return JSON.parse(decodeURIComponent(cookieValue));
    } catch (decodeError) {
      return null;
    }
  }
}

function parseWillCookieFromHeader(cookieHeader = '') {
  if (typeof cookieHeader !== 'string' || !cookieHeader.trim()) {
    return null;
  }

  const targetPair = cookieHeader
    .split(';')
    .map((pair) => pair.trim())
    .find((pair) => pair.startsWith(`${WILL_COOKIE_NAME}=`));

  if (!targetPair) {
    return null;
  }

  const rawValue = targetPair.slice(WILL_COOKIE_NAME.length + 1);

  return parseCookiePayload(rawValue);
}

function pickWillData(req) {
  if (req.body && typeof req.body === 'object') {
    if (req.body.formData && typeof req.body.formData === 'object') {
      return req.body.formData;
    }

    if (req.body.willData && typeof req.body.willData === 'object') {
      return req.body.willData;
    }

    if (Object.keys(req.body).length > 0) {
      return req.body;
    }
  }

  const cookieData = parseCookiePayload(req.cookies?.[WILL_COOKIE_NAME]);

  if (cookieData && typeof cookieData === 'object') {
    return cookieData;
  }

  const cookieDataFromHeader = parseWillCookieFromHeader(req.headers?.cookie);

  if (cookieDataFromHeader && typeof cookieDataFromHeader === 'object') {
    return cookieDataFromHeader;
  }

  return {};
}

router.post('/validate', (req, res) => {
  const payload = pickWillData(req);
  const step = req.query.step;

  if (step !== undefined) {
    const result = validateWillStep(payload, step);

    if (!result.isValid) {
      return res.status(400).json({
        message: 'Datos invalidos para el paso indicado.',
        errors: result.errors,
      });
    }

    return res.status(200).json({
      message: 'Paso valido.',
      data: result.data,
    });
  }

  const result = validateWillData(payload);

  if (!result.isValid) {
    return res.status(400).json({
      message: 'Datos invalidos. Verifica los campos obligatorios y formato.',
      errors: result.errors,
    });
  }

  return res.status(200).json({
    message: 'Datos validos.',
    data: result.data,
  });
});

router.post('/pdf', async (req, res, next) => {
  try {
    const payload = pickWillData(req);
    const result = validateWillData(payload);

    if (!result.isValid) {
      return res.status(400).json({
        message: 'No se puede generar el PDF: hay campos invalidos o vacios.',
        errors: result.errors,
      });
    }

    const pdfBuffer = await createWillPdfBuffer(result.data);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="testamento-borrador.pdf"');

    return res.status(200).send(pdfBuffer);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
