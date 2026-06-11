import { Link } from 'react-router-dom'
import StepProgress from '../components/shared/StepProgress'

function NotaryRegisterAccountPage() {
  return (
    <section className="flow-page register-page">
      <div className="register-title-wrap">
        <h1>Registro de Notario</h1>
        <p className="lead">Unase a la red digital de notarios mas confiable del pais.</p>
      </div>

      <StepProgress
        steps={['Informacion', 'Pago', 'Cuenta']}
        activeStep={3}
        completedSteps={[1, 2]}
        className="step-progress-register"
      />

      <article className="form-card register-card register-account-card">
        <div className="account-card-head">
          <span className="account-icon" aria-hidden="true">
            o
          </span>
          <div>
            <h2>Paso 3: Cuenta</h2>
            <p className="form-caption">
              Configure sus credenciales de acceso para finalizar el registro.
            </p>
          </div>
        </div>

        <form className="form-grid account-form" onSubmit={(event) => event.preventDefault()}>
          <label className="field field-wide">
            <span>Nombre completo</span>
            <input type="text" placeholder="Ej. Lic. Carlos Mendoza" />
          </label>

          <label className="field field-wide">
            <span>Correo electronico</span>
            <input type="email" placeholder="carlos.mendoza@email.com" />
          </label>

          <label className="field">
            <span>Contrasena</span>
            <input type="password" placeholder="******" />
          </label>

          <label className="field">
            <span>Confirmar contrasena</span>
            <input type="password" placeholder="******" />
          </label>
        </form>

        <Link to="/panel-notarial" className="cta-button account-submit-button">
          Finalizar registro
        </Link>
      </article>
    </section>
  )
}

export default NotaryRegisterAccountPage
