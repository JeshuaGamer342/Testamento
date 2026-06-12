import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import StepProgress from '../components/shared/StepProgress'

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:4000'
const NOTARY_CEDULA_KEY = 'notaryCedulaValidated'

type CedulaValidationResponse = {
  message?: string
}

function NotaryRegisterPage() {
  const navigate = useNavigate()
  const [cedula, setCedula] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')

    const trimmedCedula = cedula.trim()

    if (!trimmedCedula) {
      setErrorMessage('Ingresa el numero de cedula profesional para continuar.')
      return
    }

    if (!/^\d+$/.test(trimmedCedula)) {
      setErrorMessage('La cedula solo debe contener digitos.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(
        `${BACKEND_BASE_URL}/api/sep/grupo/validar-cedula?cedula=${encodeURIComponent(trimmedCedula)}`,
        {
          method: 'POST',
        },
      )

      const payload = (await response.json().catch(() => ({}))) as CedulaValidationResponse

      if (!response.ok) {
        setErrorMessage(payload.message || 'No se pudo validar la cedula en este momento.')
        return
      }

      sessionStorage.setItem(NOTARY_CEDULA_KEY, trimmedCedula)
      navigate('/nuevo-notario/pago')
    } catch {
      setErrorMessage('No fue posible conectar con el servicio de validacion de cedula.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="flow-page register-page">
      <div className="register-title-wrap">
        <h1>Registro de Notario</h1>
        <p className="lead">Unase a la red digital de notarios mas confiable del pais.</p>
      </div>
      <StepProgress
        steps={['Informacion', 'Pago', 'Cuenta']}
        activeStep={1}
        className="step-progress-register"
      />
      <article className="form-card register-card">
        <h2>Paso 1: Informacion</h2>
        <p className="form-caption">
          Valide su cedula profesional para continuar al paso de pago.
        </p>
        <form className="form-grid" onSubmit={handleSubmit} noValidate>
          <label className={`field field-wide${errorMessage ? ' field-has-error' : ''}`}>
            <span>Numero de cedula profesional</span>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="off"
              placeholder="Ej. 1234567"
              value={cedula}
              onChange={(event) => setCedula(event.target.value)}
            />
            {errorMessage ? <p className="field-error">{errorMessage}</p> : null}
          </label>

          <div className="field field-wide">
            <button type="submit" className="cta-button cta-large" disabled={isSubmitting}>
              {isSubmitting ? 'Validando cedula...' : 'Validar cedula y continuar'}
            </button>
          </div>
        </form>
      </article>
    </section>
  )
}

export default NotaryRegisterPage
