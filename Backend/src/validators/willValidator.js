const TEXT_FIELDS = [
  'fullName',
  'nationality',
  'civilStatus',
  'address',
  'idNumber',
  'heirs',
  'specialLegacy',
  'executorName',
  'executorRelation',
  'guardianName',
  'guardianScope',
];

const REQUIRED_FIELDS = [
  'fullName',
  'birthDate',
  'nationality',
  'civilStatus',
  'address',
  'idNumber',
  'heirs',
  'specialLegacy',
  'executorName',
  'executorRelation',
  'guardianName',
  'guardianScope',
];

const STEP_FIELDS = {
  1: ['fullName', 'birthDate', 'nationality', 'civilStatus', 'address', 'idNumber'],
  2: ['heirs'],
  3: ['specialLegacy'],
  4: ['executorName', 'executorRelation'],
  5: ['guardianName', 'guardianScope'],
};

const ALLOWED_TEXT_REGEX = /^[\p{L}0-9.,\s]+$/u;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function normalizeText(value) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim().replace(/\s+/g, ' ');
}

function normalizeWillData(rawData = {}) {
  return {
    fullName: normalizeText(rawData.fullName),
    birthDate: typeof rawData.birthDate === 'string' ? rawData.birthDate.trim() : '',
    nationality: normalizeText(rawData.nationality),
    civilStatus: normalizeText(rawData.civilStatus),
    address: normalizeText(rawData.address),
    idNumber: normalizeText(rawData.idNumber),
    heirs: normalizeText(rawData.heirs),
    specialLegacy: normalizeText(rawData.specialLegacy),
    executorName: normalizeText(rawData.executorName),
    executorRelation: normalizeText(rawData.executorRelation),
    guardianName: normalizeText(rawData.guardianName),
    guardianScope: normalizeText(rawData.guardianScope),
  };
}

function pushRequiredErrors(fieldsToCheck, data, errors) {
  fieldsToCheck.forEach((field) => {
    if (!data[field]) {
      errors[field] = 'Este campo es obligatorio y no puede quedar en blanco.';
    }
  });
}

function pushFormatErrors(fieldsToCheck, data, errors) {
  fieldsToCheck.forEach((field) => {
    const value = data[field];

    if (!value) {
      return;
    }

    if (field === 'birthDate') {
      if (!DATE_REGEX.test(value)) {
        errors[field] = 'La fecha debe tener formato YYYY-MM-DD.';
      }
      return;
    }

    if (TEXT_FIELDS.includes(field) && !ALLOWED_TEXT_REGEX.test(value)) {
      errors[field] = 'Solo se permiten letras, numeros, espacios, puntos y comas.';
    }
  });
}

function validateWillData(rawData) {
  const data = normalizeWillData(rawData);
  const errors = {};

  pushRequiredErrors(REQUIRED_FIELDS, data, errors);
  pushFormatErrors([...TEXT_FIELDS, 'birthDate'], data, errors);

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    data,
  };
}

function validateWillStep(rawData, step) {
  const stepNumber = Number(step);
  const data = normalizeWillData(rawData);
  const errors = {};
  const fieldsForStep = STEP_FIELDS[stepNumber];

  if (!fieldsForStep) {
    return {
      isValid: false,
      errors: {
        step: 'Paso invalido. Debe estar entre 1 y 5.',
      },
      data,
    };
  }

  pushRequiredErrors(fieldsForStep, data, errors);
  pushFormatErrors(fieldsForStep, data, errors);

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    data,
  };
}

module.exports = {
  validateWillData,
  validateWillStep,
};
