import StepProgress from '../components/shared/StepProgress'

function WillFormPage() {
  return (
    <section className="flow-page">
      <h1>Crea tu documento base de testamento</h1>
      <p className="lead">
        Completa tus datos personales para iniciar el borrador legal.
      </p>
      <StepProgress
        steps={['Datos', 'Herederos', 'Bienes', 'Albacea', 'Confirmacion']}
        activeStep={1}
      />
      <article className="form-card">
        <h2>Datos personales</h2>
        <form className="form-grid" onSubmit={(event) => event.preventDefault()}>
          <label className="field">
            <span>Nombre completo</span>
            <input type="text" placeholder="Ej. Juan Perez Garcia" />
          </label>
          <label className="field">
            <span>Fecha de nacimiento</span>
            <input type="date" />
          </label>
          <label className="field">
            <span>Nacionalidad</span>
            <input type="text" placeholder="Ej. Espanola" />
          </label>
          <label className="field">
            <span>Estado civil</span>
            <select defaultValue="Soltero">
              <option>Soltero</option>
              <option>Casado</option>
              <option>Union civil</option>
              <option>Divorciado</option>
            </select>
          </label>
          <label className="field field-wide">
            <span>Direccion de residencia</span>
            <input type="text" placeholder="Calle, numero, piso, ciudad" />
          </label>
          <label className="field">
            <span>Numero de identificacion</span>
            <input type="text" placeholder="12345678X" />
          </label>
        </form>
      </article>
      <div className="page-actions">
        <button type="button" className="cta-button cta-large">
          Siguiente
        </button>
      </div>
    </section>
  )
}

export default WillFormPage
