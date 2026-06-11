import { useMemo, useState } from 'react'
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

const willSteps = ['Datos', 'Herederos', 'Legado', 'Albacea', 'Tutoria']

function WillFormPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [draftSaved, setDraftSaved] = useState(false)
  const [formData, setFormData] = useState<WillFormData>({
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
  })

  const isLastStep = currentStep === willSteps.length
  const completedSteps = useMemo(
    () => Array.from({ length: Math.max(currentStep - 1, 0) }, (_, index) => index + 1),
    [currentStep],
  )

  function updateField(field: keyof WillFormData, value: string) {
    setFormData((previous) => ({ ...previous, [field]: value }))
  }

  function goBack() {
    setDraftSaved(false)
    setCurrentStep((previous) => Math.max(previous - 1, 1))
  }

  function goForward() {
    if (isLastStep) {
      setDraftSaved(true)
      return
    }

    setDraftSaved(false)
    setCurrentStep((previous) => Math.min(previous + 1, willSteps.length))
  }

  function primaryActionLabel() {
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
            <label className="field">
              <span>Nombre completo</span>
              <input
                type="text"
                placeholder="Ej. Juan Perez Garcia"
                value={formData.fullName}
                onChange={(event) => updateField('fullName', event.target.value)}
              />
            </label>
            <label className="field">
              <span>Fecha de nacimiento</span>
              <input
                type="date"
                value={formData.birthDate}
                onChange={(event) => updateField('birthDate', event.target.value)}
              />
            </label>
            <label className="field">
              <span>Nacionalidad</span>
              <input
                type="text"
                placeholder="Ej. Espanola"
                value={formData.nationality}
                onChange={(event) => updateField('nationality', event.target.value)}
              />
            </label>
            <label className="field">
              <span>Estado civil</span>
              <select
                value={formData.civilStatus}
                onChange={(event) => updateField('civilStatus', event.target.value)}
              >
                <option>Soltero</option>
                <option>Casado</option>
                <option>Union civil</option>
                <option>Divorciado</option>
              </select>
            </label>
            <label className="field field-wide">
              <span>Direccion de residencia</span>
              <input
                type="text"
                placeholder="Calle, numero, piso, ciudad"
                value={formData.address}
                onChange={(event) => updateField('address', event.target.value)}
              />
            </label>
            <label className="field">
              <span>Numero de identificacion</span>
              <input
                type="text"
                placeholder="12345678X"
                value={formData.idNumber}
                onChange={(event) => updateField('idNumber', event.target.value)}
              />
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
            <label className="field field-wide">
              <span>Entrada de nombres y parentesco</span>
              <textarea
                rows={5}
                placeholder="Ejemplo: Todo para mi pareja, Ana Lopez. O dividido en partes iguales entre Diego Lopez (hijo) y Marta Lopez (hija)."
                value={formData.heirs}
                onChange={(event) => updateField('heirs', event.target.value)}
              />
            </label>
          </form>
        </>
      )
    }

    if (currentStep === 3) {
      return (
        <>
          <h2>Paso 3: Legado especial (opcional)</h2>
          <p className="will-step-help">
            Tienes algun legado especial? Si no hay ninguno, deja el campo
            vacio y continua.
          </p>
          <form className="form-grid" onSubmit={(event) => event.preventDefault()}>
            <label className="field field-wide">
              <span>Legado especial</span>
              <textarea
                rows={5}
                placeholder="Ejemplo: Mi casa de la playa para mi hijo mayor. Mi coleccion de arte para mi mejor amigo."
                value={formData.specialLegacy}
                onChange={(event) => updateField('specialLegacy', event.target.value)}
              />
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
            <label className="field">
              <span>Nombre del albacea</span>
              <input
                type="text"
                placeholder="Ej. Laura Gomez"
                value={formData.executorName}
                onChange={(event) => updateField('executorName', event.target.value)}
              />
            </label>
            <label className="field">
              <span>Parentesco o relacion</span>
              <input
                type="text"
                placeholder="Ej. Hermana"
                value={formData.executorRelation}
                onChange={(event) => updateField('executorRelation', event.target.value)}
              />
            </label>
          </form>
        </>
      )
    }

    return (
      <>
        <h2>Paso 5: Tutoria de hijos menores o mascotas</h2>
        <p className="will-step-help">
          En caso de que ocurra lo inesperado, quien quieres que tenga la
          custodia de tus hijos o mascotas?
        </p>
        <form className="form-grid" onSubmit={(event) => event.preventDefault()}>
          <label className="field">
            <span>Nombre de la persona tutora</span>
            <input
              type="text"
              placeholder="Ej. Carlos Diaz"
              value={formData.guardianName}
              onChange={(event) => updateField('guardianName', event.target.value)}
            />
          </label>
          <label className="field">
            <span>Se hara cargo de</span>
            <input
              type="text"
              placeholder="Ej. Hijos menores y mascotas"
              value={formData.guardianScope}
              onChange={(event) => updateField('guardianScope', event.target.value)}
            />
          </label>
        </form>
      </>
    )
  }

  return (
    <section className="flow-page">
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
          Borrador guardado. Puedes volver a editar cualquier paso antes de
          generar el documento final.
        </article>
      ) : null}
      <div className="page-actions page-actions-between">
        <button
          type="button"
          className="outline-button"
          onClick={goBack}
          disabled={currentStep === 1}
        >
          Anterior
        </button>
        <button type="button" className="cta-button cta-large" onClick={goForward}>
          {primaryActionLabel()}
        </button>
      </div>
    </section>
  )
}

export default WillFormPage
