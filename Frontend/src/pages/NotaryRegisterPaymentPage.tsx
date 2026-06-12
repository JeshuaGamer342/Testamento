import { type FormEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import StepProgress from '../components/shared/StepProgress'

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:4000'
const NOTARY_CEDULA_KEY = 'notaryCedulaValidated'

type SubscriptionCheckoutResponse = {
  checkoutUrl?: string
  message?: string
}

function NotaryRegisterPaymentPage() {
  const navigate = useNavigate()
  const [cardholderName, setCardholderName] = useState('')
  const [billingEmail, setBillingEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const validatedCedula = sessionStorage.getItem(NOTARY_CEDULA_KEY)

    if (!validatedCedula) {
      navigate('/nuevo-notario', { replace: true })
    }
  }, [navigate])

  if (!sessionStorage.getItem(NOTARY_CEDULA_KEY)) {
    return null
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setErrorMessage('')

    const trimmedCardholderName = cardholderName.trim()
    const trimmedBillingEmail = billingEmail.trim()

    if (!trimmedCardholderName) {
      setErrorMessage('Ingresa el nombre del titular antes de continuar.')
      return
    }

    if (!trimmedBillingEmail) {
      setErrorMessage('Ingresa el email para facturacion de la suscripcion.')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedBillingEmail)) {
      setErrorMessage('El email de facturacion no tiene un formato valido.')
      return
    }

    const validatedCedula = sessionStorage.getItem(NOTARY_CEDULA_KEY) || ''

    setIsSubmitting(true)

    try {
      const checkoutResponse = await fetch(
        `${BACKEND_BASE_URL}/api/payments/notary-registration/subscription-checkout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            cardholderName: trimmedCardholderName,
            billingEmail: trimmedBillingEmail,
            cedula: validatedCedula,
          }),
        },
      )

      const checkoutPayload =
        (await checkoutResponse.json().catch(() => ({}))) as SubscriptionCheckoutResponse

      if (!checkoutResponse.ok || typeof checkoutPayload.checkoutUrl !== 'string') {
        setErrorMessage(
          checkoutPayload.message || 'No se pudo iniciar el checkout de suscripcion en Stripe.',
        )
        return
      }

      window.location.assign(checkoutPayload.checkoutUrl)
    } catch {
      setErrorMessage('No fue posible conectar con el servicio de pagos. Intenta nuevamente.')
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
        activeStep={2}
        completedSteps={[1]}
        showCheckOnCompleted
        className="step-progress-register"
      />

      <form className="register-payment-grid" onSubmit={handleSubmit} noValidate>
        <article className="form-card payment-card">
          <h2>Metodo de pago</h2>
          <p className="form-caption">
            El cobro se realizara con una suscripcion de Stripe usando el precio
            recurrente que ya configuraste en tu cuenta.
          </p>

          <div className="payment-methods">
            <button type="button" className="payment-method payment-method-active">
              Suscripcion con Stripe
              <small>Cobro automatico recurrente</small>
            </button>
          </div>

          <div className="form-grid payment-form">
            <label className="field field-wide">
              <span>Nombre del titular</span>
              <input
                type="text"
                placeholder="Como aparece en la tarjeta"
                value={cardholderName}
                onChange={(event) => setCardholderName(event.target.value)}
                autoComplete="cc-name"
              />
            </label>

            <label className="field field-wide">
              <span>Email de facturacion</span>
              <input
                type="email"
                placeholder="correo@dominio.com"
                value={billingEmail}
                onChange={(event) => setBillingEmail(event.target.value)}
                autoComplete="email"
              />
            </label>
          </div>

          <p className="payment-security-note">
            Seras redirigido a Stripe Checkout para capturar la tarjeta de forma
            segura y activar la suscripcion.
          </p>
        </article>

        <aside className="charge-card">
          <h3>Resumen de cargo</h3>

          <div className="charge-row">
            <span>Cuota Bienal Notarial</span>
            <strong>$450.00</strong>
          </div>
          <p className="charge-subtext">Periodo 2024 - 2026</p>

          <div className="charge-row">
            <span>Habilitacion de Firma Digital</span>
            <strong>Incluido</strong>
          </div>

          <div className="charge-row">
            <span>Impuestos (IVA 16%)</span>
            <strong>$72.00</strong>
          </div>

          <div className="charge-divider" />

          <div className="charge-row charge-total">
            <span>Total</span>
            <strong>$522.00</strong>
          </div>

          <button
            type="submit"
            className="cta-button cta-large payment-next-button payment-submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Redirigiendo a Stripe...' : 'Continuar a Stripe'}
          </button>

          {errorMessage ? <p className="payment-status payment-status-error">{errorMessage}</p> : null}

          <p className="charge-secure-note">Pago 100% seguro</p>
        </aside>
      </form>
    </section>
  )
}

export default NotaryRegisterPaymentPage
