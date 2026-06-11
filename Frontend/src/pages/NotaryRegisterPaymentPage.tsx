import { Link } from 'react-router-dom'
import StepProgress from '../components/shared/StepProgress'

function NotaryRegisterPaymentPage() {
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

      <div className="register-payment-grid">
        <article className="form-card payment-card">
          <h2>Metodo de pago</h2>
          <p className="form-caption">
            Seleccione su forma de pago preferida para la habilitacion de su
            licencia notarial digital.
          </p>

          <div className="payment-methods">
            <button type="button" className="payment-method payment-method-active">
              Tarjeta Credito/Debito
              <small>Procesamiento inmediato</small>
            </button>
            <button type="button" className="payment-method">
              Transferencia bancaria
              <small>Validacion 24-48h</small>
            </button>
          </div>

          <form className="form-grid payment-form" onSubmit={(event) => event.preventDefault()}>
            <label className="field field-wide">
              <span>Nombre del titular</span>
              <input type="text" placeholder="Como aparece en la tarjeta" />
            </label>

            <label className="field field-wide">
              <span>Numero de tarjeta</span>
              <input type="text" placeholder="0000 0000 0000 0000" />
            </label>

            <label className="field">
              <span>Fecha de expiracion</span>
              <input type="text" placeholder="MM / AA" />
            </label>

            <label className="field">
              <span>CVC</span>
              <input type="password" placeholder="***" />
            </label>
          </form>

          <p className="payment-security-note">
            Su informacion esta protegida por encriptacion de grado bancario
            AES-256. TestaLink no almacena sus datos bancarios completos.
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

          <Link to="/nuevo-notario/cuenta" className="cta-button cta-large payment-next-button">
            Continuar al Paso 3
          </Link>

          <p className="charge-secure-note">Pago 100% seguro</p>
        </aside>
      </div>
    </section>
  )
}

export default NotaryRegisterPaymentPage
