import { type FormEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Breadcrumbs from '../components/layout/Breadcrumbs'
import StepProgress from '../components/shared/StepProgress'

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:3006'

type SubscriptionCheckoutResponse = {
  checkoutUrl?: string
  message?: string
}

function NotaryRegisterPaymentPage() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const notaryId = sessionStorage.getItem('registered_notary_id')
    if (!notaryId) {
      navigate('/nuevo-notario', { replace: true })
    }
  }, [navigate])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    setIsSubmitting(true)

    const notaryId = sessionStorage.getItem('registered_notary_id')

    if (!notaryId) {
      setErrorMessage('Error: No se encontró el registro del notario. Por favor, vuelva al paso anterior.')
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch(
        `${BACKEND_BASE_URL}/api/payments/notary-registration/subscription-checkout`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            notaryId: notaryId,
          }),
        }
      )

      const payload = (await response.json().catch(() => ({}))) as SubscriptionCheckoutResponse

      if (!response.ok || typeof payload.checkoutUrl !== 'string') {
        setErrorMessage(payload.message || 'No se pudo iniciar el checkout en Stripe.')
        return
      }

      window.location.assign(payload.checkoutUrl)
    } catch {
      setErrorMessage('No fue posible conectar con el servicio de pagos. Intenta nuevamente.')
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
        activeStep={2}
        completedSteps={[1]}
        showCheckOnCompleted
        className="step-progress-register"
      />

      <form className="register-payment-grid" onSubmit={handleSubmit} noValidate style={{ display: 'block', maxWidth: '600px', margin: '0 auto' }}>
        <article className="form-card payment-card" style={{ textAlign: 'center', padding: '40px 30px' }}>
          <h2>Paso 2: Alta de Membresía Oficial</h2>
          
          <p className="form-caption" style={{ fontSize: '16px', marginBottom: '30px' }}>
            Su cédula ha sido validada y su registro pre-autorizado. Proceda al pago para activar su perfil en el directorio nacional.
          </p>

          <button
            type="submit"
            className="cta-button cta-large payment-submit-button"
            disabled={isSubmitting}
            style={{ width: '100%', padding: '15px', fontSize: '18px', fontWeight: 'bold' }}
          >
            {isSubmitting ? 'Preparando entorno seguro...' : 'Ir a Stripe Checkout ➔'}
          </button>

          {errorMessage ? (
            <p style={{ color: '#dc2626', marginTop: '15px', fontWeight: 'bold' }}>⚠️ {errorMessage}</p>
          ) : null}
        </article>
      </form>
    </section>
  )
}

export default NotaryRegisterPaymentPage