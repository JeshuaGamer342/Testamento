import Cookies from 'js-cookie'
import { useEffect, useMemo, useState } from 'react'
import Breadcrumbs from '../components/layout/Breadcrumbs'
import StepProgress from '../components/shared/StepProgress'

type WillFormData = {
  fullName: string
  birthDate: string
  nationality: string
  civilStatus: string
  address: string
  idNumber: string
  heirs: string
  specialLegacy: string
  executorName: string
  executorRelation: string
  guardianName: string
  guardianScope: string
}

type FieldErrors = Partial<Record<keyof WillFormData, string>>

const willSteps = ['Datos', 'Herederos', 'Legado', 'Albacea', 'Tutoria']
const WILL_FORM_COOKIE_NAME = 'willFormData'
const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:4000'
const ALLOWED_TEXT_REGEX = /^[\p{L}0-9.,\s]+$/u
const DISALLOWED_TEXT_REGEX = /[^\p{L}0-9.,\s]/gu
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/

const defaultFormData: WillFormData = {
  fullName: '',
  birthDate: '',
  nationality: '',
  civilStatus: 'Soltero',
  address: '',
  idNumber: '',
  heirs: '',
  specialLegacy: '',
  executorName: '',
  executorRelation: '',
  guardianName: '',
  guardianScope: '',
}

const allowedCivilStatus = ['Soltero', 'Casado', 'Union civil', 'Divorciado']

const stepFields: Record<number, Array<keyof WillFormData>> = {
  1: ['fullName', 'birthDate', 'nationality', 'civilStatus', 'address', 'idNumber'],
  2: ['heirs'],
  3: ['specialLegacy'],
  4: ['executorName', 'executorRelation'],
  5: [],
}

function sanitizeTextInput(value: string) {
  return value.replace(DISALLOWED_TEXT_REGEX, '')
}

function getSafeString(value: unknown) {
  if (typeof value !== 'string') {
    return ''
  }

  return sanitizeTextInput(value)
}

function getSafeBirthDate(value: unknown) {
  if (typeof value !== 'string') {
    return ''
  }

  return DATE_REGEX.test(value) ? value : ''
}

function getSafeCivilStatus(value: unknown) {
  if (typeof value !== 'string') {
    return defaultFormData.civilStatus
  }

  return allowedCivilStatus.includes(value) ? value : defaultFormData.civilStatus
}

function buildSafeFormData(rawData: unknown): WillFormData {
  if (!rawData || typeof rawData !== 'object') {
    return defaultFormData
  }

  const values = rawData as Partial<Record<keyof WillFormData, unknown>>

  return {
    fullName: getSafeString(values.fullName),
    birthDate: getSafeBirthDate(values.birthDate),
    nationality: getSafeString(values.nationality),
    civilStatus: getSafeCivilStatus(values.civilStatus),
    address: getSafeString(values.address),
    idNumber: getSafeString(values.idNumber),
    heirs: getSafeString(values.heirs),
    specialLegacy: getSafeString(values.specialLegacy),
    executorName: getSafeString(values.executorName),
    executorRelation: getSafeString(values.executorRelation),
    guardianName: getSafeString(values.guardianName),
    guardianScope: getSafeString(values.guardianScope),
  }
}

function isWillField(field: string): field is keyof WillFormData {
  return field in defaultFormData
}

function mapServerFieldErrors(rawErrors: unknown): FieldErrors {
  if (!rawErrors || typeof rawErrors !== 'object') {
    return {}
  }

  const errors: FieldErrors = {}

  Object.entries(rawErrors).forEach(([field, message]) => {
    if (!isWillField(field) || typeof message !== 'string') {
      return
    }

    errors[field] = message
  })

  return errors
}

function validateStepLocally(step: number, data: WillFormData): FieldErrors {
  const errors: FieldErrors = {}
  const fields = stepFields[step] ?? []
  const optionalFields: Array<keyof WillFormData> = step === 5 ? ['guardianName', 'guardianScope'] : []

  fields.forEach((field) => {
    const value = data[field]

    if (!value.trim()) {
      errors[field] = 'Este campo es obligatorio y no puede quedar en blanco.'
      return
    }

    if (field === 'birthDate' && !DATE_REGEX.test(value)) {
      errors[field] = 'La fecha debe tener formato YYYY-MM-DD.'
      return
    }

    if (field !== 'birthDate' && !ALLOWED_TEXT_REGEX.test(value)) {
      errors[field] = 'Solo se permiten letras, numeros, espacios, puntos y comas.'
    }
  })

  optionalFields.forEach((field) => {
    const value = data[field].trim()

    if (!value) {
      return
    }

    if (!ALLOWED_TEXT_REGEX.test(value)) {
      errors[field] = 'Solo se permiten letras, numeros, espacios, puntos y comas.'
    }
  })

  return errors
}

function WillFormPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [draftSaved, setDraftSaved] = useState(false)
  const [formData, setFormData] = useState<WillFormData>(defaultFormData)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const savedDraft = Cookies.get(WILL_FORM_COOKIE_NAME)

    if (!savedDraft) {
      return
    }

    try {
      const parsedDraft = JSON.parse(savedDraft)
      setFormData(buildSafeFormData(parsedDraft))
    } catch {
      Cookies.remove(WILL_FORM_COOKIE_NAME)
    }
  }, [])

  useEffect(() => {
    Cookies.set(WILL_FORM_COOKIE_NAME, JSON.stringify(formData), {
      expires: 7,
      sameSite: 'lax',
    })
  }, [formData])

  const isLastStep = currentStep === willSteps.length
  const completedSteps = useMemo(
    () => Array.from({ length: Math.max(currentStep - 1, 0) }, (_, index) => index + 1),
    [currentStep],
  )

  function updateField(field: keyof WillFormData, value: string) {
    const safeValue = field === 'birthDate' ? value : sanitizeTextInput(value)

    setDraftSaved(false)
    setFormData((previous) => ({ ...previous, [field]: safeValue }))
    setFieldErrors((previous) => ({ ...previous, [field]: undefined }))
    setFormError('')
  }

  async function validateCurrentStepWithBackend(step: number, payload: WillFormData) {
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/wills/validate?step=${step}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ formData: payload }),
      })

      const responsePayload = (await response
        .json()
        .catch(() => null)) as { message?: string; errors?: unknown } | null

      if (!response.ok) {
        const backendErrors = mapServerFieldErrors(responsePayload?.errors)

        if (Object.keys(backendErrors).length > 0) {
          setFieldErrors((previous) => ({ ...previous, ...backendErrors }))
        }

        setFormError(responsePayload?.message ?? 'No fue posible validar este paso.')
        return false
      }

      return true
    } catch {
      setFormError('No fue posible validar con el backend. Verifica que este activo en puerto 4000.')
      return false
    }
  }

  async function downloadWillPdf(payload: WillFormData) {
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/wills/pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ formData: payload }),
      })

      if (!response.ok) {
        const responsePayload = (await response
          .json()
          .catch(() => null)) as { message?: string; errors?: unknown } | null
        const backendErrors = mapServerFieldErrors(responsePayload?.errors)

        if (Object.keys(backendErrors).length > 0) {
          setFieldErrors((previous) => ({ ...previous, ...backendErrors }))
        }

        setFormError(responsePayload?.message ?? 'No se pudo generar el PDF.')
        return false
      }

      const pdfBlob = await response.blob()
      const downloadUrl = URL.createObjectURL(pdfBlob)
      const link = document.createElement('a')

      link.href = downloadUrl
      link.download = 'testamento-borrador.pdf'
      document.body.append(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(downloadUrl)

      return true
    } catch {
      setFormError('No se pudo generar el PDF. Verifica la conexion con el backend.')
      return false
    }
  }

  function goBack() {
    setDraftSaved(false)
    setFormError('')
    setFieldErrors({})
    setCurrentStep((previous) => Math.max(previous - 1, 1))
  }

  async function goForward() {
    setDraftSaved(false)
    setFormError('')

    const localErrors = validateStepLocally(currentStep, formData)

    if (Object.keys(localErrors).length > 0) {
      setFieldErrors((previous) => ({ ...previous, ...localErrors }))
      setFormError('Completa todos los campos requeridos para continuar.')
      return
    }

    setIsSubmitting(true)

    try {
      const isStepValid = await validateCurrentStepWithBackend(currentStep, formData)

      if (!isStepValid) {
        return
      }

      if (isLastStep) {
        const pdfGenerated = await downloadWillPdf(formData)

        if (pdfGenerated) {
          setDraftSaved(true)
        }

        return
      }

      setFieldErrors({})
      setCurrentStep((previous) => Math.min(previous + 1, willSteps.length))
    } finally {
      setIsSubmitting(false)
    }
  }

  function getFieldClassName(field: keyof WillFormData, wide = false) {
    const baseClass = wide ? 'field field-wide' : 'field'

    return fieldErrors[field] ? `${baseClass} field-has-error` : baseClass
  }

  function renderFieldError(field: keyof WillFormData) {
    const error = fieldErrors[field]

    if (!error) {
      return null
    }

    return <small className="field-error">{error}</small>
  }

  function primaryActionLabel() {
    if (isSubmitting) {
      return isLastStep ? 'Generando PDF...' : 'Validando...'
    }

    if (currentStep === 1) {
      return 'Ir al paso 2'
    }

    if (currentStep === 2) {
      return 'Ir al paso 3'
    }

    if (currentStep === 3) {
      return 'Ir al paso 4'
    }

    if (currentStep === 4) {
      return 'Ir al paso 5'
    }

    return 'Descargar PDF'
  }

  function renderStepForm() {
    if (currentStep === 1) {
      return (
        <>
          <h2>Datos personales</h2>
          <p className="form-caption">
            Completa tus datos personales para iniciar el borrador legal.
          </p>
          <form className="form-grid" onSubmit={(event) => event.preventDefault()}>
            <label className={getFieldClassName('fullName')}>
              <span>Nombre completo</span>
              <input
                type="text"
                placeholder="Ej. Juan Perez Garcia"
                value={formData.fullName}
                onChange={(event) => updateField('fullName', event.target.value)}
                disabled={isSubmitting}
              />
              {renderFieldError('fullName')}
            </label>
            <label className={getFieldClassName('birthDate')}>
              <span>Fecha de nacimiento</span>
              <input
                type="date"
                value={formData.birthDate}
                onChange={(event) => updateField('birthDate', event.target.value)}
                disabled={isSubmitting}
              />
              {renderFieldError('birthDate')}
            </label>
            <label className={getFieldClassName('nationality')}>
              <span>Nacionalidad</span>
              <input
                type="text"
                placeholder="Ej. Espanola"
                value={formData.nationality}
                onChange={(event) => updateField('nationality', event.target.value)}
                disabled={isSubmitting}
              />
              {renderFieldError('nationality')}
            </label>
            <label className={getFieldClassName('civilStatus')}>
              <span>Estado civil</span>
              <select
                value={formData.civilStatus}
                onChange={(event) => updateField('civilStatus', event.target.value)}
                disabled={isSubmitting}
              >
                <option>Soltero</option>
                <option>Casado</option>
                <option>Union civil</option>
                <option>Divorciado</option>
              </select>
              {renderFieldError('civilStatus')}
            </label>
            <label className={getFieldClassName('address', true)}>
              <span>Direccion de residencia</span>
              <input
                type="text"
                placeholder="Calle, numero, piso, ciudad"
                value={formData.address}
                onChange={(event) => updateField('address', event.target.value)}
                disabled={isSubmitting}
              />
              {renderFieldError('address')}
            </label>
            <label className={getFieldClassName('idNumber')}>
              <span>Numero de identificacion</span>
              <input
                type="text"
                placeholder="12345678X"
                value={formData.idNumber}
                onChange={(event) => updateField('idNumber', event.target.value)}
                disabled={isSubmitting}
              />
              {renderFieldError('idNumber')}
            </label>
          </form>
        </>
      )
    }

    if (currentStep === 2) {
      return (
        <>
          <h2>Paso 2: Herederos principales</h2>
          <p className="will-step-help">
            Quienes son tus herederos principales? Puedes escribir nombres y
            parentesco en el mismo campo.
          </p>
          <form className="form-grid" onSubmit={(event) => event.preventDefault()}>
            <label className={getFieldClassName('heirs', true)}>
              <span>Entrada de nombres y parentesco</span>
              <textarea
                rows={5}
                placeholder="Ejemplo: Todo para mi pareja, Ana Lopez. O dividido en partes iguales entre Diego Lopez (hijo) y Marta Lopez (hija)."
                value={formData.heirs}
                onChange={(event) => updateField('heirs', event.target.value)}
                disabled={isSubmitting}
              />
              {renderFieldError('heirs')}
            </label>
          </form>
        </>
      )
    }

    if (currentStep === 3) {
      return (
        <>
          <h2>Paso 3: Legado especial</h2>
          <p className="will-step-help">
            Describe el legado especial que deseas registrar en el documento.
          </p>
          <form className="form-grid" onSubmit={(event) => event.preventDefault()}>
            <label className={getFieldClassName('specialLegacy', true)}>
              <span>Legado especial</span>
              <textarea
                rows={5}
                placeholder="Ejemplo: Mi casa de la playa para mi hijo mayor. Mi coleccion de arte para mi mejor amigo."
                value={formData.specialLegacy}
                onChange={(event) => updateField('specialLegacy', event.target.value)}
                disabled={isSubmitting}
              />
              {renderFieldError('specialLegacy')}
            </label>
          </form>
        </>
      )
    }

    if (currentStep === 4) {
      return (
        <>
          <h2>Paso 4: Albacea</h2>
          <p className="will-step-help">
            Nombra a una persona de absoluta confianza para que se asegure de
            que se cumpla tu voluntad.
          </p>
          <form className="form-grid" onSubmit={(event) => event.preventDefault()}>
            <label className={getFieldClassName('executorName')}>
              <span>Nombre del albacea</span>
              <input
                type="text"
                placeholder="Ej. Laura Gomez"
                value={formData.executorName}
                onChange={(event) => updateField('executorName', event.target.value)}
                disabled={isSubmitting}
              />
              {renderFieldError('executorName')}
            </label>
            <label className={getFieldClassName('executorRelation')}>
              <span>Parentesco o relacion</span>
              <input
                type="text"
                placeholder="Ej. Hermana"
                value={formData.executorRelation}
                onChange={(event) => updateField('executorRelation', event.target.value)}
                disabled={isSubmitting}
              />
              {renderFieldError('executorRelation')}
            </label>
          </form>
        </>
      )
    }

    return (
      <>
        <h2>Paso 5: Tutoria de hijos menores o mascotas (opcional)</h2>
        <p className="will-step-help">
          En caso de que ocurra lo inesperado, quien quieres que tenga la
          custodia de tus hijos o mascotas? Puedes dejar este paso en blanco.
        </p>
        <form className="form-grid" onSubmit={(event) => event.preventDefault()}>
          <label className={getFieldClassName('guardianName')}>
            <span>Nombre de la persona tutora</span>
            <input
              type="text"
              placeholder="Ej. Carlos Diaz"
              value={formData.guardianName}
              onChange={(event) => updateField('guardianName', event.target.value)}
              disabled={isSubmitting}
            />
            {renderFieldError('guardianName')}
          </label>
          <label className={getFieldClassName('guardianScope')}>
            <span>Se hara cargo de</span>
            <input
              type="text"
              placeholder="Ej. Hijos menores y mascotas"
              value={formData.guardianScope}
              onChange={(event) => updateField('guardianScope', event.target.value)}
              disabled={isSubmitting}
            />
            {renderFieldError('guardianScope')}
          </label>
        </form>
      </>
    )
  }

  return (
    <section className="flow-page">
      <Breadcrumbs />
      <h1>Crea tu documento base de testamento</h1>
      <StepProgress
        steps={willSteps}
        activeStep={currentStep}
        completedSteps={completedSteps}
        showCheckOnCompleted
      />
      <article className="form-card">
        {renderStepForm()}
      </article>
      {draftSaved ? (
        <article className="notice-box">
          Borrador validado y PDF generado. Puedes volver a editar cualquier
          paso y descargar una nueva version del documento.
        </article>
      ) : null}
      {formError ? <article className="notice-box notice-box-error">{formError}</article> : null}
      <div className="page-actions page-actions-between">
        <button
          type="button"
          className="outline-button"
          onClick={goBack}
          disabled={currentStep === 1 || isSubmitting}
        >
          Anterior
        </button>
        <button
          type="button"
          className="cta-button cta-large"
          onClick={() => {
            void goForward()
          }}
          disabled={isSubmitting}
        >
          {primaryActionLabel()}
        </button>
      </div>
    </section>
  )
}

export default WillFormPage
