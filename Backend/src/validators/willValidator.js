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
];

const STEP_REQUIRED_FIELDS = {
  1: ['fullName', 'birthDate', 'nationality', 'civilStatus', 'address', 'idNumber'],
  2: ['heirs'],
  3: ['specialLegacy'],
  4: ['executorName', 'executorRelation'],
  5: [],
};

const STEP_FORMAT_FIELDS = {
  1: ['fullName', 'birthDate', 'nationality', 'civilStatus', 'address', 'idNumber'],
  2: ['heirs'],
  3: ['specialLegacy'],
  4: ['executorName', 'executorRelation'],
  5: ['guardianName', 'guardianScope'],
};

const MIN_REQUIRED_AGE_YEARS = 16;
const MAX_ALLOWED_AGE_YEARS = 150;
const ALLOWED_TEXT_REGEX = /^[\p{L}0-9.,\s]+$/u;
const ALLOWED_ALPHA_TEXT_REGEX = /^[\p{L}.,\s]+$/u;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const NO_NUMBER_FIELDS = ['fullName', 'nationality', 'executorName', 'guardianName'];

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

function parseIsoDate(value) {
  if (!DATE_REGEX.test(value)) {
    return null;
  }

  const [yearPart, monthPart, dayPart] = value.split('-');
  const year = Number(yearPart);
  const month = Number(monthPart);
  const day = Number(dayPart);
  const parsedDate = new Date(Date.UTC(year, month - 1, day));

  if (
    parsedDate.getUTCFullYear() !== year
    || parsedDate.getUTCMonth() !== month - 1
    || parsedDate.getUTCDate() !== day
  ) {
    return null;
  }

  return parsedDate;
}

function getTodayAtUtcMidnight() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function getOldestAllowedBirthDate(referenceDate) {
  const oldestAllowedDate = new Date(referenceDate);
  oldestAllowedDate.setUTCFullYear(oldestAllowedDate.getUTCFullYear() - MAX_ALLOWED_AGE_YEARS);
  return oldestAllowedDate;
}

function getYoungestDisallowedBirthDate(referenceDate) {
  const youngestDisallowedDate = new Date(referenceDate);
  youngestDisallowedDate.setUTCFullYear(youngestDisallowedDate.getUTCFullYear() - MIN_REQUIRED_AGE_YEARS);
  return youngestDisallowedDate;
}

function validateBirthDate(value) {
  if (!DATE_REGEX.test(value)) {
    return 'La fecha debe tener formato YYYY-MM-DD.';
  }

  const birthDate = parseIsoDate(value);

  if (!birthDate) {
    return 'La fecha de nacimiento no es valida.';
  }

  const today = getTodayAtUtcMidnight();

  if (birthDate > today) {
    return 'La fecha de nacimiento no puede ser futura.';
  }

  const oldestAllowedDate = getOldestAllowedBirthDate(today);

  if (birthDate < oldestAllowedDate) {
    return 'La fecha de nacimiento no puede superar 150 anos.';
  }

  const youngestDisallowedDate = getYoungestDisallowedBirthDate(today);

  if (birthDate >= youngestDisallowedDate) {
    return 'La persona debe ser mayor a 16 anos.';
  }

  return null;
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
      const birthDateError = validateBirthDate(value);

      if (birthDateError) {
        errors[field] = birthDateError;
      }
      return;
    }

    if (NO_NUMBER_FIELDS.includes(field) && !ALLOWED_ALPHA_TEXT_REGEX.test(value)) {
      errors[field] = 'Solo se permiten letras, espacios, puntos y comas.';
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
  const requiredFieldsForStep = STEP_REQUIRED_FIELDS[stepNumber];
  const formatFieldsForStep = STEP_FORMAT_FIELDS[stepNumber];

  if (!requiredFieldsForStep || !formatFieldsForStep) {
    return {
      isValid: false,
      errors: {
        step: 'Paso invalido. Debe estar entre 1 y 5.',
      },
      data,
    };
  }

  pushRequiredErrors(requiredFieldsForStep, data, errors);
  pushFormatErrors(formatFieldsForStep, data, errors);

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
