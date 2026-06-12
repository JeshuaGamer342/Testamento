import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Breadcrumbs from '../components/layout/Breadcrumbs'
import StepProgress from '../components/shared/StepProgress'

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:3006'

type RegistroResponse = {
  message?: string
  notaryId?: number
}

function NotaryRegisterPage() {
  const navigate = useNavigate()
  
  const [cedula, setCedula] = useState('')
  const [nombreInput, setNombreInput] = useState('')
  const [notariaNumero, setNotariaNumero] = useState('')
  const [ubicacion, setUbicacion] = useState('')
  const [contactoEmail, setContactoEmail] = useState('')
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  function handleNombreChange(value: string) {
    const cleanValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '')
    setNombreInput(cleanValue)
  }

  function handleCedulaChange(value: string) {
    const cleanValue = value.replace(/\D/g, '')
    setCedula(cleanValue)
  }

  function handleNotariaChange(value: string) {
    const cleanValue = value.replace(/\D/g, '')
    setNotariaNumero(cleanValue === '0' ? '' : cleanValue)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    const trimmedCedula = cedula.trim()
    const trimmedNombre = nombreInput.trim()
    const trimmedNotaria = notariaNumero.trim()
    const trimmedUbicacion = ubicacion.trim()
    const trimmedEmail = contactoEmail.trim()

    if (!trimmedCedula || !trimmedNombre || !trimmedNotaria || !trimmedUbicacion || !trimmedEmail) {
      setErrorMessage('Todos los campos son obligatorios para el registro oficial.')
      return
    }

    const parsedNotaria = parseInt(trimmedNotaria, 10)
    if (isNaN(parsedNotaria) || parsedNotaria <= 0) {
      setErrorMessage('El número de notaría debe ser un número entero mayor a cero.')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setErrorMessage('El correo electrónico de contacto no tiene un formato válido.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(
        `${BACKEND_BASE_URL}/api/notaries/registro-oficial`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre_input: trimmedNombre,
            notaria_numero: parsedNotaria,
            cedula_profesional: trimmedCedula,
            ubicacion: trimmedUbicacion,
            contacto_email: trimmedEmail
          }),
        }
      )

      const payload = (await response.json().catch(() => ({}))) as RegistroResponse

      if (!response.ok) {
        setErrorMessage(payload.message || 'No se pudo realizar el registro.')
        return
      }

      setSuccessMessage('¡Validación exitosa! Redirigiendo al pago...')
      
      if (payload.notaryId) {
        sessionStorage.setItem('registered_notary_id', String(payload.notaryId))
      }
      
      setTimeout(() => {
        navigate('/nuevo-notario/pago')
      }, 1200)

    } catch (err) {
      setErrorMessage('Error de conexión con el servidor.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="flow-page register-page">
      <Breadcrumbs />

      <div className="register-title-wrap">
        <h1>Registro de Notario</h1>
        <p className="lead">Únase a la red digital de notarios más confiable del país.</p>
      </div>

      <StepProgress
        steps={['Información', 'Pago']}
        activeStep={1}
        completedSteps={[]}
        showCheckOnCompleted
        className="step-progress-register"
      />

      <article className="form-card register-card">
        <h2>Paso 1: Información</h2>
        <p className="form-caption">
          Ingrese sus datos oficiales. Su cédula será validada en tiempo real ante la SEP.
        </p>
        
        <form className="form-grid" onSubmit={handleSubmit} noValidate>
          <label className="field field-wide">
            <span>Nombre Completo</span>
            <input
              type="text"
              autoComplete="off"
              placeholder="Ej. Alejandro Gómez Pérez"
              value={nombreInput}
              onChange={(e) => handleNombreChange(e.target.value)}
              disabled={isSubmitting}
            />
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', gridColumn: '1 / -1' }}>
            <label className="field">
              <span>Número de cédula profesional</span>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                placeholder="Ej. 1234567"
                value={cedula}
                onChange={(e) => handleCedulaChange(e.target.value)}
                disabled={isSubmitting}
              />
            </label>

            <label className="field">
              <span>Número de notaría pública</span>
              <input
                type="text" 
                inputMode="numeric"
                autoComplete="off"
                placeholder="Ej. 26"
                value={notariaNumero}
                onChange={(e) => handleNotariaChange(e.target.value)}
                disabled={isSubmitting}
              />
            </label>
          </div>

          <label className="field field-wide">
            <span>Ubicación / Cobertura</span>
            <input
              type="text"
              autoComplete="off"
              placeholder="Ej. Hermosillo, Sonora"
              value={ubicacion}
              onChange={(e) => setUbicacion(e.target.value)}
              disabled={isSubmitting}
            />
          </label>

          <label className="field field-wide">
            <span>Email oficial público</span>
            <input
              type="email"
              autoComplete="off"
              placeholder="contacto@notaria26.mx"
              value={contactoEmail}
              onChange={(e) => setContactoEmail(e.target.value)}
              disabled={isSubmitting}
            />
          </label>

          <div className="field field-wide" style={{ marginTop: '5px', marginBottom: '5px' }}>
            {errorMessage ? <p className="field-error" style={{ color: '#dc2626', fontWeight: 'bold' }}>⚠️ {errorMessage}</p> : null}
            {successMessage ? <p style={{ color: '#16a34a', fontWeight: 'bold' }}>✅ {successMessage}</p> : null}
          </div>

          <div className="field field-wide">
            <button type="submit" className="cta-button cta-large" disabled={isSubmitting}>
              {isSubmitting ? 'Validando...' : 'Validar cédula y continuar'}
            </button>
          </div>
        </form>
      </article>
    </section>
  )
}

export default NotaryRegisterPage