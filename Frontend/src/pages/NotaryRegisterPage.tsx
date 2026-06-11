import { Link } from 'react-router-dom'
import StepProgress from '../components/shared/StepProgress'

function NotaryRegisterPage() {
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
          Complete sus datos de colegiacion para habilitar el registro.
        </p>
        <form className="form-grid" onSubmit={(event) => event.preventDefault()}>
          <label className="field">
            <span>Nombre completo</span>
            <input type="text" placeholder="Ej. Lic. Carlos Mendoza" />
          </label>
          <label className="field">
            <span>Numero de notario</span>
            <input type="text" placeholder="Ej. 1029-TX" />
          </label>
          <label className="field">
            <span>Identificacion (DNI/Cedula)</span>
            <input type="text" placeholder="000-000000-0000" />
          </label>
          <label className="field">
            <span>Ubicacion de notaria</span>
            <select defaultValue="Ciudad de Mexico">
              <option>Ciudad de Mexico</option>
              <option>Monterrey</option>
              <option>Guadalajara</option>
              <option>Queretaro</option>
            </select>
          </label>
          <label className="field field-wide">
            <span>Email institucional</span>
            <input type="email" placeholder="notario@despacho.com" />
          </label>
        </form>
      </article>
      <div className="page-actions">
        <Link to="/nuevo-notario/pago" className="cta-button cta-large">
          Continuar
        </Link>
      </div>
    </section>
  )
}

export default NotaryRegisterPage
